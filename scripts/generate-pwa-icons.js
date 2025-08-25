#!/usr/bin/env node

/**
 * PWA Icon Generator Script
 * Generates placeholder PWA icons for development
 * In production, replace with actual designed icons
 */

const fs = require('fs');
const path = require('path');

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(process.cwd(), 'public', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create SVG template for icons
const createSVGIcon = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#000000"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size/3}" fill="#ffffff"/>
  <text x="${size/2}" y="${size/2 + 8}" text-anchor="middle" fill="#000000" font-family="Arial, sans-serif" font-size="${size/8}" font-weight="bold">P</text>
</svg>
`.trim();

// Generate placeholder icons
iconSizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  const iconPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  
  fs.writeFileSync(iconPath, svgContent);
  console.log(`Generated icon: icon-${size}x${size}.svg`);
});

// Create placeholder screenshots
const createScreenshot = (width, height, name) => `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#f8f9fa"/>
  <rect x="0" y="0" width="${width}" height="80" fill="#000000"/>
  <text x="${width/2}" y="50" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="24" font-weight="bold">Portfolio Website</text>
  <rect x="20" y="100" width="${width-40}" height="200" fill="#e9ecef" rx="8"/>
  <text x="${width/2}" y="220" text-anchor="middle" fill="#495057" font-family="Arial, sans-serif" font-size="18">Personal Portfolio & Blog</text>
</svg>
`.trim();

// Generate screenshots
fs.writeFileSync(
  path.join(iconsDir, 'screenshot-wide.svg'),
  createScreenshot(1280, 720, 'wide')
);

fs.writeFileSync(
  path.join(iconsDir, 'screenshot-narrow.svg'),
  createScreenshot(640, 1136, 'narrow')
);

console.log('Generated screenshots: screenshot-wide.svg, screenshot-narrow.svg');
console.log('\nNote: These are placeholder SVG icons for development.');
console.log('For production, replace with properly designed PNG icons.');