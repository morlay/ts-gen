import { Decl, Identifier, ModuleExport, ModuleImport, safeKey, Value } from "@morlay/ts-gen-core";
import {
  IJSONSchema,
  pickSideDefs,
  toDeclaration,
  toLowerCamelCase,
  toTypings,
} from "@morlay/ts-gen-definitions-from-json-schema";
import * as lodash from "lodash";
import { IBodyParameter, IOperation, IParameter, IResponses, ISchema, ISwagger } from "./interfaces/Swagger";
import { filterParametersIn, IClientOpts, mayToAliasID, mayToId, urlToTemplate } from "./utils";

export type IMethod = "get" | "delete" | "head" | "post" | "put" | "patch";

export interface IExtraOperation extends IOperation {
  method: IMethod;
  path: string;
}

export const getDefinitions = (swagger: ISwagger): string => {
  let definitions = lodash.assign({}, swagger.definitions) as {
    [key: string]: IJSONSchema;
  };
  const sortedKeys = lodash.sortBy(lodash.keys(definitions), (v) => v);

  definitions = lodash.pick(definitions, sortedKeys);

  const definitionString: string = lodash
    .map(definitions, (definition: ISchema, $id: string): string => toDeclaration(lodash.assign(definition, { $id })))
    .join("\n\n");

  return pickSideDefs(definitionString);
};

export const toSchema = (parameter: IParameter): IParameter =>
  "schema" in parameter
    ? lodash.assign(parameter, (parameter as IBodyParameter).schema, {
        name: "body",
      })
    : parameter;

export const pickRequiredList = (parameters: IParameter[]): string[] =>
  lodash.reduce(
    parameters,
    (result: string[], parameter: IParameter): string[] => {
      if (parameter.required && parameter.name) {
        return lodash.concat(result, parameter.name);
      }
      return result;
    },
    ["body"] as string[],
  );

const createParameterObject = (parameters: IParameter[]) =>
  Value.objectOf(
    ...lodash.map(parameters, (parameter) => {
      const propName = mayToId(parameter.name || "");
      if (propName !== parameter.name) {
        return Identifier.of(safeKey(parameter.name || "")).valueOf(Identifier.of(mayToAliasID(propName)));
      }
      return Identifier.of(parameter.name).valueOf(Identifier.of(mayToAliasID(propName)));
    }),
  );

export const getReqParamSchema = (parameters: IParameter[]): IJSONSchema => ({
  type: "object",
  properties: lodash.reduce(
    parameters,
    (properties: { [k: string]: IJSONSchema }, parameter: IParameter) => {
      const schema = toSchema(parameter);

      let propName = mayToId(parameter.name || "");

      if (parameter.name !== propName) {
        propName = parameter.name || "";
      }

      return lodash.assign(properties, {
        [propName]: schema,
      });
    },
    {},
  ),
  required: pickRequiredList(parameters),
});

const getRespBodySchema = (responses: IResponses) => {
  let bodySchema: ISchema = { type: "null" };

  lodash.forEach(responses, (resp, codeOrDefault) => {
    const code = Number(codeOrDefault);
    if (code >= 200 && code < 300 && resp.schema) {
      bodySchema = resp.schema;
    }
  });

  return bodySchema;
};

export const getOperations = (operation: IExtraOperation, clientOpts: IClientOpts): string => {
  const parameters = (operation.parameters || ([] as IParameter[]))
    .map((parameter: IParameter) => {
      if (parameter.in === "body") {
        return {
          ...parameter,
          name: "body",
        };
      }
      return parameter;
    })
    .map((parameter: IParameter) => ({
      ...parameter,
      id: [operation.operationId, parameter.name].join("_"),
    }));

  const query = filterParametersIn("query")(parameters);
  const headers = filterParametersIn("header")(parameters);
  const formData = filterParametersIn("formData")(parameters);
  const body = filterParametersIn("body")(parameters);

  const respbodySchema = getRespBodySchema(operation.responses);

  const operationId = toLowerCamelCase(operation.operationId || "");

  const operationUiq = `${clientOpts.clientId}.${operation.operationId}`;

  const members = [
    Identifier.of("method").valueOf(Value.of(lodash.toUpper(operation.method))),
    Identifier.of("url").valueOf(new Value(urlToTemplate(operation.path))),
  ];

  if (query.length) {
    members.push(Identifier.of("query").valueOf(createParameterObject(query)));
  }

  if (headers.length) {
    members.push(Identifier.of("headers").valueOf(createParameterObject(headers)));
  }

  if (formData.length) {
    members.push(Identifier.of("formData").valueOf(createParameterObject(formData)));
  }

  if (body.length) {
    members.push(Identifier.of("data").valueOf(Identifier.of(mayToAliasID("body"))));
  }

  let callbackFunc = Identifier.of("").operatorsWith(": ", " => ");

  if (parameters.length) {
    callbackFunc = callbackFunc.paramsWith(Identifier.of(String(createParameterObject(parameters as IParameter[]))));
  } else {
    callbackFunc = callbackFunc.paramsWith(Identifier.of(""));
  }

  callbackFunc = callbackFunc.valueOf(Value.memberOf(Decl.returnOf(Identifier.of(String(Value.objectOf(...members))))));

  const callFunc = Identifier.of(clientOpts.clientLib.method)
    .generics(
      parameters.length ? toTypings(getReqParamSchema(parameters as IParameter[])) : Identifier.of("void"),
      toTypings(respbodySchema || { type: "null" }),
    )
    .paramsWith(Identifier.of(String(Value.of(operationUiq))), callbackFunc);

  return `${ModuleExport.decl(Decl.const(Identifier.of(operationId).valueOf(callFunc)))}`;
};

export const getClient = (swagger: ISwagger, clientOpts: IClientOpts) => {
  let operations = lodash.flattenDeep<IExtraOperation>(lodash.map(swagger.paths, (pathItem: any, path: string) =>
    lodash.map(pathItem, (operation: IOperation, method: IMethod) => {
      return {
        ...operation,
        method,
        path,
      };
    }),
  ) as any);

  operations = lodash.sortBy(operations, (op: IExtraOperation) => op.operationId);

  return (
    pickSideDefs(
      ([] as string[])
        .concat(
          ModuleImport.from(clientOpts.clientLib.path)
            .membersAs(Identifier.of(clientOpts.clientLib.method))
            .toString(),
          lodash.map(operations, (op) => getOperations(op as IExtraOperation, clientOpts)),
        )
        .join("\n\n"),
    ) +
    "\n\n" +
    getDefinitions(swagger)
  );
};
