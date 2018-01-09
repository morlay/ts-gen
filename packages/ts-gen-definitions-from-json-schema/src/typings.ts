import {
  Decl,
  Identifier,
  ModuleExport,
  Type,
  Value,
} from "@morlay/ts-gen-core"
import * as lodash from "lodash"
import {
  IJSONSchema,
  ISimpleTypes,
} from "./interfaces"
import {
  isArrayType,
  isBooleanType,
  isNullType,
  isNumberType,
  isObjectType,
  isStringType,
  toSafeId,
  toUpperCamelCase,
} from "./utils"

const MAIN_SCHEMA_PLACEHOLDER = "MAIN_SCHEMA_PLACEHOLDER"

export const pickRefName = (schema: IJSONSchema): string => {
  if (schema.$ref === "#") {
    return MAIN_SCHEMA_PLACEHOLDER
  }
  const refName = lodash.last(lodash.split(schema.$ref || "", "/")) || ""
  return toSafeId(refName)
}

export const filterNonTypeSchemas = (schemas: IJSONSchema[]) =>
  lodash.filter(schemas, (schema) => !!lodash.keys(lodash.pick(schema, ["enum", "type", "$ref"])).length)

export const extendsableAllOfSchema = (schemas: IJSONSchema[]): [IJSONSchema | undefined, IJSONSchema[]] => {
  const refSchemas: IJSONSchema[] = []
  let objectSchema: IJSONSchema | undefined

  lodash.forEach(schemas, (schema) => {
    if (isObjectType(schema)) {
      objectSchema = schema
    }
    if (schema.$ref) {
      refSchemas.push(schema)
    }
  })

  return [objectSchema, refSchemas]
}

export const encode = (type: string) => `/**${encodeURIComponent(type)}**/`
export const decode = (encodedType: string): [string, string[]] => {
  const sideDefs: string[] = []
  const res: string = encodedType.replace(/\/\*\*([^\*\*\/]+)\*\*\//g, (_: any, $1) => {
    sideDefs.push(decodeURIComponent($1))
    return ""
  })
  return [res, sideDefs]
}

export const toTypings = (schema: IJSONSchema): Type => {
  if (schema.$ref) {
    return Type.of(pickRefName(schema))
  }

  if (schema.enum) {
    if (schema.id && schema.enum.length > 1 && lodash.isNaN(Number(schema.enum[0]))) {
      const id = Identifier.of(toUpperCamelCase(schema.id))
      return Type.of(
        `keyof typeof ${id}${encode(
          Decl.enum(
            id.valueOf(
              Type.enumOf(
                ...lodash.map(schema.enum, (value: any) =>
                  Identifier.of(value).valueOf(Identifier.of(JSON.stringify(value))),
                ),
              ),
            ),
          ).toString(),
        )}`,
      )
    }

    return Type.unionOf(...lodash.map(schema.enum, (value: any) => Type.of(Value.of(value))))
  }

  if (schema.allOf) {
    return Type.intersectionOf(...lodash.map(filterNonTypeSchemas(schema.allOf), toTypings))
  }

  if (lodash.isArray(schema.type)) {
    return Type.unionOf(...lodash.map(schema.type, (type: ISimpleTypes) => toTypings(lodash.assign(schema, { type }))))
  }

  if (schema.anyOf) {
    return Type.unionOf(...lodash.map(filterNonTypeSchemas(schema.anyOf), toTypings))
  }

  if (schema.oneOf) {
    // TODO xor not support
    return Type.unionOf(...lodash.map(filterNonTypeSchemas(schema.oneOf), toTypings))
  }

  // TODO find better way
  if (isObjectType(schema) && isArrayType(schema)) {
    return Type.any()
  }

  if (isObjectType(schema)) {
    let additionalPropertyType: Type | undefined
    let patternPropertiesTypes: Type[] = []

    // if (lodash.isEmpty(schema.properties) && !schema.additionalProperties) {
    //   schema.additionalProperties = true
    // }

    if (schema.additionalProperties) {
      additionalPropertyType =
        typeof schema.additionalProperties === "boolean" ? Type.any() : toTypings(schema.additionalProperties)
    }

    if (schema.patternProperties) {
      patternPropertiesTypes = lodash.map(lodash.values(schema.patternProperties), toTypings) || []
    }

    const mayWithAdditionalPropertiesTypes = lodash.concat(patternPropertiesTypes, additionalPropertyType || [])

    let props = lodash.map(schema.properties || {}, (subSchema: IJSONSchema, key: string) => {
      let id = Identifier.of(key)

      if (lodash.indexOf(schema.required || [], key) === -1) {
        id = id.asOptional()
      }

      return id.typed(
        toTypings({
          ...subSchema,
          id: subSchema.id || [schema.id, key].join("_"),
        }),
      )
    })

    if (!lodash.isEmpty(mayWithAdditionalPropertiesTypes)) {
      props = props.concat(
        Identifier.of("")
          .indexBy(Identifier.of("k").typed(Type.string()))
          .typed(Type.unionOf(...mayWithAdditionalPropertiesTypes)),
      )
    }

    return Type.objectOf(...props)
  }

  if (isArrayType(schema)) {
    if (lodash.isArray(schema.items) && schema.additionalItems === false) {
      return Type.tupleOf(...lodash.map(schema.items, toTypings))
    }

    const additionalItems = schema.additionalItems === true ? {} : schema.additionalItems

    return Type.arrayOf(
      Type.unionOf(
        ...lodash.map(
          ([] as IJSONSchema[])
            .concat(schema.items || {})
            .map((items) => ({
              ...items,
              id: items.id || [schema.id, "items"].join("_"),
            }))
            .concat(lodash.has(schema, "additionalItems") ? (additionalItems as any) : []),
          toTypings,
        ),
      ),
    )
  }

  if (isStringType(schema)) {
    if ((schema as any).format === "binary") {
      return Type.of("File | Blob")
    }
    return Type.string()
  }

  if (isNumberType(schema)) {
    return Type.number()
  }

  if (isBooleanType(schema)) {
    return Type.boolean()
  }

  if (isNullType(schema)) {
    return Type.null()
  }

  return Type.any()
}

export const pickSideDefs = (s: string): string => {
  const [result, sideDefs] = decode(s)
  const uniqedSideDefs = lodash.uniq(sideDefs)

  if (uniqedSideDefs.length > 0) {
    return uniqedSideDefs
      .map((sideDef) => `export ${sideDef}`)
      .concat(result)
      .join("\n\n")
  }

  return result
}

export const toDeclaration = (schema: IJSONSchema): string | never => {
  if (!schema.id) {
    throw new Error("Declaration should be need Schema have an `id`")
  }

  const type = toTypings(schema)

  if (schema.allOf) {
    const [objectSchema, refSchemas] = extendsableAllOfSchema(schema.allOf)

    if (objectSchema) {
      return `${ModuleExport.decl(
        Decl.interface(
          Identifier.of(toSafeId(schema.id))
            .extendsWith(
              ...refSchemas
                .map(toTypings)
                .map(String)
                .map(Identifier.of),
            )
            .typed(
              toTypings({
                ...objectSchema,
                id: schema.id,
              }),
            ),
        ),
      )}`
    }
  }

  if (isObjectType(schema) && !isArrayType(schema) && !(schema.oneOf || schema.allOf || schema.anyOf)) {
    return `${ModuleExport.decl(Decl.interface(Identifier.of(toSafeId(schema.id)).typed(type)))}`
  }

  return `${ModuleExport.decl(Decl.type(Identifier.of(toSafeId(schema.id)).typed(type)))}`
}

export const toDeclarations = (schema: IJSONSchema) => {
  const main = toDeclaration(schema)

  return pickSideDefs(
    lodash
      .map(lodash.isEmpty(schema.definitions) ? {} : schema.definitions!, (defSchema, id) =>
        toDeclaration(lodash.assign(defSchema, { id })),
      )
      .concat(main)
      .join("\n\n")
      .replace(new RegExp(MAIN_SCHEMA_PLACEHOLDER, "g"), toSafeId(schema.id || "")),
  )
}
