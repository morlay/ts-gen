import {
  cloneDeep,
  cloneDeepWith,
  drop,
  first,
  get,
  has,
  isArray,
  isEmpty,
  isObject,
  isString,
  last,
  reduce,
  some,
  split,
  toLower,
  toUpper,
  upperFirst,
  words,
} from "lodash";
import { IJSONSchema } from "./interfaces";

export interface IImports {
  [k: string]: IJSONSchema;
}

const resolveRef = (imports: IImports) => (value: any): any => {
  if (!isArray(value) && isObject(value)) {
    const ref = get(value, "$ref");

    if (isString(ref)) {
      const [importRef, keyPath] = split(ref, "#");

      const keyPathArr = drop(split(keyPath, "/"));

      if (isEmpty(importRef)) {
        if (imports["#"]) {
          return {
            ...cloneDeep(get(imports["#"], keyPathArr)),
            id: last(keyPathArr),
          };
        }

        if (keyPathArr.length === 2 && first(keyPathArr) === "definitions") {
          return {
            $ref: `#/definitions/${last(keyPathArr)}`,
          };
        }
      }

      if (!has(imports, importRef)) {
        throw new Error(`missing import ${importRef}`);
      }

      return cloneDeepWith(
        get(imports[importRef], keyPathArr),
        resolveRef({
          "#": imports[importRef],
        }),
      );
    }
  }

  return undefined;
};

const hasProps = <T>(schema: T, props: Array<keyof T>): boolean => some(props, (prop: string) => has(schema, prop));

export const isObjectType = (schema: IJSONSchema): boolean =>
  schema.type === "object" ||
  hasProps(schema, [
    "properties",
    "additionalProperties",
    "patternProperties",
    "maxProperties",
    "minProperties",
    "propertyNames",
  ]);

export const isArrayType = (schema: IJSONSchema): boolean =>
  schema.type === "array" || hasProps(schema, ["items", "additionalItems", "maxItems", "minItems", "uniqueItems"]);

export const isNumberType = (schema: IJSONSchema): boolean =>
  schema.type === "number" || schema.type === "integer" || hasProps(schema, ["maximum", "minimum"]);

export const isStringType = (schema: IJSONSchema): boolean =>
  schema.type === "string" ||
  hasProps(schema, ["maxLength", "minLength", "format", "pattern", "contentMediaType", "contentEncoding"]);

export const isNullType = (schema: IJSONSchema): boolean => schema.type === "null";

export const isBooleanType = (schema: IJSONSchema): boolean => schema.type === "boolean";

export const toSingleSchema = (schema: IJSONSchema, imports: IImports): IJSONSchema => {
  return cloneDeepWith(schema, resolveRef(imports));
};

// https://github.com/golang/lint/blob/master/lint.go#L720
const commonInitialisms = {
  ACL: true,
  API: true,
  ASCII: true,
  CPU: true,
  CSS: true,
  DNS: true,
  EOF: true,
  GUID: true,
  HTML: true,
  HTTP: true,
  HTTPS: true,
  ID: true,
  IP: true,
  JSON: true,
  LHS: true,
  QPS: true,
  RAM: true,
  RHS: true,
  RPC: true,
  SLA: true,
  SMTP: true,
  SQL: true,
  SSH: true,
  TCP: true,
  TLS: true,
  TTL: true,
  UDP: true,
  UI: true,
  UID: true,
  UUID: true,
  URI: true,
  URL: true,
  UTF8: true,
  VM: true,
  XML: true,
  XMPP: true,
  XSRF: true,
  XSS: true,
};

export const toCamel = (word: string): string => {
  const upperString = toUpper(word);
  if (has(commonInitialisms, upperString)) {
    return upperString;
  }
  return upperFirst(toLower(upperString));
};

export const toUpperCamelCase = (s: string): string => {
  return reduce(
    words(s),
    (result, word) => {
      return result + toCamel(word);
    },
    "",
  );
};

export const toLowerCamelCase = (s: string): string => {
  return reduce(
    words(s),
    (result, word, idx) => {
      return result + (idx > 0 ? toCamel(word) : toLower(word));
    },
    "",
  );
};

export const toSafeId = (str: string): string => `I${toUpperCamelCase(str)}`;
