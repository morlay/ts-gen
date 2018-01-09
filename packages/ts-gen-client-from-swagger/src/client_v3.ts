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
  toTypings,
} from "@morlay/ts-gen-definitions-from-json-schema"
import * as lodash from "lodash"
import { Dictionary } from "lodash"
import {
  IOpenAPI,
  IOperation,
  IParameter,
  IRequestBody,
  IResponse,
  IResponses,
  ISchema,
  ISchemaOrReference,
} from "./interfaces/OpenAPI"
import {
  filterParametersIn,
  IClientOpts,
  isIdentifier,
  urlToTemplate,
} from "./utils"

export type IMethod = "get" | "delete" | "head" | "post" | "put" | "patch";

export interface IExtraOperation extends IOperation {
  path: string;
  method: IMethod;
}

export const getDefinitions = (openAPI: IOpenAPI): string => {
  let definitions = lodash.assign({}, (openAPI.components || {}).schemas) as Dictionary<IJSONSchema>

  const sortedKeys = lodash.sortBy(lodash.keys(definitions), (v) => v)

  definitions = lodash.pick(definitions, sortedKeys)

  const definitionString: string = lodash
    .map(definitions, (definition: ISchema, id: string): string => {
      return toDeclaration(lodash.assign(definition, { id }))
    })
    .join("\n\n")

  return pickSideDefs(definitionString)
}


const createParameterObject = (parameters: IParameter[]) =>
  Value.objectOf(
    ...lodash.map(parameters, (parameter) => {
      if (!!parameter.value) {
        return Identifier.of(String(Value.of(parameter.name))).valueOf(Value.of(parameter.value))
      }
      const propName = mayToId(parameter.name || "")
      if (propName !== parameter.name) {
        return Identifier.of(String(Value.of(parameter.name))).valueOf(Identifier.of(propName))
      }
      return Identifier.of(parameter.name)
    }),
  )

const mayToId = (id: string): string => (isIdentifier(id) ? id : toLowerCamelCase(id))

export const getReqParamSchema = (parameters: IParameter[]): IJSONSchema => {
  return ({
    type: "object",
    properties: lodash.reduce(
      parameters,
      (properties: Dictionary<ISchema>, parameter: IParameter) => {
        const schema = parameter.schema

        let propName = mayToId(parameter.name || "")

        if (parameter.name !== propName) {
          propName = String(Value.of(parameter.name))
        }

        return lodash.assign(properties, {
          [propName]: schema,
        })
      },
      {},
    ),
    required: pickRequiredList(parameters),
  })


}

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

const getRespBodySchema = (responses: IResponses) => {
  let bodySchema: ISchema = { type: "null" }

  lodash.forEach(responses, (resp: IResponse, codeOrDefault) => {
    const code = Number(codeOrDefault)
    if (code >= 200 && code < 300 && resp.content) {
      const mediaType = lodash.first(lodash.values(resp.content))
      if (mediaType && mediaType.schema) {
        bodySchema = mediaType.schema!
      }
    }
  })

  return bodySchema
}

export const isMultipartFormData = (contentType: string = "") => contentType.indexOf("multipart/form-data") > -1
export const isFormURLEncoded = (contentType: string = "") => contentType.indexOf(
  "application/x-www-form-urlencoded") > -1

export const getOperations = (operation: IExtraOperation, clientOpts: IClientOpts): string => {
  const parameters = ((operation.parameters || []) as IParameter[])
    .map((parameter: IParameter) => ({
      ...parameter,
      schema: {
        ...parameter.schema,
        id: [operation.operationId, parameter.name].join("_"),
      },
    }))

  const operationUiq = `${clientOpts.clientId}.${operation.operationId}`

  const members = [
    Identifier.of("method").valueOf(Value.of(lodash.toUpper(operation.method))),
    Identifier.of("url").valueOf(new Value(urlToTemplate(operation.path))),
  ]

  const query = filterParametersIn("query")(parameters)
  const headers = filterParametersIn("header")(parameters)

  if (query.length) {
    members.push(Identifier.of("query").valueOf(createParameterObject(query)))
  }

  let bodyContentType = ""

  if (operation.requestBody) {
    for (const contentType in (operation.requestBody as IRequestBody).content) {
      const mediaType = (operation.requestBody as IRequestBody).content[contentType]
      bodyContentType = contentType
      if (isMultipartFormData(contentType) || isFormURLEncoded(contentType)) {
        if (mediaType.schema) {
          lodash.forEach((mediaType.schema as ISchema).properties!, (propSchema: ISchema, key: string) => {
            parameters.push({
              in: "formData",
              name: key,
              required: lodash.includes((mediaType.schema as ISchema).required || [], key),
              schema: propSchema as ISchemaOrReference,
            } as any)
          })

          members.push(
            Identifier.of("data")
              .valueOf(
                createParameterObject(
                  (lodash.map((mediaType.schema! as any).properties!, (propsSchema: any, name: string) => ({
                    ...propsSchema,
                    name,
                  }))) as IParameter[])))
        }
        break
      }

      if (mediaType.schema) {
        parameters.push({
          in: "body",
          name: "body",
          required: true,
          schema: mediaType.schema as ISchemaOrReference,
        } as any)
      }

      members.push(Identifier.of("data").valueOf(Identifier.of("body")))
      break
    }
  }

  if (headers.length || bodyContentType) {
    let parametersForHeader = headers
    if (bodyContentType) {
      parametersForHeader = parametersForHeader.concat({
        name: "Content-Type",
        value: bodyContentType,
      })
    }
    members.push(Identifier.of("headers").valueOf(createParameterObject(parametersForHeader)))
  }

  let callbackFunc = Identifier.of("").operatorsWith(": ", " => ")

  if (parameters.length) {
    callbackFunc = callbackFunc.paramsWith(Identifier.of(String(createParameterObject(parameters as IParameter[]))))
  } else {
    callbackFunc = callbackFunc.paramsWith(Identifier.of(""))
  }

  callbackFunc = callbackFunc.valueOf(Value.memberOf(Decl.returnOf(Identifier.of(String(Value.objectOf(...members))))))

  const respBodySchema = getRespBodySchema(operation.responses)

  const callFunc = Identifier.of(clientOpts.clientLib.method)
    .generics(
      parameters.length ? toTypings(getReqParamSchema(parameters as IParameter[])) : Identifier.of("void"),
      toTypings(respBodySchema as IJSONSchema),
    )
    .paramsWith(Identifier.of(String(Value.of(operationUiq))), callbackFunc)

  return `${ModuleExport.decl(
    Decl.const(Identifier.of(toLowerCamelCase(operation.operationId || "")).valueOf(callFunc)))}`
}

export const getClient = (openApi: IOpenAPI, clientOpts: IClientOpts) => {
  let operations = lodash.flattenDeep<IExtraOperation>(lodash.map(openApi.paths, (pathItem: any, path: string) =>
    lodash.map(pathItem, (operation: IOperation, method: IMethod) => {
      return {
        ...operation,
        method,
        path,
      }
    }),
  ) as any)

  operations = lodash.sortBy(operations, (op: IExtraOperation) => op.operationId)

  return pickSideDefs(
    ([] as string[])
      .concat(
        ModuleImport.from(clientOpts.clientLib.path)
          .membersAs(Identifier.of(clientOpts.clientLib.method))
          .toString(),
        lodash.map(operations, (op) => getOperations(op as IExtraOperation, clientOpts)),
      )
      .join("\n\n"),
  ) + "\n\n" + getDefinitions(openApi)
}
