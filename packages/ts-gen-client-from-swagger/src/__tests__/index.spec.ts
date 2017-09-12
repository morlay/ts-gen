import {
  IJSONSchema,
  toDeclarations,
  toSingleSchema,
} from "@morlay/ts-gen-definitions-from-json-schema"
import * as fs from "fs"
import * as path from "path"

import {
  getClientMain,
  getDefinitions,
} from "../"
import petsSwaggerJSON from "./examples/pets"
import schemaJSON from "./fixtures/schema"
import swaggerJSON from "./fixtures/swagger"

describe("ts-gen-client-from-swagger", () => {
  it("#toSwagger", () => {
    const mergedSchema = toSingleSchema(swaggerJSON, {
      "http://json-schema.org/draft-04/schema": schemaJSON as IJSONSchema,
    })

    const result = toDeclarations({
      ...mergedSchema,
      id: "Swagger",
    })

    fs.writeFileSync(path.resolve(__dirname, "../interfaces/Swagger.ts"), `${result}\n`)
  })

  it("#toClient", () => {
    const definitions = getDefinitions(petsSwaggerJSON)
    const requests = getClientMain(petsSwaggerJSON, {
      clientId: "pets",
      clientLib: {
        path: "../utils",
        method: "createRequest",
      },
    })

    fs.writeFileSync(path.resolve(__dirname, "./examples/clients/definitions.ts"), `${definitions}\n`)
    fs.writeFileSync(path.resolve(__dirname, "./examples/clients/index.ts"), `${requests}\n`)
  })
})
