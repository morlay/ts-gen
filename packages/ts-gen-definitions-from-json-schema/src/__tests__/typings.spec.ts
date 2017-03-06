import { test } from "ava";
import * as lodash from "lodash";
import * as requireDir from "require-dir";
import { IJSONSchema } from "../interfaces";
import { toTypings } from "../Typings";

export interface ICase {
  schema: IJSONSchema;
  result: string;
}

const rules = requireDir("./helpers/rules");

lodash.forEach(rules, ({ cases }, filename) => {
  lodash.forEach(cases, (caseItem: ICase, idx) => {
    test(`${filename} ${idx}`, (t) => {
      t.is(String(toTypings(caseItem.schema)), caseItem.result);
    });
  });
});
