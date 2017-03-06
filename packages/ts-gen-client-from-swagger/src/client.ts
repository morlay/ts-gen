import * as lodash from "lodash";
import {
  toDeclaration,
  IJSONSchema,
  toLowerCamelCase,
  toTypings,
  toSafeId
} from "@morlay/ts-gen-definitions-from-json-schema";
import {
  ModuleExport,
  Decl,
  Identifier,
  Value,
  ModuleImport
} from "@morlay/ts-gen-core";
import {
  ISchema,
  ISwagger,
  IParameter,
  IOperation,
  IBodyParameter,
  IResponses
} from "./interfaces";

export type IMethod = "get" | "delete" | "head" | "post" | "put" | "patch";
export type IParameterPosition = "path" | "header" | "query" | "body" | "formData";

export interface IExtraOperation {
  path: string;
  method: IMethod;
  group?: string;
}

export type IPatchedOperation = IOperation & IExtraOperation;

export const urlToTemplate = (url: string) =>
  `\`${lodash.replace(url, /\{/g, "${")}\``;

export const filterParametersIn = (position: IParameterPosition) => {
  return (parameters: IParameter[]): IParameter[] =>
    lodash.filter(parameters, (parameter: IParameter): boolean => parameter.in === position);
};

export const getDefinitions = (swagger: ISwagger): string => {
  const definitions = lodash.assign({}, swagger.definitions) as { [key: string]: IJSONSchema };
  return lodash.map(definitions, (definition: ISchema, id: string): string => toDeclaration(lodash.assign(definition, { id }))).join("\n\n");
};

export const toSchema = (parameter: IParameter): IParameter =>
  "schema" in parameter
    ? lodash.assign(parameter, (parameter as IBodyParameter).schema, { name: "body" })
    : parameter;

export const pickRequiredList = (parameters: IParameter[]): string[] =>
  lodash.reduce(
    parameters,
    (result: string[], parameter: IParameter): string[] => {
      if (parameter.required) {
        return lodash.concat(result, parameter.name);
      }
      return result;
    },
    ["body"] as string[],
  );

const createParameterObject = (parameters: IParameter[]) =>
  Value.objectOf(
    ...lodash.map(parameters, (parameter) => Identifier.of(parameter.name)),
  );

export const getReqParamSchema = (parameters: IParameter[]): IJSONSchema => ( {
  type: "object",
  properties: lodash.reduce(parameters, (properties: { [k: string]: IJSONSchema }, parameter: IParameter) => {
    const schema = toSchema(parameter);
    return lodash.assign(properties, {
      [schema.name]: schema,
    });
  }, {}),
  required: pickRequiredList(parameters),
});

const getRespBodySchema = (responses: IResponses) => {
  let bodySchema: ISchema;

  lodash.forEach(responses, (resp, codeOrDefault) => {
    const code = Number(codeOrDefault);
    if (code >= 200 && code < 300 && resp.schema) {
      bodySchema = resp.schema;
    }
  });

  return bodySchema;
}

export interface IClientOpts {
  clientId: string,
  clientLib: {
    path: string,
    method: string,
  }
}

export const getOperations = (operation: IPatchedOperation, clientOpts: IClientOpts): string => {
  const parameters = lodash.map(operation.parameters, (parameter: IParameter) => {
    if (parameter.in === "body") {
      return {
        ...parameter,
        name: "body",
      }
    }
    return parameter;
  });

  const query = filterParametersIn("query")(parameters);
  const headers = filterParametersIn("header")(parameters);
  const formData = filterParametersIn("formData")(parameters);
  const body = filterParametersIn("body")(parameters);

  const respbodySchema = getRespBodySchema(operation.responses);

  const operationId = toLowerCamelCase(operation.operationId);

  const operationUiq = (`${clientOpts.clientId}.${operation.group}.${operationId}`);

  const members = [
    Identifier.of("method").valueOf(Value.of(lodash.toUpper(operation.method))),
    Identifier.of("url").valueOf(new Value(urlToTemplate(operation.path))),
  ];

  if (query.length) {
    members.push(Identifier.of("query").valueOf(createParameterObject(query)))
  }

  if (headers.length) {
    members.push(Identifier.of("headers").valueOf(createParameterObject(headers)))
  }

  if (formData.length) {
    members.push(Identifier.of("formData").valueOf(createParameterObject(formData)))
  }

  if (body.length) {
    members.push(Identifier.of("data").valueOf(Identifier.of("body")));
  }

  let func = Identifier.of(operationId);

  if (parameters.length) {
    func = func.paramsWith(
      Identifier.of(String(createParameterObject(parameters))).typed(toTypings(getReqParamSchema(parameters)))
    )
  }

  func = func.valueOf(Value.memberOf(
    Decl.returnOf(Identifier.of(clientOpts.clientLib.method)
      .generics(toTypings(respbodySchema || { type: "null" }))
      .paramsWith(
        Identifier.of(String(Value.of(operationUiq))),
        Identifier.of(String(Value.objectOf(...members)))
      ))
  ))

  return `${ModuleExport.decl(Decl.func(func))}`;
}

export const getTypes = (paths: any): string[] => {
  const reg = /"\$ref":"#\/definitions\/([\s\S]+?)"/;
  const operationsString = JSON.stringify(paths);
  return lodash.uniq(
    lodash.map(
      operationsString.match(new RegExp(reg as any, "g")),
      (str: string): string => toSafeId(reg.exec(str)[1]),
    ),
  );
};

export const getClientMain = (swagger: ISwagger, clientOpts: IClientOpts) => {
  return lodash.flattenDeep(
    [].concat(
      ModuleImport.from(clientOpts.clientLib.path).membersAs(
        Identifier.of(clientOpts.clientLib.method),
      ),
      ModuleImport.from("./definitions").membersAs(
        ...getTypes(swagger.paths).map(Identifier.of),
      ),
      lodash.map(swagger.paths, (pathItem, path: string) =>
        lodash.map(pathItem, (operation: IOperation, method: IMethod) =>
          getOperations({
            ...operation,
            method,
            path,
            group: operation.tags ? operation.tags[0] : "ungroup",
          }, clientOpts),
        ),
      ),
    ),
  ).join("\n\n")
};
