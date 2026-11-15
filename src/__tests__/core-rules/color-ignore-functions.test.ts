import { describe, it, expect } from 'vitest';
import recommended from '../../recommended.js';
import customSyntax from '../../syntax.js';
import { lintSass, stylelintAtLeast } from './lint.js';

const SOURCE =
  '$base: #336699\n.a\n  color: red\n  background: color.adjust(#fff, $lightness: -5%)\n';

describe('color-named and color-no-hex on .sass', () => {
  // sass-parser writes colors in `decl.value` as hex: `red` becomes `#ff0000`.
  it('read normalized color values from sass-parser', () => {
    const values: string[] = [];
    customSyntax.parse(SOURCE).walkDecls((decl) => {
      values.push(decl.value);
    });
    expect(values).toEqual(['#336699', '#ff0000', 'color.adjust(#ffffff, $lightness: -5%)']);
  });

  it('color-named never sees a named color', async () => {
    const { problems } = await lintSass(SOURCE, { 'color-named': 'never' });
    expect(problems).toEqual([]);
  });

  it('color-no-hex reports a named color as hex', async () => {
    const { problems } = await lintSass(SOURCE, { 'color-no-hex': true });
    expect(problems.map(({ text, line }) => ({ text, line }))).toEqual([
      { text: 'Disallowed hex color "#336699" (color-no-hex)', line: 1 },
      { text: 'Disallowed hex color "#ff0000" (color-no-hex)', line: 3 },
      { text: 'Disallowed hex color "#ffffff" (color-no-hex)', line: 4 },
    ]);
  });

  // `ignoreFunctions` arrived in stylelint 17.15.0.
  it.skipIf(!stylelintAtLeast(17, 15))(
    'color-no-hex skips colors inside a function listed in ignoreFunctions',
    async () => {
      const { problems, invalidOptions } = await lintSass(SOURCE, {
        'color-no-hex': [true, { ignoreFunctions: ['/^color\\./'] }],
      });
      expect(invalidOptions).toEqual([]);
      expect(problems.map(({ line }) => line)).toEqual([1, 3]);
    },
  );

  // sass/no-color-literals reads the source text, so it is the color rule for .sass.
  it('both stay out of recommended, which uses sass/no-color-literals', () => {
    expect(recommended.rules).not.toHaveProperty('color-named');
    expect(recommended.rules).not.toHaveProperty('color-no-hex');
    expect(recommended.rules['sass/no-color-literals']).toBe(true);
  });
});
