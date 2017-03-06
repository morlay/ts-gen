import { test } from "ava";
import * as fs from "fs";
import schemaJSON from "./helpers/fixtures/schema";
import swaggerJSON from "./helpers/fixtures/swagger";
import petsSwaggerJSON from "./helpers/examples/pets";

import {
  toDeclarations,
  toSingleSchema,
  IJSONSchema
} from "@morlay/ts-gen-definitions-from-json-schema";

import {
  getDefinitions,
  getClientMain,
} from "../"

test("#toSwagger", () => {
  const mergedSchema = toSingleSchema(swaggerJSON, {
    "http://json-schema.org/draft-04/schema": schemaJSON as IJSONSchema,
  });

  const result = toDeclarations({
    ...mergedSchema,
    id: "Swagger",
  });

  fs.writeFileSync("src/interfaces/Swagger.ts", `${result}\n`);
});

test("#toClient", () => {
  const definitions = getDefinitions(petsSwaggerJSON);
  const requests = getClientMain(petsSwaggerJSON, {
    clientId: "pets",
    clientLib: {
      path: "../utils",
      method: "createRequest"
    }
  });

  fs.writeFileSync("src/__tests__/helpers/examples/clients/definitions.ts", `${definitions}\n`);
  fs.writeFileSync("src/__tests__/helpers/examples/clients/index.ts", `${requests}\n`);
});
