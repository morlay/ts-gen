import * as fs from "fs";
import * as lodash from "lodash";
import * as path from "path";
import { toDeclarations } from "../";
import schemaJSON from "./fixtures/schema";
import testJSON from "./fixtures/test";

it("#toSchema", () => {
  const result = toDeclarations(
    lodash.assign(schemaJSON, {
      $id: "JSONSchema",
    }),
  );

  fs.writeFileSync(path.resolve(__dirname, "../interfaces/JSONSchema.ts"), `${result}\n`);
});

it("#toTest", () => {
  const result = toDeclarations(
    lodash.assign(testJSON, {
      $id: "test",
    }),
  );

  fs.writeFileSync(path.resolve(__dirname, `../interfaces/Test.ts`), `${result}\n`);
});
