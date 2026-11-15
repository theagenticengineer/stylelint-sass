import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
  engines: { node: string };
  peerDependencies: Record<string, string>;
};

/**
 * Reads `major.minor` of an installed dependency.
 *
 * @param name - The package name
 * @returns The major and minor version numbers
 */
function installed(name: string): [number, number] {
  const manifest = join(root, 'node_modules', name, 'package.json');
  const { version } = JSON.parse(readFileSync(manifest, 'utf8')) as { version: string };
  const [major, minor] = version.split('.').map(Number);
  return [major!, minor!];
}

describe('supported versions', () => {
  it('declares stylelint 17.8 through 18 as the peer range', () => {
    expect(pkg.peerDependencies.stylelint).toBe('>=17.8.0 <19');
  });

  it('declares sass-parser 0.4 and 0.5 as the peer range', () => {
    expect(pkg.peerDependencies['sass-parser']).toBe('>=0.4 <0.6');
  });

  it('declares the Node.js floor of stylelint 17.8', () => {
    expect(pkg.engines.node).toBe('>=20.19.0');
  });

  // CI runs this suite on both ends of each range, so the installed versions must sit inside.
  it('runs on a stylelint inside the peer range', () => {
    const [major, minor] = installed('stylelint');
    expect(major === 18 || (major === 17 && minor >= 8)).toBe(true);
  });

  it('runs on a sass-parser inside the peer range', () => {
    const [major, minor] = installed('sass-parser');
    expect(major === 0 && (minor === 4 || minor === 5)).toBe(true);
  });
});
