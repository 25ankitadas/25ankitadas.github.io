import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';

const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');

test('static shell has landmarks and local assets', () => {
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /<nav\b[^>]*aria-label="Sections"/);
  assert.match(html, /<main\b[^>]*id="main"/);
  assert.match(html, /<footer\b/);
  const body = html.slice(html.indexOf('<body'));
  assert.match(body.match(/<(a|button)\b[^>]*>/)?.[0] || '', /href="#main"/);
  assert.doesNotMatch(html, /<script[^>]+src="https?:/);
  assert.doesNotMatch(html, /https?:\/\/fonts\./);
});

const text = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').replace(/<[^>]*>/g, ' ').replace(/&#39;|&#x27;/g, "'").replace(/&quot;|&#34;/g, '"').replace(/&amp;/g, '&').replace(/\s+/g, ' ');

test('portfolio preserves supplied content and section order', () => {
  assert.deepEqual([...html.matchAll(/<section\b[^>]*id="([^"]+)"/g)].map(m => m[1]), ['about', 'publications', 'news', 'education', 'reviewing', 'contact']);
  const copy = [
    'Hi, I am Ankita Das, a fourth-year Ph.D. scholar in the Department of Computer Science and Engineering at the Indian Institute of Technology Hyderabad, working under the guidance of Prof. C. Krishna Mohan.',
    'My research focuses on parameter-efficient federated learning using Mamba-based models for medical image analysis, with an emphasis on communication-efficient model adaptation across distributed healthcare institutions.',
    'Before joining IIT Hyderabad, I completed my M.Tech. in Computer Science and Engineering from the National Institute of Technology Durgapur in 2022.',
    'Computer Vision', 'Machine Learning and Deep Learning', 'Medical Image Analysis', 'Image and Video Processing', 'Federated Learning', 'Multimodal Learning', 'Vision-Language Models', 'Open Set Recognition', 'CNN Foundation Models', 'Generative AI',
    'FedGCR: Federated Open Set Recognition Using Gaussian Noise in Client Representations',
    'Accepted at the International Joint Conference on Neural Networks (IJCNN 2026).',
    'FedSSMCoOp: SSM Encoders for Light-weight Federated Prompt Learning for Few-shot Classification',
    'arXiv preprint, 2026.',
    'Attended the ANRF PAIR Workshop on Artificial Intelligence.',
    'Our paper "FedGCR: Federated Open Set Recognition Using Gaussian Noise in Client Representations" was accepted at IJCNN 2026.',
    'Attended the Sakura Science Program at Ehime University, Japan, where I worked on sports data analytics.',
    'Ph.D., Computer Science and Engineering', 'Indian Institute of Technology Hyderabad', '2023 to 2028',
    'M.Tech., Computer Science and Engineering', 'National Institute of Technology Durgapur', '2020 to 2022',
    'B.Tech., Computer Science and Engineering', 'Budge Budge Institute of Technology', '2015 to 2019',
    'Visual Computing', 'Teaching Assistant', 'January to May 2026', 'Prof. C. Krishna Mohan',
    'International Joint Conference on Neural Networks (IJCNN), 2026',
    'IEEE 6th International Conference on Applied Electromagnetics, Signal Processing, and Communication, 2026',
    'LREC 2026: Language Resources and Evaluation Conference, 2026',
  ];
  for (const value of copy) assert.ok(text.includes(value), `Missing source copy: ${value}`);
  const pubs = html.match(/<section\b[^>]*id="publications"[\s\S]*?<\/section>/)?.[0] || '';
  assert.equal((pubs.match(/href=/g) || []).length, 1);
  assert.ok(pubs.indexOf('FedGCR:') < pubs.indexOf('FedSSMCoOp:'));
  assert.match(pubs, /href="https:\/\/arxiv.org\/abs\/2610.09907"/);
  const times = [...html.matchAll(/<time\b[^>]*datetime="([^"]+)"[^>]*>([^<]+)<\/time>/g)].map(m => [m[1], m[2]]);
  assert.deepEqual(times, [['2026-04-13', '13 April 2026'], ['2026-03-20', '20 March 2026'], ['2025-12-08', '8 December 2025']]);
  for (const href of ['mailto:cs23resch01003@iith.ac.in', 'https://www.linkedin.com/in/ankita-das-3a5085225/', 'https://scholar.google.com/citations?user=6x-ggCoAAAAJ&amp;hl=en']) assert.ok(html.includes(`href="${href}"`), href);
  assert.match(html, /<img\b[^>]*width="560"[^>]*height="700"/);
  assert.match(html, /alt="Portrait of Ankita Das"/);
  assert.match(html, /src="[^"]+\.webp"/);
  assert.doesNotMatch(html, /href="(?:|#|https:\/\/example.com)"/);
  assert.doesNotMatch(text, /coming soon|lorem ipsum|CGPA|FedMoE|TBD/);
  let previous = 0;
  for (const [, level] of html.matchAll(/<h([1-6])\b/g)) {
    assert.ok(Number(level) <= previous + 1, `Skipped from h${previous} to h${level}`);
    previous = Number(level);
  }
});
