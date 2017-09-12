import {
  Decl,
  Identifier,
  ModuleExport,
  ModuleImport,
  Value,
} from "@morlay/ts-gen-core"
import {
  IJSONSchema,
  pickSideDefs,
  toDeclaration,
  toLowerCamelCase,
  toSafeId,
  toTypings,
} from "@morlay/ts-gen-definitions-from-json-schema"
import * as lodash from "lodash"
import {
  IBodyParameter,
  IOperation,
  IParameter,
  IParametersList,
  IResponses,
  ISchema,
  ISwagger,
} from "./interfaces"

export type IMethod = "get" | "delete" | "head" | "post" | "put" | "patch";
export type IParameterPosition = "path" | "header" | "query" | "body" | "formData";

export interface IExtraOperation {
  path: string;
  method: IMethod;
  group?: string;
}

export type IPatchedOperation = IOperation & IExtraOperation;

export const urlToTemplate = (url: string) =>
  `\`${lodash.replace(url, /\{/g, "$" + "{")}\``

export const reservedWords = ["abstract", "await", "boolean", "break", "byte", "case",
  "catch", "char", "class", "const", "continue", "debugger", "default",
  "delete", "do", "double", "else", "enum", "export", "extends", "false",
  "final", "finally", "float", "for", "function", "goto", "if", "implements",
  "import", "in", "instanceof", "int", "interface", "let", "long", "native",
  "new", "null", "package", "private", "protected", "public", "return", "short",
  "static", "super", "switch", "synchronized", "this", "throw", "throws",
  "transient", "true", "try", "typeof", "var", "void", "volatile", "while", "with", "yield"]

/** IdentifierName can be written as unquoted property names, but may be reserved words. */
export function isIdentifierName(s: string) {
  return /^[$A-Z_][0-9A-Z_$]*$/i.test(s)
}

/** Identifiers are e.g. legal variable names. They may not be reserved words */
export function isIdentifier(s: string) {
  return isIdentifierName(s) && reservedWords.indexOf(s) < 0
}

export const filterParametersIn = (position: IParameterPosition) => {
  return (parameters: IParameter[]): IParameter[] =>
    lodash.filter(parameters, (parameter: IParameter): boolean => parameter.in === position)
}

export const getDefinitions = (swagger: ISwagger): string => {
  let definitions = lodash.assign({}, swagger.definitions) as { [key: string]: IJSONSchema }
  const sortedKeys = lodash.sortBy(lodash.keys(definitions), (v) => v)

  definitions = lodash.pick<{ [key: string]: IJSONSchema }, { [key: string]: IJSONSchema }>(
    definitions,
    sortedKeys,
  )

  const definitionString: string = lodash.map(
    definitions,
    (definition: ISchema, id: string): string => toDeclaration(lodash.assign(definition, { id })),
  ).join("\n\n")

  return pickSideDefs(definitionString)
}

export const toSchema = (parameter: IParameter): IParameter =>
  "schema" in parameter
    ? lodash.assign(parameter, (parameter as IBodyParameter).schema, { name: "body" })
    : parameter

export const pickRequiredList = (parameters: IParameter[]): string[] =>
  lodash.reduce(
    parameters,
    (result: string[], parameter: IParameter): string[] => {
      if (parameter.required && parameter.name) {
        return lodash.concat(result, parameter.name)
      }
      return result
    },
    ["body"] as string[],
  )

const createParameterObject = (parameters: IParameter[]) =>
  Value.objectOf(
    ...lodash.map(parameters, (parameter) => {
        const propName = mayToId(parameter.name || "")
        if (propName !== parameter.name) {
          return Identifier.of(String(Value.of(parameter.name)))
            .valueOf(Identifier.of(propName))
        }
        return Identifier.of(parameter.name)
      },
    )
  )

const mayToId = (id: string): string => isIdentifier(id) ? id : toLowerCamelCase(id)

export const getReqParamSchema = (parameters: IParameter[]): IJSONSchema => ({
  type: "object",
  properties: lodash.reduce(parameters, (properties: { [k: string]: IJSONSchema }, parameter: IParameter) => {
    const schema = toSchema(parameter)

    let propName = mayToId(parameter.name || "")

    if (parameter.name !== propName) {
      propName = String(Value.of(parameter.name))
    }

    return lodash.assign(properties, {
      [propName]: schema,
    })
  }, {}),
  required: pickRequiredList(parameters),
})

const getRespBodySchema = (responses: IResponses) => {
  let bodySchema: ISchema = { type: "null" }

  lodash.forEach(responses, (resp, codeOrDefault) => {
    const code = Number(codeOrDefault)
    if (code >= 200 && code < 300 && resp.schema) {
      bodySchema = resp.schema
    }
  })

  return bodySchema
}

export interface IClientOpts {
  clientId: string,
  clientLib: {
    path: string,
    method: string,
  }
}

export const getOperations = (operation: IPatchedOperation, clientOpts: IClientOpts): string => {
  const parameters = lodash
    .map(operation.parameters || [], (parameter: IParameter) => {
      if (parameter.in === "body") {
        return {
          ...parameter,
          name: "body",
        }
      }
      return parameter
    })
    .map((parameter: IParameter) => ({
      ...parameter,
      id: [operation.operationId, parameter.name].join("_"),
    }))

  const query = filterParametersIn("query")(parameters)
  const headers = filterParametersIn("header")(parameters)
  const formData = filterParametersIn("formData")(parameters)
  const body = filterParametersIn("body")(parameters)

  const respbodySchema = getRespBodySchema(operation.responses)

  const operationId = toLowerCamelCase(operation.operationId || "")

  const operationUiq = (`${clientOpts.clientId}.${operation.group}.${operationId}`)

  const members = [
    Identifier.of("method").valueOf(Value.of(lodash.toUpper(operation.method))),
    Identifier.of("url").valueOf(new Value(urlToTemplate(operation.path))),
  ]

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
    members.push(Identifier.of("data").valueOf(Identifier.of("body")))
  }

  let callbackFunc = Identifier.of("").operatorsWith(": ", " => ")

  if (parameters.length) {
    callbackFunc = callbackFunc.paramsWith(
      Identifier.of(String(createParameterObject(parameters))),
    )
  } else {
    callbackFunc = callbackFunc.paramsWith(
      Identifier.of(""),
    )
  }

  callbackFunc = callbackFunc.valueOf(Value.memberOf(
    Decl.returnOf(Identifier.of(String(Value.objectOf(...members)))),
  ))

  const callFunc = Identifier.of(clientOpts.clientLib.method)
    .generics(
      parameters.length ? toTypings(getReqParamSchema(parameters)) : Identifier.of("void"),
      toTypings(respbodySchema || { type: "null" }),
    )
    .paramsWith(
      Identifier.of(String(Value.of(operationUiq))),
      callbackFunc,
    )

  return `${ModuleExport.decl(Decl.const(Identifier.of(operationId).valueOf(callFunc)))}`
}

export const getTypes = (paths: any): string[] => {
  const reg = /"\$ref":"#\/definitions\/([\s\S]+?)"/
  const operationsString = JSON.stringify(paths)
  const importTypes = lodash.map(
    operationsString.match(new RegExp(reg as any, "g")) || [],
    (str: string): string => toSafeId(reg.exec(str)![1]),
  )

  return lodash.uniq(importTypes)
}

export const getClientMain = (swagger: ISwagger, clientOpts: IClientOpts) => {
  let responses: IResponses = []
  let parameters: IParametersList = []

  let operations = lodash.flattenDeep<IPatchedOperation>(
    lodash.map(
      swagger.paths, (pathItem, path: string) =>
        lodash.map(pathItem, (operation: IOperation, method: IMethod) => {
            responses = responses.concat(
              lodash.pickBy(operation.responses, (_, status) => Number(status) >= 200 && Number(status) < 400),
            )

            parameters = parameters.concat(operation.parameters)

            return {
              ...operation,
              method,
              path,
              group: operation.tags ? operation.tags[0] : "ungroup",
            }
          },
        ),
    ),
  )

  operations = lodash.sortBy(operations, (op) => op.operationId)

  return pickSideDefs(
    ([] as string[]).concat(
      ModuleImport.from(clientOpts.clientLib.path)
        .membersAs(
          Identifier.of(clientOpts.clientLib.method),
        )
        .toString(),
      responses.length
        ? ModuleImport.from("./definitions")
          .membersAs(
            ...getTypes(responses.concat(parameters)).map(Identifier.of),
          ).toString()
        : "",
      lodash.map(operations, (op) => getOperations(op, clientOpts)),
    ).join("\n\n"),
  )
}
