import { test } from "ava";
import * as lodash from "lodash";
import * as fs from "fs";
import schemaJSON from "./helpers/fixtures/schema";
import testJSON from "./helpers/fixtures/test";
import { toDeclarations } from "../index";

test("#toSchema", () => {
  const result = toDeclarations(lodash.assign(schemaJSON, {
    id: "JSONSchema",
  }));

  fs.writeFileSync("src/interfaces/JSONSchema.ts", `${result}\n`);
});

test("#toTest", () => {
  const result = toDeclarations(lodash.assign(testJSON, {
    id: "test",
  }));

  fs.writeFileSync("src/interfaces/Test.ts", `${result}\n`);
});
