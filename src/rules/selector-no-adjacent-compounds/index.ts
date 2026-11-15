/**
 * Rule: `sass/selector-no-adjacent-compounds`
 *
 * Disallow two compound selectors written next to each other without whitespace or a
 * combinator, such as `[class]a`. CSS never allowed it, Dart Sass 1.100 deprecates it, and
 * Dart Sass 2.0 makes it an error.
 *
 * @example
 * ```sass
 * // BAD: a type selector follows an attribute selector
 * [class]a
 *   color: red
 *
 * // GOOD: the type selector comes first
 * a[class]
 *   color: red
 * ```
 */
import stylelint from 'stylelint';

const { createPlugin, utils } = stylelint;

/** Fully qualified rule name including the plugin namespace. */
const ruleName = 'sass/selector-no-adjacent-compounds';

/** Rule metadata for documentation linking. */
const meta = {
  url: 'https://github.com/theagenticengineer/stylelint-sass/blob/main/docs/rules/selector-no-adjacent-compounds.md',
};

/**
 * Diagnostic messages produced by this rule.
 *
 * @param before - The simple selector that ends the first compound, such as `[class]`
 * @param after - The selector that starts the second compound, such as `a`
 */
const messages = utils.ruleMessages(ruleName, {
  rejected: (before: string, after: string) =>
    `Expected whitespace or a combinator between "${before}" and "${after}"`,
});

/**
 * A character that starts a type selector or its namespace prefix (`|`). Dart Sass 1.108
 * accepts a universal selector right after a compound, such as `[x]*`, so `*` is left out.
 */
const TYPE_START = /[a-zA-Z_\-\\|]|[^\p{ASCII}]/u;

/** A character that continues an identifier. */
const IDENT_CHAR = /[a-zA-Z0-9_\-\\]|[^\p{ASCII}]/u;

/** One adjacent pair found in a selector's source. */
interface Adjacency {
  /** Offset in the selector source where the second compound starts. */
  start: number;
  /** Offset in the selector source just after the second compound's first selector. */
  end: number;
  /** The simple selector that ends the first compound. */
  before: string;
  /** The selector that starts the second compound. */
  after: string;
}

/**
 * Reads the selector of an indented-syntax rule from its source: everything up to the first
 * line break that does not follow a comma, outside brackets, strings and interpolation.
 *
 * sass-parser rewrites `[class]a` to `[class] a` in `rule.selector`, so only the source shows
 * the missing whitespace.
 *
 * @param css - The whole input
 * @param offset - The offset where the rule starts
 * @returns The selector as written
 */
function selectorSource(css: string, offset: number): string {
  let depth = 0;
  let quote = '';
  let lastSignificant = '';
  for (let i = offset; i < css.length; i++) {
    const char = css[i]!;
    if (quote) {
      if (char === '\\') i++;
      else if (char === quote) quote = '';
      continue;
    }
    if (char === '"' || char === "'") quote = char;
    else if (char === '(' || char === '[' || char === '{') depth++;
    else if (char === ')' || char === ']' || char === '}') depth--;
    else if (depth === 0 && char === '/' && css[i + 1] === '/') return css.slice(offset, i);
    else if (depth === 0 && char === '\n' && lastSignificant !== ',') {
      return css.slice(offset, i);
    }
    if (!/\s/.test(char)) lastSignificant = char;
  }
  return css.slice(offset);
}

/**
 * Finds every place in a selector where a compound ends with `]` or `)` and the next compound
 * starts right after it with a type selector.
 *
 * @param selector - The selector as written
 * @returns The adjacent pairs, in source order
 */
function findAdjacencies(selector: string): Adjacency[] {
  const found: Adjacency[] = [];
  const openers: number[] = [];
  let quote = '';
  let interpolation = 0;
  for (let i = 0; i < selector.length; i++) {
    const char = selector[i]!;
    if (quote) {
      if (char === '\\') i++;
      else if (char === quote) quote = '';
      continue;
    }
    if (char === '#' && selector[i + 1] === '{') {
      interpolation++;
      i++;
      continue;
    }
    if (interpolation > 0) {
      if (char === '{') interpolation++;
      else if (char === '}') interpolation--;
      continue;
    }
    if (char === '\\') {
      i++;
      continue;
    }
    if (char === '"' || char === "'") quote = char;
    else if (char === '[' || char === '(') openers.push(i);
    else if (char === ']' || char === ')') {
      const open = openers.pop() ?? 0;
      const next = selector[i + 1];
      if (next === undefined || !TYPE_START.test(next)) continue;
      // A functional pseudo-class owns the name before its parenthesis, such as `:not`.
      let begin = open;
      if (char === ')') {
        while (begin > 0 && IDENT_CHAR.test(selector[begin - 1]!)) begin--;
        while (begin > 0 && selector[begin - 1] === ':') begin--;
      }
      let end = i + 2;
      while (end < selector.length && IDENT_CHAR.test(selector[end]!)) end++;
      found.push({
        start: i + 1,
        end,
        before: selector.slice(begin, i + 1),
        after: selector.slice(i + 1, end),
      });
    }
  }
  return found;
}

/**
 * Converts an offset in the input into a 1-based line and column.
 *
 * @param css - The whole input
 * @param offset - Characters from the start of the input
 * @returns The 1-based line and column of that character
 */
function positionAt(css: string, offset: number): { line: number; column: number } {
  const before = css.slice(0, offset);
  const line = before.split('\n').length;
  return { line, column: offset - before.lastIndexOf('\n') };
}

/**
 * Stylelint rule function for `sass/selector-no-adjacent-compounds`.
 *
 * @param primary - The primary option (boolean `true` to enable)
 * @returns A PostCSS plugin callback that walks rule nodes
 */
const ruleFunction: stylelint.Rule = (primary) => {
  return (root, result) => {
    const validOptions = utils.validateOptions(result, ruleName, { actual: primary });
    if (!validOptions) return;

    root.walkRules((rule) => {
      const start = rule.source?.start?.offset;
      const css = rule.source?.input.css;
      if (start === undefined || css === undefined) return;

      for (const adjacency of findAdjacencies(selectorSource(css, start))) {
        utils.report({
          message: messages.rejected(adjacency.before, adjacency.after),
          node: rule,
          result,
          ruleName,
          start: positionAt(css, start + adjacency.start),
          end: positionAt(css, start + adjacency.end),
        });
      }
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
