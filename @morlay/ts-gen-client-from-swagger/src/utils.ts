import { Identifier, Value } from "@morlay/ts-gen-core";
import { toLowerCamelCase } from "@morlay/ts-gen-definitions-from-json-schema";
import * as lodash from "lodash";
import { IParameter } from "./interfaces/Swagger";

export const urlToTemplate = (url: string = "") =>
  `\`${url.replace(
    /\{([^}]+)\}/g,
    (_, $1): string => {
      return `\${${mayToAliasID($1)}}`;
    },
  )}\``;

export const reservedWords = [
  "abstract",
  "await",
  "boolean",
  "break",
  "byte",
  "case",
  "catch",
  "char",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "double",
  "else",
  "enum",
  "export",
  "extends",
  "false",
  "final",
  "finally",
  "float",
  "for",
  "function",
  "goto",
  "if",
  "implements",
  "import",
  "in",
  "instanceof",
  "int",
  "interface",
  "let",
  "long",
  "native",
  "new",
  "null",
  "package",
  "private",
  "protected",
  "public",
  "return",
  "short",
  "static",
  "super",
  "switch",
  "synchronized",
  "this",
  "throw",
  "throws",
  "transient",
  "true",
  "try",
  "typeof",
  "var",
  "void",
  "volatile",
  "while",
  "with",
  "yield",
];

export const filterParametersIn = (position: string) => {
  return (parameters: any[]): any[] =>
    lodash.filter(parameters, (parameter: any): boolean => parameter.in === position);
};

/** IdentifierName can be written as unquoted property names, but may be reserved words. */
export function isIdentifierName(s: string) {
  return /^[$A-Z_][0-9A-Z_$]*$/i.test(s);
}

/** Identifiers are e.g. legal variable names. They may not be reserved words */
export function isIdentifier(s: string) {
  return isIdentifierName(s) && reservedWords.indexOf(s) < 0;
}

export interface IClientOpts {
  clientId: string;
  clientLib: {
    path: string;
    method: string;
  };
}

export const mayToId = (id: string): string => (isIdentifier(id) ? id : toLowerCamelCase(id));
export const mayToAliasID = (id: string) => mayToId(`p-${id}`);

export const createParameterObject = (parameters: IParameter[]) =>
  Value.objectOf(
    ...lodash.map(parameters, (parameter) => {
      const propName = mayToId(parameter.name || "");
      if (propName !== parameter.name) {
        return Identifier.of(String(Value.of(parameter.name))).valueOf(Identifier.of(mayToAliasID(propName)));
      }
      return Identifier.of(parameter.name).valueOf(Identifier.of(mayToAliasID(propName)));
    }),
  );
