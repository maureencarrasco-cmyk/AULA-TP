'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { parse, parseFragment, serialize } = require('parse5');

const input = process.argv[2];
if (!input) throw new Error('Usage: node scripts/build_approved_home.cjs <current-public-home.html>');
const root = path.resolve(__dirname, '..');
const prefix = '/home-assets/20261013-646f89d/';
const current = parse(fs.readFileSync(input, 'utf8'));
const approved = parse(fs.readFileSync(path.join(root, 'static/landing-home-preview.html'), 'utf8'));
const attr = (node, name) => node.attrs?.find(item => item.name === name)?.value;
const hasClass = (node, name) => (attr(node, 'class') || '').split(/\s+/).includes(name);
function find(node, predicate) {
  if (predicate(node)) return node;
  for (const child of node.childNodes || []) {
    const result = find(child, predicate);
    if (result) return result;
  }
}
function visit(node, callback) {
  callback(node);
  for (const child of [...(node.childNodes || [])]) visit(child, callback);
}
function detach(node) {
  if (!node?.parentNode) return;
  const children = node.parentNode.childNodes;
  children.splice(children.indexOf(node), 1);
}
function replace(oldNode, newNode) {
  if (!oldNode || !newNode) throw new Error('Required homepage section missing');
  detach(newNode);
  const parent = oldNode.parentNode;
  parent.childNodes.splice(parent.childNodes.indexOf(oldNode), 1, newNode);
  newNode.parentNode = parent;
}
const hero = find(approved, node => attr(node, 'id') === 'inicio');
visit(hero, node => {
  for (const item of node.attrs || []) {
    if (item.value.startsWith('/static/landing-preview-assets/')) {
      item.value = prefix + item.value.slice('/static/landing-preview-assets/'.length);
    }
  }
});
replace(find(current, node => attr(node, 'id') === 'inicio'), hero);
visit(current, node => {
  if (['mision-laboral', 'producto', 'como'].includes(attr(node, 'id')) ||
      hasClass(node, 'capabilities') || hasClass(node, 'visual-footer')) detach(node);
  const href = attr(node, 'href') || '';
  const src = attr(node, 'src') || '';
  if ((node.tagName === 'link' && /\/landing\/(aula-tp-coherence|landing-hero)\.css/.test(href)) ||
      (node.tagName === 'script' && src.includes('/landing/aula-tp-coherence.js'))) detach(node);
});
// The approved banner precedes the community section; the legacy script cannot
// insert it after the product section once that section has been removed.
if (!find(current, node => hasClass(node, 'curriculum-foundation'))) {
  const banner = find(approved, node => hasClass(node, 'curriculum-foundation'));
  const image = find(banner, node => node.tagName === 'img');
  image.attrs.find(item => item.name === 'src').value = '/images/programas-estudio/base-curricular-banner.png';
  detach(banner);
  const community = find(current, node => attr(node, 'id') === 'comunidad');
  const parent = community.parentNode;
  parent.childNodes.splice(parent.childNodes.indexOf(community), 0, banner);
  banner.parentNode = parent;
}
const body = find(current, node => node.tagName === 'body');
const styles = ['aula-tp-coherence.css', 'landing-home-width.css', 'landing-home-actions.css', 'landing-home-demo.css', 'landing-home-videos.css'];
const fragment = parseFragment(styles.map(file => `<link rel="stylesheet" href="${prefix}${file}">`).join('\n') +
  `\n<script src="${prefix}aula-tp-coherence.js" defer></script>`);
for (const node of fragment.childNodes) {
  body.childNodes.push(node);
  node.parentNode = body;
}
fs.writeFileSync(path.join(root, 'landing/portada-publica.html'), serialize(current).replace(/[ \t]+$/gm, '') + '\n');
const files = ['portada-publica.html', 'aula-tp-coherence.js', ...styles, 'hero-estudiante-recorte.png', 'aula-tp-presentacion.mp4', 'aula-tp-presentacion-poster.jpg', 'aula-tp-invitacion.mp4', 'aula-tp-invitacion-poster.jpg'];
const manifest = [...new Set(files)].map(file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'landing', file))).digest('hex') + '  ' + file).join('\n') + '\n';
fs.writeFileSync(path.join(root, 'landing/portada-publica.sha256'), manifest);
console.log('Approved homepage prepared; original header, forms and community links retained.');
