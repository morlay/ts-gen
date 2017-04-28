import { test } from "ava"
import * as fs from "fs"
import * as lodash from "lodash"
import { toDeclarations } from "../"
import schemaJSON from "./helpers/fixtures/schema"
import testJSON from "./helpers/fixtures/test"

test("#toSchema", (t) => {
  const result = toDeclarations(lodash.assign(schemaJSON, {
    id: "JSONSchema",
  }))

  fs.writeFileSync("src/interfaces/JSONSchema.ts", `${result}\n`)
  t.pass()
})

test("#toTest", (t) => {
  const result = toDeclarations(lodash.assign(testJSON, {
    id: "test",
  }))

  fs.writeFileSync("src/interfaces/Test.ts", `${result}\n`)
  t.pass()
})
