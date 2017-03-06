import * as lodash from "lodash";
import {
  Type,
  Value,
  Identifier,
  ModuleExport,
  Decl
} from "@morlay/ts-gen-core";
import {
  IJSONSchema,
  ISimpleTypes
} from "./interfaces";
import {
  toSafeId,
  isObjectType,
  isStringType,
  isBooleanType,
  isArrayType,
  isNumberType,
  isNullType
} from "./utils";

const MAIN_SCHEMA_PLACEHOLDER = "MAIN_SCHEMA_PLACEHOLDER";

export const pickRefName = (schema: IJSONSchema): string => {
  if (schema.$ref === "#") {
    return MAIN_SCHEMA_PLACEHOLDER;
  }
  const refName = lodash.replace(schema.$ref, "#/definitions/", "");
  return toSafeId(refName);
};

export const filterNonTypeSchemas = (schemas: IJSONSchema[]) => lodash.filter(schemas, (schema) => lodash.keys(lodash.pick(schema, ["enum", "type", "$ref"])).length);

export const extendsableAllOfSchema = (schemas: IJSONSchema[]): [IJSONSchema, IJSONSchema[]] => {
  const refSchemas: IJSONSchema[] = [];
  let objectSchema: IJSONSchema;

  lodash.forEach(schemas, (schema) => {
    if (isObjectType(schema)) {
      objectSchema = schema;
    }
    if (schema.$ref) {
      refSchemas.push(schema);
    }
  });

  return [objectSchema, refSchemas];
};

export const toTypings = (schema: IJSONSchema): Type => {
  if (schema.$ref) {
    return Type.of(pickRefName(schema));
  }

  if (schema.enum) {
    return Type.unionOf(...lodash.map(schema.enum, (value: any) => Type.of(Value.of(value))));
  }

  if (schema.allOf) {
    return Type.intersectionOf(...lodash.map(filterNonTypeSchemas(schema.allOf), toTypings));
  }

  if (lodash.isArray(schema.type)) {
    return Type.unionOf(...lodash.map(schema.type, (type: ISimpleTypes) => toTypings(lodash.assign(schema, { type }))));
  }

  if (schema.anyOf) {
    return Type.unionOf(...lodash.map(filterNonTypeSchemas(schema.anyOf), toTypings));
  }

  if (schema.oneOf) {
    // TODO xor not support
    return Type.unionOf(...lodash.map(filterNonTypeSchemas(schema.oneOf), toTypings));
  }

  // TODO find better way
  if (isObjectType(schema) && isArrayType(schema)) {
    return Type.any();
  }

  if (isObjectType(schema)) {
    let additionalPropertyType: Type;
    let patternPropertiesTypes: Type[] = [];

    if (lodash.isEmpty(schema.properties) && !schema.additionalProperties) {
      schema.additionalProperties = true;
    }

    if (schema.additionalProperties) {
      additionalPropertyType = typeof schema.additionalProperties === "boolean"
        ? Type.any()
        : toTypings(schema.additionalProperties);
    }

    if (schema.patternProperties) {
      patternPropertiesTypes = lodash.map(
          lodash.values(schema.patternProperties),
          toTypings,
        ) || [];
    }

    const mayWithAdditionalPropertiesTypes = lodash.concat(patternPropertiesTypes, additionalPropertyType || []);

    let props = lodash.map(
      schema.properties,
      (subSchema: IJSONSchema, key: string) => {
        let id = Identifier.of(key);

        if (lodash.indexOf(schema.required, key) === -1) {
          id = id.asOptional();
        }

        return id.typed(toTypings(subSchema));
      },
    );

    if (!lodash.isEmpty(mayWithAdditionalPropertiesTypes)) {
      props = props.concat(
        Identifier.of("")
          .indexBy(
            Identifier.of("k").typed(Type.string())
          )
          .typed(
            Type.unionOf(...mayWithAdditionalPropertiesTypes),
          )
      );
    }

    return Type.objectOf(
      ...props,
    );
  }

  if (isArrayType(schema)) {
    if (lodash.isArray(schema.items) && schema.additionalItems === false) {
      return Type.tupleOf(...lodash.map(schema.items, toTypings));
    }

    const additionalItems = schema.additionalItems === true ? {} : schema.additionalItems;

    return Type.arrayOf(Type.unionOf(
      ...lodash.map(
        [].concat(schema.items || {})
          .concat(lodash.has(schema, "additionalItems") ? additionalItems : []),
        toTypings,
      )),
    );
  }

  if (isStringType(schema)) {
    return Type.string();
  }

  if (isNumberType(schema)) {
    return Type.number();
  }

  if (isBooleanType(schema)) {
    return Type.boolean();
  }

  if (isNullType(schema)) {
    return Type.null();
  }

  return Type.any();
};

export const toDeclaration = (schema: IJSONSchema): string | never => {
  if (!schema.id) {
    throw new Error("Declaration should be need Schema have an `id`");
  }

  const type = toTypings(schema);

  if (schema.allOf) {
    const [objectSchema, refSchemas] = extendsableAllOfSchema(schema.allOf);

    if (objectSchema) {
      return `${ModuleExport.decl(Decl.interface(
        Identifier.of(toSafeId(schema.id)).extendsWith(...refSchemas.map(toTypings).map(String).map(Identifier.of))
          .typed(toTypings(objectSchema)))
      )}`;
    }
  }

  if (isObjectType(schema) && !isArrayType(schema) && !(schema.oneOf || schema.allOf || schema.anyOf)) {
    return `${ModuleExport.decl(Decl.interface(
      Identifier.of(toSafeId(schema.id)).typed(type))
    )}`;
  }

  return `${ModuleExport.decl(Decl.type(
    Identifier.of(toSafeId(schema.id)).typed(type))
  )}`;
};

export const toDeclarations = (schema: IJSONSchema) => {
  const main = toDeclaration(schema);

  return lodash.map(
    lodash.isEmpty(schema.definitions) ? [] : schema.definitions,
    (defSchema, id) => toDeclaration(lodash.assign(defSchema, { id })),
  )
    .concat(main)
    .join("\n\n")
    .replace(new RegExp(MAIN_SCHEMA_PLACEHOLDER, "g"), toSafeId(schema.id));
};
