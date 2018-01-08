import {
  IJSONSchema,
  toDeclarations,
  toSingleSchema,
} from "@morlay/ts-gen-definitions-from-json-schema"
import * as fs from "fs"
import * as path from "path"

import { getClient } from "../client"
import { getClient as getClientV3 } from "../client_v3"

import petsSwaggerJSON from "./examples/pets"
import petsOpenAPIJSON from "./examples/pets_v3"
import openApiJSON from "./fixtures/openapi"
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

  it("#toOpenAPI", () => {
    const mergedSchema = toSingleSchema(openApiJSON, {
      "http://json-schema.org/draft-04/schema": schemaJSON as IJSONSchema,
    })

    console.log(mergedSchema.definitions!["schema"].properties)

    const result = toDeclarations({
      ...mergedSchema,
      id: "OpenAPI",
    })

    fs.writeFileSync(path.resolve(__dirname, "../interfaces/OpenAPI.ts"), `${result}\n`)
  })

  it("#toClient", () => {
    const codes = getClient(petsSwaggerJSON, {
      clientId: "pets",
      clientLib: {
        path: "./utils",
        method: "createRequest",
      },
    })

    fs.writeFileSync(path.resolve(__dirname, "./examples/pets__client.ts"), codes)
  })

  it("#toClientV3", () => {
    const codes = getClientV3(petsOpenAPIJSON, {
      clientId: "pets",
      clientLib: {
        path: "./utils",
        method: "createRequest",
      },
    })

    fs.writeFileSync(path.resolve(__dirname, "./examples/pets_v3__client.ts"), codes)
  })
})
