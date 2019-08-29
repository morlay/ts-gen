import * as lodash from "lodash";
import { IJSONSchema } from "../interfaces";
import { toTypings } from "../Typings";

export interface ICase {
  schema: IJSONSchema;
  result: string;
}

const rules = {
  allOf: require("./rules/allOf"),
  any: require("./rules/any"),
  anyOf: require("./rules/anyOf"),
  array: require("./rules/array"),
  boolean: require("./rules/boolean"),
  enum: require("./rules/enum"),
  null: require("./rules/null"),
  number: require("./rules/number"),
  object: require("./rules/object"),
  oneOf: require("./rules/oneOf"),
  ref: require("./rules/ref"),
  string: require("./rules/string"),
};

describe("typings", () => {
  lodash.forEach(rules, ({ cases }, filename) => {
    lodash.forEach(cases, (caseItem: ICase, idx) => {
      test(`${filename} ${idx}`, () => {
        expect(String(toTypings(caseItem.schema))).toEqual(caseItem.result);
      });
    });
  });
});
