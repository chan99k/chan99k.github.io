/**
 * Post-build script: Extract inline script/style hashes from built HTML
 * and replace 'unsafe-inline' in dist/_headers with CSP hash directives.
 *
 * Usage: node scripts/generate-csp-hashes.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

const DIST_DIR = "dist";
const HEADERS_FILE = join(DIST_DIR, "_headers");

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

  // Match inline <script> without src attribute
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

function updateHeaders(scriptHashes, styleHashes) {
  let headers = readFileSync(HEADERS_FILE, "utf-8");

  const scriptHashStr = [...scriptHashes].join(" ");
  const styleHashStr = [...styleHashes].join(" ");

  // Replace 'unsafe-inline' in script-src with hashes
  headers = headers.replace(
    /script-src\s+'self'\s+'unsafe-inline'/,
    `script-src 'self' ${scriptHashStr}`
  );

  // Replace 'unsafe-inline' in style-src with hashes
  headers = headers.replace(
    /style-src\s+'self'\s+'unsafe-inline'/,
    `style-src 'self' ${styleHashStr}`
  );

  writeFileSync(HEADERS_FILE, headers, "utf-8");
}

// Main
const htmlFiles = findHtmlFiles(DIST_DIR);
const { scriptHashes, styleHashes } = extractHashes(htmlFiles);

console.log(`[CSP] Scanned ${htmlFiles.length} HTML files`);
console.log(`[CSP] Found ${scriptHashes.size} unique script hashes`);
console.log(`[CSP] Found ${styleHashes.size} unique style hashes`);

updateHeaders(scriptHashes, styleHashes);

console.log(`[CSP] Updated ${HEADERS_FILE} — 'unsafe-inline' replaced with hashes`);
