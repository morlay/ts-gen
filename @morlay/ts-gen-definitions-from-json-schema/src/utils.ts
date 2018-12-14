import * as lodash from "lodash";
import { IJSONSchema } from "./interfaces";

export interface IImports {
  [k: string]: IJSONSchema;
}

const resolveRef = (imports: IImports) => (value: any): any => {
  if (!lodash.isArray(value) && lodash.isObject(value)) {
    const ref = lodash.get(value, "$ref");

    if (lodash.isString(ref)) {
      const [importRef, keyPath] = lodash.split(ref, "#");

      const keyPathArr = lodash.drop(lodash.split(keyPath, "/"));

      if (lodash.isEmpty(importRef)) {
        if (imports["#"]) {
          return {
            ...lodash.cloneDeep(lodash.get(imports["#"], keyPathArr)),
            id: lodash.last(keyPathArr),
          };
        }

        if (keyPathArr.length === 2 && lodash.first(keyPathArr) === "definitions") {
          return {
            $ref: `#/definitions/${lodash.last(keyPathArr)}`,
          };
        }
      }

      if (!lodash.has(imports, importRef)) {
        throw new Error(`missing import ${importRef}`);
      }

      return lodash.cloneDeepWith(
        lodash.get(imports[importRef], keyPathArr),
        resolveRef({
          "#": imports[importRef],
        }),
      );
    }
  }

  return undefined;
};

const hasProps = (schema: IJSONSchema, props: string[]): boolean =>
  lodash.reduce(props, (result: boolean, prop: string) => result || lodash.has(schema, prop), false);

export const isObjectType = (schema: IJSONSchema): boolean =>
  schema.type === "object" ||
  hasProps(schema, ["properties", "additionalProperties", "patternProperties", "maxProperties", "minProperties"]);

export const isArrayType = (schema: IJSONSchema): boolean =>
  schema.type === "array" || hasProps(schema, ["items", "additionalItems", "maxItems", "minItems", "uniqueItems"]);

export const isNumberType = (schema: IJSONSchema): boolean =>
  schema.type === "number" || schema.type === "integer" || hasProps(schema, ["maximum", "minimum"]);

export const isStringType = (schema: IJSONSchema): boolean =>
  schema.type === "string" || hasProps(schema, ["maxLength", "minLength"]);

export const isNullType = (schema: IJSONSchema): boolean => schema.type === "null";

export const isBooleanType = (schema: IJSONSchema): boolean => schema.type === "boolean";

export const toSingleSchema = (schema: IJSONSchema, imports: IImports): IJSONSchema => {
  return lodash.cloneDeepWith(schema, resolveRef(imports));
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
  const upperString = lodash.toUpper(word);
  if (lodash.has(commonInitialisms, upperString)) {
    return upperString;
  }
  return lodash.upperFirst(lodash.toLower(upperString));
};

export const toUpperCamelCase = (s: string): string => {
  return lodash.reduce(
    lodash.words(s),
    (result, word) => {
      return result + toCamel(word);
    },
    "",
  );
};

export const toLowerCamelCase = (s: string): string => {
  return lodash.reduce(
    lodash.words(s),
    (result, word, idx) => {
      return result + (idx > 0 ? toCamel(word) : lodash.toLower(word));
    },
    "",
  );
};

export const toSafeId = (str: string): string => `I${toUpperCamelCase(str)}`;
