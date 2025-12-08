/*
 * Copyright 2023 Google LLC
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { ExprIdReference } from "./expressions/expr-id-reference";
import type {ExprValue} from './types/expr-value';
import {MalloyElement} from "./types/malloy-element";

/**
 * When a translation hits an error, log and return one of these as a value.
 * This will allow the rest of the translation walk to complete. The
 * generated SQL will have a reference to an impossible variable name
 * with the reason embedded in it.
 * @param reason very short phrase, only read by implementers
 * @return Expr which a debugging humnan will regognize
 */
export function errorFor(reason: string): ExprValue {
  return {
    type: 'error',
    expressionType: 'scalar',
    value: {node: 'error', message: reason},
    evalSpace: 'constant',
    fieldUsage: [],
  };
}

export function replaceInNode(node, oldChild, newChild) {
  for(const key in node) {
    if(node[key] === oldChild) {
      node[key] = newChild;
    }
  }
}

export function visitEachChild(
  node: MalloyElement,
  kind,
  callback: (node) => MalloyElement | boolean
) {
  let i = 0;
  let children: unknown = node.children;
  let hasNode = true;
  if (!children) {
    if (Array.isArray(node)) {
      children = node;
      hasNode = false;
    } else return false;
  }
  if (Array.isArray(children)) {
    for (const child of children) {
      if (child instanceof kind) {
        const result = callback(child);
        if (result) {
          if (hasNode) replaceInNode(node, child, result);
          children[i] = result;
        }
      } else {
        visitEachChild(child, kind, callback);
      }
      i++;
    }
  } else if (typeof children === 'object') {
    for (const key in children) {
      const child = children[key];
      if (child instanceof kind) {
        const result = callback(child);
        if (result) {
          replaceInNode(node, child, result);
          children[key] = result;
        }
      } else {
        visitEachChild(child, kind, callback);
      }
      i++;
    }
  } else {
    return false;
  }
}
