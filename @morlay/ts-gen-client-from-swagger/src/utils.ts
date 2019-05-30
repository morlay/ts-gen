import { Identifier, isIdentifier, Value } from "@morlay/ts-gen-core";
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

export const filterParametersIn = (position: string) => {
  return (parameters: any[]): any[] =>
    lodash.filter(parameters, (parameter: any): boolean => parameter.in === position);
};

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
