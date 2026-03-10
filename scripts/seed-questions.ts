import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const QUESTIONS_DIR = path.join(process.cwd(), 'src/content/questions');

// Simple frontmatter parser (no gray-matter dependency)
function parseFrontmatter(raw: string): { data: Record<string, any>; content: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = raw.match(frontmatterRegex);

  if (!match) {
    return { data: {}, content: raw };
  }

  const [, frontmatter, content] = match;
  const data: Record<string, any> = {};

  // Parse YAML-like frontmatter
  const lines = frontmatter.split('\n');
  let currentKey = '';

  for (const line of lines) {
    const keyMatch = line.match(/^(\w+):\s*(.*)$/);
    if (keyMatch) {
      const [, key, value] = keyMatch;
      currentKey = key;

      // Handle different value types
      if (value.startsWith('"') && value.endsWith('"')) {
        // String
        data[key] = value.slice(1, -1);
      } else if (value.startsWith('[')) {
        // Array start
        const arrayMatch = value.match(/\[(.*)\]/);
        if (arrayMatch) {
          data[key] = arrayMatch[1]
            .split(',')
            .map(v => v.trim().replace(/^"|"$/g, ''))
            .filter(Boolean);
        } else {
          data[key] = [];
        }
      } else if (value) {
        // Plain value
        data[key] = value;
      }
    } else if (currentKey && line.trim().startsWith('-')) {
      // Array continuation
      if (!Array.isArray(data[currentKey])) {
        data[currentKey] = [];
      }
      const itemMatch = line.match(/^\s*-\s*"?(.+?)"?\s*$/);
      if (itemMatch) {
        data[currentKey].push(itemMatch[1]);
      }
    }
  }

  return { data, content: content.trim() };
}

async function seed() {
  const files = fs.readdirSync(QUESTIONS_DIR).filter(f => f.endsWith('.md'));

  console.log(`Found ${files.length} question files`);

  for (const file of files) {
    const raw = fs.readFileSync(path.join(QUESTIONS_DIR, file), 'utf-8');
    const { data, content } = parseFrontmatter(raw);

    // Extract explanation from markdown body (## 해설 section)
    const explanation = content.replace(/^##\s*해설\s*\n/m, '').trim();

    const questionData = {
      title: data.title,
      question: data.title,  // title IS the question
      answer: data.answer,
      explanation,
      category: data.category || 'general',
      difficulty: data.difficulty || 'junior',
      tags: data.tags ?? [],
      source: data.source ?? 'curated',
      hints: data.hints ?? [],
      related_posts: data.relatedPosts ?? [],
      is_active: true,
    };

    const { error } = await supabase.from('interview_questions').insert(questionData);

    if (error) {
      console.error(`Failed: ${file}`, error.message);
    } else {
      console.log(`Seeded: ${data.title}`);
    }
  }

  console.log('Seeding complete');
}

seed().catch(console.error);
