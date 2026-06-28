#!/usr/bin/env node
/**
 * Génère js/main.js — bundle unique compatible file://
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'js/main.js');

const FILES = [
  'js/core/storage.js',
  'js/utils/helpers.js',
  'js/data/prep-cda.js',
  'js/data/navigation.js',
  'js/utils/search.js',
  'js/views/prep-cda.js',
  'js/core/router.js',
  'js/app.js',
];

function transform(code) {
  code = code.replace(/^import\s[\s\S]*?;\s*$/gm, '');
  code = code.replace(/export\s+async\s+function/g, 'async function');
  code = code.replace(/export\s+function/g, 'function');
  code = code.replace(/export\s+const/g, 'const');
  code = code.replace(/export\s*\{[\s\S]*?\};?\s*/g, '');
  return code;
}

let output = `/* Préparation entretien CDA — bundle file:// compatible */\n(function () {\n'use strict';\n\n`;

for (const file of FILES) {
  const code = fs.readFileSync(path.join(ROOT, file), 'utf8');
  output += `\n/* --- ${file} --- */\n`;
  output += transform(code);
  output += '\n';
}

output += `\n})();\n`;

fs.writeFileSync(OUT, output);
console.log(`✅ ${OUT} généré (${(output.length / 1024).toFixed(0)} Ko)`);
