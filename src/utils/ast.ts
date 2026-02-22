/**
 * PostCSS AST type guards.
 *
 * sass-parser produces a PostCSS-compatible AST, so walker callbacks
 * (`root.walk()`) receive the broad `ChildNode` union (Rule | AtRule |
 * Declaration | Comment). PostCSS declares `Node.type` as `string` rather
 * than a string literal, so TypeScript cannot narrow the union automatically
 * via `node.type === 'rule'`. Neither PostCSS nor sass-parser ship built-in
 * type guard functions, so we provide our own.
 */
import type { ChildNode, Rule, AtRule, Declaration } from 'postcss';

/**
 * Narrows a PostCSS `ChildNode` to `Rule` (a selector block).
 *
 * @param node - The PostCSS child node to check
 * @returns `true` if the node is a CSS rule
 *
 * @example
 * ```ts
 * root.walk((node) => {
 *   if (isRule(node)) console.log(node.selector);
 * });
 * ```
 */
export function isRule(node: ChildNode): node is Rule {
  return node.type === 'rule';
}

/**
 * Narrows a PostCSS `ChildNode` to `AtRule`.
 *
 * In a sass-parser AST this covers both standard CSS at-rules and
 * Sass-specific ones (`@mixin`, `@include`, `@use`, `@forward`, etc.).
 *
 * @param node - The PostCSS child node to check
 * @returns `true` if the node is an at-rule
 *
 * @example
 * ```ts
 * root.walk((node) => {
 *   if (isAtRule(node)) console.log(node.name);
 * });
 * ```
 */
export function isAtRule(node: ChildNode): node is AtRule {
  return node.type === 'atrule';
}

/**
 * Narrows a PostCSS `ChildNode` to `Declaration` (a property–value pair).
 *
 * @param node - The PostCSS child node to check
 * @returns `true` if the node is a CSS declaration
 *
 * @example
 * ```ts
 * root.walk((node) => {
 *   if (isDeclaration(node)) console.log(node.prop, node.value);
 * });
 * ```
 */
export function isDeclaration(node: ChildNode): node is Declaration {
  return node.type === 'decl';
}
