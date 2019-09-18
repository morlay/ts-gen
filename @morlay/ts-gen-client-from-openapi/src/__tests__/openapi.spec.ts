import { ISchemaBasic, scan, simplifySchema } from "@morlay/ts-gen-definitions-from-json-schema";
import { writerOf } from "@morlay/ts-gen-core";
import * as fs from "fs";
import * as path from "path";
// @ts-ignore
import schemaJSON from "../../../../spec/schema.json";
// @ts-ignore
import openApiJSON from "../../../../spec/openapi.json";

test("#toOpenAPI", () => {
  const mergedSchema = simplifySchema(
    {
      ...openApiJSON,
      $id: "OpenAPI",
      id: undefined,
    },
    {
      "http://json-schema.org/draft-04/schema": schemaJSON as ISchemaBasic,
    },
  );

  const writer = writerOf();

  scan(writer, mergedSchema);

  fs.writeFileSync(path.resolve(__dirname, "../OpenAPI.ts"), `${writer.output()}\n`);
});
