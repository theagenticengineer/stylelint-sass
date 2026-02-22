/**
 * Ordering utilities for rules that enforce child node order within rule blocks.
 *
 * Used by `extends-before-declarations`, `mixins-before-declarations`, and
 * `declarations-before-nesting` to classify and compare child nodes.
 */
import type { ChildNode } from 'postcss';
import { isAtRule, isDeclaration, isRule } from './ast.js';

/**
 * Classification of a child node within a rule block.
 */
export type ChildKind = 'extend' | 'include' | 'declaration' | 'nested-rule' | 'other';

/**
 * Classifies a PostCSS child node for ordering purposes.
 *
 * @param node - A child node within a rule block
 * @returns The classification of the node
 *
 * @example
 * ```ts
 * rule.each((child) => {
 *   const kind = classifyChild(child);
 *   if (kind === 'declaration') { ... }
 * });
 * ```
 */
export function classifyChild(node: ChildNode): ChildKind {
  if (isAtRule(node)) {
    if (node.name === 'extend') return 'extend';
    if (node.name === 'include') return 'include';
    return 'other';
  }
  if (isDeclaration(node)) return 'declaration';
  if (isRule(node)) return 'nested-rule';
  return 'other';
}
