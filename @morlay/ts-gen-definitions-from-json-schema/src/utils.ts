import { filter, has, isBoolean, some } from "lodash";

import { ISchemaBasic, SimpleTypes, TSchema } from "./Schema";

const typeRelationKeywords: { [k in keyof typeof SimpleTypes]?: Array<keyof ISchemaBasic> } = {
  object: [
    "properties",
    "additionalProperties",
    "unevaluatedProperties",
    "patternProperties",
    "propertyNames",
    "dependentSchemas",

    "maxProperties",
    "minProperties",
    // "required",
    // "dependentRequired",
  ],
  array: [
    "contains",
    "items",
    "additionalItems",
    "unevaluatedItems",

    "maxItems",
    "minItems",
    "uniqueItems",
    "maxContains",
    "minContains",
  ],
  string: ["pattern", "contentMediaType", "contentEncoding", "contentSchema", "maxLength", "minLength"],
  number: ["maximum", "minimum", "multipleOf", "exclusiveMaximum", "exclusiveMinimum"],
};

export const normalizeSchema = (schema: TSchema): ISchemaBasic => {
  if (isBoolean(schema)) {
    return {};
  }

  if (!schema.type) {
    for (const t in typeRelationKeywords) {
      if (hasProps(schema, typeRelationKeywords[t as keyof typeof SimpleTypes] as any)) {
        schema.type = t as any;
        break;
      }
    }
  }

  if (!!schema.allOf) {
    schema.allOf = filter(schema.allOf!, (s) => !isMetaType(normalizeSchema(s)));
    schema.allOf.length === 0 && delete schema.allOf;
  }

  if (!!schema.anyOf) {
    schema.anyOf = filter(schema.anyOf!, (s) => !isMetaType(normalizeSchema(s)));
    schema.anyOf.length === 0 && delete schema.anyOf;
  }

  if (!!schema.oneOf) {
    schema.oneOf = filter(schema.oneOf!, (s) => !isMetaType(normalizeSchema(s)));
    schema.oneOf.length === 0 && delete schema.oneOf;
  }

  return schema;
};

const hasProps = <T>(schema: T, props: Array<keyof T>): boolean => some(props, (prop: string) => has(schema, prop));

export const isMetaType = (schema: ISchemaBasic): any => {
  return !hasProps(schema, ["type", "$ref", "$id", "$recursiveRef", "oneOf", "anyOf", "allOf"]);
};

export const isObjectType = (schema: ISchemaBasic): boolean => schema.type === "object";

export const isArrayType = (schema: ISchemaBasic): boolean => schema.type === "array";

export const isNumberType = (schema: ISchemaBasic): boolean => schema.type === "number" || schema.type === "integer";

export const isStringType = (schema: ISchemaBasic): boolean => schema.type === "string";

export const isNullType = (schema: ISchemaBasic): boolean => schema.type === "null";

export const isBooleanType = (schema: ISchemaBasic): boolean => schema.type === "boolean";
