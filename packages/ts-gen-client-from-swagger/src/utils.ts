import * as lodash from "lodash";

export const urlToTemplate = (url: string) => `\`${lodash.replace(url, /\{/g, "$" + "{")}\``;

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
