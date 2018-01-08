export * from "./utils"
import { getClient as getClientV2 } from "./client"
import { getClient as getClientV3 } from "./client_v3"
import { IOpenAPI } from "./interfaces/OpenAPI"
import { ISwagger } from "./interfaces/Swagger"
import { IClientOpts } from "./utils"

export const getClient = (swagger: ISwagger | IOpenAPI, clientOpts: IClientOpts) => {
  if (swagger.openapi) {
    return getClientV3(swagger as IOpenAPI, clientOpts)
  }
  return getClientV2(swagger as ISwagger, clientOpts)
}
