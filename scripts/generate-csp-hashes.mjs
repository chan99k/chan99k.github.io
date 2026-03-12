/**
 * Post-build script: Extract inline script/style hashes from built HTML
 * and replace 'unsafe-inline' in netlify.toml CSP header with hash directives.
 *
 * Idempotent: works whether netlify.toml has 'unsafe-inline' or existing hashes.
 * On Netlify CI, the build starts from clean git state (always 'unsafe-inline').
 * Locally, repeated builds also work correctly.
 *
 * Usage: node scripts/generate-csp-hashes.mjs
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

const DIST_DIR = "dist";
const TOML_FILE = "netlify.toml";

function findHtmlFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findHtmlFiles(full));
    } else if (entry.name.endsWith(".html")) {
      results.push(full);
    }
  }
  return results;
}

function extractHashes(htmlFiles) {
  const scriptHashes = new Set();
  const styleHashes = new Set();

  const scriptRegex = /<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;

  for (const file of htmlFiles) {
    const html = readFileSync(file, "utf-8");

    let match;
    while ((match = scriptRegex.exec(html)) !== null) {
      const content = match[1];
      if (content.trim()) {
        const hash = createHash("sha256").update(content).digest("base64");
        scriptHashes.add(`'sha256-${hash}'`);
      }
    }
    scriptRegex.lastIndex = 0;

    while ((match = styleRegex.exec(html)) !== null) {
      const content = match[1];
      if (content.trim()) {
        const hash = createHash("sha256").update(content).digest("base64");
        styleHashes.add(`'sha256-${hash}'`);
      }
    }
    styleRegex.lastIndex = 0;
  }

  return { scriptHashes, styleHashes };
}

function updateNetlifyToml(scriptHashes, styleHashes) {
  let toml = readFileSync(TOML_FILE, "utf-8");

  const scriptHashStr = [...scriptHashes].join(" ");
  const styleHashStr = [...styleHashes].join(" ");

  // Replace script-src directive value (matches 'unsafe-inline' or existing hashes)
  toml = toml.replace(
    /script-src 'self' (?:'unsafe-inline'|(?:'sha256-[A-Za-z0-9+/=]+'\s*)+)/,
    `script-src 'self' ${scriptHashStr}`
  );

  // Replace style-src directive value (matches 'unsafe-inline' or existing hashes)
  toml = toml.replace(
    /style-src 'self' (?:'unsafe-inline'|(?:'sha256-[A-Za-z0-9+/=]+'\s*)+)/,
    `style-src 'self' ${styleHashStr}`
  );

  writeFileSync(TOML_FILE, toml, "utf-8");
}

// Main
const htmlFiles = findHtmlFiles(DIST_DIR);
const { scriptHashes, styleHashes } = extractHashes(htmlFiles);

console.log(`[CSP] Scanned ${htmlFiles.length} HTML files`);
console.log(`[CSP] Found ${scriptHashes.size} unique script hashes`);
console.log(`[CSP] Found ${styleHashes.size} unique style hashes`);

updateNetlifyToml(scriptHashes, styleHashes);

console.log(`[CSP] Updated ${TOML_FILE} — CSP hashes applied`);
