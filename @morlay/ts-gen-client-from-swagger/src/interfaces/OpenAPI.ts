export interface IInfo {
  title: string;
  description?: string;
  termsOfService?: string;
  contact?: IContact;
  license?: ILicense;
  version: string;
  [k: string]: ISpecificationExtension;
}

export interface IContact {
  name?: string;
  url?: string;
  email?: string;
  [k: string]: ISpecificationExtension;
}

export interface ILicense {
  name: string;
  url?: string;
  [k: string]: ISpecificationExtension;
}

export interface IServer {
  url: string;
  description?: string;
  variables?: IServerVariables;
  [k: string]: ISpecificationExtension;
}

export interface IServerVariable {
  enum?: [string][];
  default: string;
  description?: string;
  [k: string]: ISpecificationExtension;
}

export interface IComponents {
  schemas?: ISchemasOrReferences;
  responses?: IResponsesOrReferences;
  parameters?: IParametersOrReferences;
  examples?: IExamplesOrReferences;
  requestBodies?: IRequestBodiesOrReferences;
  headers?: IHeadersOrReferences;
  securitySchemes?: ISecuritySchemesOrReferences;
  links?: ILinksOrReferences;
  callbacks?: ICallbacksOrReferences;
  [k: string]: ISpecificationExtension;
}

export interface IPaths {
  [k: string]: IPathItem | ISpecificationExtension;
}

export interface IPathItem {
  $ref?: string;
  summary?: string;
  description?: string;
  get?: IOperation;
  put?: IOperation;
  post?: IOperation;
  delete?: IOperation;
  options?: IOperation;
  head?: IOperation;
  patch?: IOperation;
  trace?: IOperation;
  servers?: [IServer][];
  parameters?: [IParameterOrReference][];
  [k: string]: ISpecificationExtension;
}

export interface IOperation {
  tags?: [string][];
  summary?: string;
  description?: string;
  externalDocs?: IExternalDocs;
  operationId?: string;
  parameters?: [IParameterOrReference][];
  requestBody?: IRequestBodyOrReference;
  responses: IResponses;
  callbacks?: ICallbacksOrReferences;
  deprecated?: boolean;
  security?: [ISecurityRequirement][];
  servers?: [IServer][];
  [k: string]: ISpecificationExtension;
}

export interface IExternalDocs {
  description?: string;
  url: string;
  [k: string]: ISpecificationExtension;
}

export interface IParameter {
  name: string;
  in: string;
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
  schema?: ISchemaOrReference;
  example?: IAny;
  examples?: IExamplesOrReferences;
  content?: IMediaTypes;
  [k: string]: ISpecificationExtension;
}

export interface IRequestBody {
  description?: string;
  content: IMediaTypes;
  required?: boolean;
  [k: string]: ISpecificationExtension;
}

export interface IMediaType {
  schema?: ISchemaOrReference;
  example?: IAny;
  examples?: IExamplesOrReferences;
  encoding?: IEncodings;
  [k: string]: ISpecificationExtension;
}

export interface IEncoding {
  contentType?: string;
  headers?: IHeaders;
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
  [k: string]: ISpecificationExtension;
}

export interface IResponses {
  default?: IResponseOrReference;
  [k: string]: IResponseOrReference | ISpecificationExtension;
}

export interface IResponse {
  description: string;
  headers?: IHeadersOrReferences;
  content?: IMediaTypes;
  links?: ILinksOrReferences;
  [k: string]: ISpecificationExtension;
}

export interface ICallback {
  [k: string]: IPathItem | ISpecificationExtension;
}

export interface IExample {
  summary?: string;
  description?: string;
  value?: IAny;
  externalValue?: string;
  [k: string]: ISpecificationExtension;
}

export interface ILink {
  operationRef?: string;
  operationId?: string;
  parameters?: IAnysOrExpressions;
  requestBody?: IAnyOrExpression;
  description?: string;
  server?: IServer;
  [k: string]: ISpecificationExtension;
}

export interface IHeader {
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
  schema?: ISchemaOrReference;
  example?: IAny;
  examples?: IExamplesOrReferences;
  content?: IMediaTypes;
  [k: string]: ISpecificationExtension;
}

export interface ITag {
  name: string;
  description?: string;
  externalDocs?: IExternalDocs;
  [k: string]: ISpecificationExtension;
}

export interface IExamples {}

export interface IReference {
  $ref: string;
}

export interface ISchema {
  nullable?: boolean;
  discriminator?: IDiscriminator;
  readOnly?: boolean;
  writeOnly?: boolean;
  xml?: IXML;
  externalDocs?: IExternalDocs;
  example?: IAny;
  deprecated?: boolean;
  title?: string;
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: boolean;
  minimum?: number;
  exclusiveMinimum?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxProperties?: number;
  minProperties?: number;
  required?: [string][];
  enum?: [any][];
  type?: string;
  allOf?: [ISchemaOrReference][];
  oneOf?: [ISchemaOrReference][];
  anyOf?: [ISchemaOrReference][];
  not?: ISchema;
  items?: ISchemaOrReference | [ISchemaOrReference][];
  properties?: {
    [k: string]: ISchemaOrReference;
  };
  additionalProperties?: ISchemaOrReference | boolean;
  default?: IDefaultType;
  description?: string;
  format?: string;
  [k: string]: ISpecificationExtension;
}

export interface IDiscriminator {
  propertyName: string;
  mapping?: IStrings;
}

export interface IXML {
  name?: string;
  namespace?: string;
  prefix?: string;
  attribute?: boolean;
  wrapped?: boolean;
  [k: string]: ISpecificationExtension;
}

export interface ISecurityScheme {
  type: string;
  description?: string;
  name?: string;
  in?: string;
  scheme?: string;
  bearerFormat?: string;
  flows?: IOauthFlows;
  openIdConnectUrl?: string;
  [k: string]: ISpecificationExtension;
}

export interface IOauthFlows {
  implicit?: IOauthFlow;
  password?: IOauthFlow;
  clientCredentials?: IOauthFlow;
  authorizationCode?: IOauthFlow;
  [k: string]: ISpecificationExtension;
}

export interface IOauthFlow {
  authorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  scopes?: IStrings;
  [k: string]: ISpecificationExtension;
}

export interface ISecurityRequirement {
  [k: string]: [string][];
}

export type IAnyOrExpression = IAny | IExpression;

export type ICallbackOrReference = ICallback | IReference;

export type IExampleOrReference = IExample | IReference;

export type IHeaderOrReference = IHeader | IReference;

export type ILinkOrReference = ILink | IReference;

export type IParameterOrReference = IParameter | IReference;

export type IRequestBodyOrReference = IRequestBody | IReference;

export type IResponseOrReference = IResponse | IReference;

export type ISchemaOrReference = ISchema | IReference;

export type ISecuritySchemeOrReference = ISecurityScheme | IReference;

export interface IAnysOrExpressions {
  [k: string]: IAnyOrExpression;
}

export interface ICallbacksOrReferences {
  [k: string]: ICallbackOrReference;
}

export interface IEncodings {
  [k: string]: IEncoding;
}

export interface IExamplesOrReferences {
  [k: string]: IExampleOrReference;
}

export interface IHeaders {
  [k: string]: IHeader;
}

export interface IHeadersOrReferences {
  [k: string]: IHeaderOrReference;
}

export interface ILinksOrReferences {
  [k: string]: ILinkOrReference;
}

export interface IMediaTypes {
  [k: string]: IMediaType;
}

export interface IParametersOrReferences {
  [k: string]: IParameterOrReference;
}

export interface IRequestBodiesOrReferences {
  [k: string]: IRequestBodyOrReference;
}

export interface IResponsesOrReferences {
  [k: string]: IResponseOrReference;
}

export interface ISchemasOrReferences {
  [k: string]: ISchemaOrReference;
}

export interface ISecuritySchemesOrReferences {
  [k: string]: ISecuritySchemeOrReference;
}

export interface IServerVariables {
  [k: string]: IServerVariable;
}

export interface IStrings {
  [k: string]: string;
}

export interface IObject {
  [k: string]: any;
}

export interface IAny {
  [k: string]: any;
}

export interface IExpression {
  [k: string]: any;
}

export type ISpecificationExtension = any;

export type IDefaultType = any;

export interface IOpenAPI {
  openapi: "3.0.0";
  info: IInfo;
  servers?: [IServer][];
  paths: IPaths;
  components?: IComponents;
  security?: [ISecurityRequirement][];
  tags?: [ITag][];
  externalDocs?: IExternalDocs;
  [k: string]: ISpecificationExtension;
}
