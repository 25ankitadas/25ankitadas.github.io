import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';

const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');
const rgb = hex => hex.match(/[a-f\d]{2}/gi).map(value => parseInt(value, 16));
const luminance = color => color.map(value => {
  const channel = value / 255;
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}).reduce((sum, value, i) => sum + value * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);
const composite = (fg, bg, alpha) => fg.map((value, i) => value * alpha + bg[i] * (1 - alpha));

test('body and muted colors meet AA in both themes and card surfaces', () => {
  for (const selector of [':root', 'html.light']) {
    const block = css.slice(css.indexOf(selector));
    const tokens = block.slice(0, block.indexOf('}'));
    const value = name => rgb(tokens.match(new RegExp(`--${name}: (#[a-f0-9]{6})`))[1]);
    const bg = value('bg');
    const surface = tokens.match(/--surface: rgba\((\d+), (\d+), (\d+), ([\d.]+)\)/);
    const surfaceColor = surface.slice(1, 4).map(Number);
    const surfaceOpacity = Number(surface[4]);
    const card = composite(surfaceColor, bg, surfaceOpacity);
    const nodeOpacity = Number(tokens.match(/--node-opacity: ([\d.]+)/)?.[1] ?? 1);
    const network = [
      composite(value('node'), bg, nodeOpacity * 0.8),
      composite(value('node'), bg, nodeOpacity * 0.28),
      composite(value('accent'), bg, nodeOpacity * 0.9),
    ];
    const backgrounds = [bg, card, ...network, ...network.map(color => composite(surfaceColor, color, surfaceOpacity))];
    for (const role of ['text', 'muted']) for (const background of backgrounds) {
      assert.ok(contrast(value(role), background) >= 4.5, `${selector} ${role} contrast ${contrast(value(role), background).toFixed(2)}`);
    }
  }
});
