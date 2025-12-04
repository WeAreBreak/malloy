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

import {DefinitionList} from '../types/definition-list';
import type {QueryItem} from '../types/query-item';
import type {QueryPropertyInterface} from '../types/query-property-interface';
import {
  LegalRefinementStage,
  QueryClass,
} from '../types/query-property-interface';
import {ExprIdReference} from "../expressions/expr-id-reference";
import {visitEachChild} from "../ast-utils";
import {AggregateFieldDeclaration, FieldDefinitionValue} from "../query-items/field-declaration";

export class Aggregate
  extends DefinitionList<QueryItem>
  implements QueryPropertyInterface
{
  elementType = 'aggregateList';
  readonly queryRefinementStage = LegalRefinementStage.Single;
  readonly forceQueryClass = QueryClass.Grouping;
  constructor(aggregateList: QueryItem[]) {
    super(aggregateList);
    const replaceMatrix = new Map();
    for (const element of this.elements) {
      visitEachChild(element, ExprIdReference, (child: ExprIdReference) => {
        const name = child.fieldReference.nameString;
        if (replaceMatrix.has(name)) {
          return replaceMatrix.get(name).expr;
        } else {
          return false;
        }
      });
      replaceMatrix.set(
        (element as AggregateFieldDeclaration).defineName,
        element
      );
    }
  }
}
