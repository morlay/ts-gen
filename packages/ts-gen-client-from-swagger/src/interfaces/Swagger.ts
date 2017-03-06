export interface IInfo {
  title: string;
  version: string;
  description?: string;
  termsOfService?: string;
  contact?: IContact;
  license?: ILicense;
  [k: string]: IVendorExtension;
}

export interface IContact {
  name?: string;
  url?: string;
  email?: string;
  [k: string]: IVendorExtension;
}

export interface ILicense {
  name: string;
  url?: string;
  [k: string]: IVendorExtension;
}

export interface IPaths {
  [k: string]: IVendorExtension | IPathItem | any;
}

export interface IDefinitions {
  [k: string]: ISchema;
}

export interface IParameterDefinitions {
  [k: string]: IParameter;
}

export interface IResponseDefinitions {
  [k: string]: IResponse;
}

export interface IExternalDocs {
  description?: string;
  url: string;
  [k: string]: IVendorExtension;
}

export interface IExamples {
  [k: string]: any;
}

export type IMimeType = string

export interface IOperation {
  tags?: string[];
  summary?: string;
  description?: string;
  externalDocs?: IExternalDocs;
  operationId?: string;
  produces?: IMediaTypeList;
  consumes?: IMediaTypeList;
  parameters?: IParametersList;
  responses: IResponses;
  schemes?: ISchemesList;
  deprecated?: boolean;
  security?: ISecurity;
  [k: string]: IVendorExtension;
}

export interface IPathItem {
  $ref?: string;
  get?: IOperation;
  put?: IOperation;
  post?: IOperation;
  delete?: IOperation;
  options?: IOperation;
  head?: IOperation;
  patch?: IOperation;
  parameters?: IParametersList;
  [k: string]: IVendorExtension;
}

export interface IResponses {
  [k: string]: IResponseValue | IVendorExtension | any;
}

export type IResponseValue = IResponse | IJSONReference

export interface IResponse {
  description: string;
  schema?: ISchema | IFileSchema;
  headers?: IHeaders;
  examples?: IExamples;
  [k: string]: IVendorExtension;
}

export interface IHeaders {
  [k: string]: IHeader;
}

export interface IHeader {
  type: "string" | "number" | "integer" | "boolean" | "array";
  format?: string;
  items?: IPrimitivesItems;
  collectionFormat?: ICollectionFormat;
  default?: ITypeDefault;
  maximum?: IMaximum;
  exclusiveMaximum?: IExclusiveMaximum;
  minimum?: IMinimum;
  exclusiveMinimum?: IExclusiveMinimum;
  maxLength?: IMaxLength;
  minLength?: IMinLength;
  pattern?: IPattern;
  maxItems?: IMaxItems;
  minItems?: IMinItems;
  uniqueItems?: IUniqueItems;
  enum?: IEnum;
  multipleOf?: IMultipleOf;
  description?: string;
  [k: string]: IVendorExtension;
}

export type IVendorExtension = any

export interface IBodyParameter {
  description?: string;
  name: string;
  in: "body";
  required?: boolean;
  schema: ISchema;
  [k: string]: IVendorExtension;
}

export interface IHeaderParameterSubSchema {
  required?: boolean;
  in?: "header";
  description?: string;
  name?: string;
  type?: "string" | "number" | "boolean" | "integer" | "array";
  format?: string;
  items?: IPrimitivesItems;
  collectionFormat?: ICollectionFormat;
  default?: ITypeDefault;
  maximum?: IMaximum;
  exclusiveMaximum?: IExclusiveMaximum;
  minimum?: IMinimum;
  exclusiveMinimum?: IExclusiveMinimum;
  maxLength?: IMaxLength;
  minLength?: IMinLength;
  pattern?: IPattern;
  maxItems?: IMaxItems;
  minItems?: IMinItems;
  uniqueItems?: IUniqueItems;
  enum?: IEnum;
  multipleOf?: IMultipleOf;
  [k: string]: IVendorExtension;
}

export interface IQueryParameterSubSchema {
  required?: boolean;
  in?: "query";
  description?: string;
  name?: string;
  allowEmptyValue?: boolean;
  type?: "string" | "number" | "boolean" | "integer" | "array";
  format?: string;
  items?: IPrimitivesItems;
  collectionFormat?: ICollectionFormatWithMulti;
  default?: ITypeDefault;
  maximum?: IMaximum;
  exclusiveMaximum?: IExclusiveMaximum;
  minimum?: IMinimum;
  exclusiveMinimum?: IExclusiveMinimum;
  maxLength?: IMaxLength;
  minLength?: IMinLength;
  pattern?: IPattern;
  maxItems?: IMaxItems;
  minItems?: IMinItems;
  uniqueItems?: IUniqueItems;
  enum?: IEnum;
  multipleOf?: IMultipleOf;
  [k: string]: IVendorExtension;
}

export interface IFormDataParameterSubSchema {
  required?: boolean;
  in?: "formData";
  description?: string;
  name?: string;
  allowEmptyValue?: boolean;
  type?: "string" | "number" | "boolean" | "integer" | "array" | "file";
  format?: string;
  items?: IPrimitivesItems;
  collectionFormat?: ICollectionFormatWithMulti;
  default?: ITypeDefault;
  maximum?: IMaximum;
  exclusiveMaximum?: IExclusiveMaximum;
  minimum?: IMinimum;
  exclusiveMinimum?: IExclusiveMinimum;
  maxLength?: IMaxLength;
  minLength?: IMinLength;
  pattern?: IPattern;
  maxItems?: IMaxItems;
  minItems?: IMinItems;
  uniqueItems?: IUniqueItems;
  enum?: IEnum;
  multipleOf?: IMultipleOf;
  [k: string]: IVendorExtension;
}

export interface IPathParameterSubSchema {
  required: true;
  in?: "path";
  description?: string;
  name?: string;
  type?: "string" | "number" | "boolean" | "integer" | "array";
  format?: string;
  items?: IPrimitivesItems;
  collectionFormat?: ICollectionFormat;
  default?: ITypeDefault;
  maximum?: IMaximum;
  exclusiveMaximum?: IExclusiveMaximum;
  minimum?: IMinimum;
  exclusiveMinimum?: IExclusiveMinimum;
  maxLength?: IMaxLength;
  minLength?: IMinLength;
  pattern?: IPattern;
  maxItems?: IMaxItems;
  minItems?: IMinItems;
  uniqueItems?: IUniqueItems;
  enum?: IEnum;
  multipleOf?: IMultipleOf;
  [k: string]: IVendorExtension;
}

export type INonBodyParameter = IHeaderParameterSubSchema | IFormDataParameterSubSchema | IQueryParameterSubSchema | IPathParameterSubSchema

export type IParameter = IBodyParameter | INonBodyParameter

export interface ISchema {
  $ref?: string;
  format?: string;
  title?: string;
  description?: string;
  default?: any;
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
  required?: string[];
  enum?: any[];
  additionalProperties?: ISchema | boolean;
  type?: "array" | "boolean" | "integer" | "null" | "number" | "object" | "string" | Array<"array" | "boolean" | "integer" | "null" | "number" | "object" | "string">;
  items?: ISchema | ISchema[];
  allOf?: ISchema[];
  properties?: {
    [k: string]: ISchema;
  };
  discriminator?: string;
  readOnly?: boolean;
  xml?: IXML;
  externalDocs?: IExternalDocs;
  example?: any;
  [k: string]: IVendorExtension;
}

export interface IFileSchema {
  format?: string;
  title?: string;
  description?: string;
  default?: any;
  required?: string[];
  type: "file";
  readOnly?: boolean;
  externalDocs?: IExternalDocs;
  example?: any;
  [k: string]: IVendorExtension;
}

export interface IPrimitivesItems {
  type?: "string" | "number" | "integer" | "boolean" | "array";
  format?: string;
  items?: IPrimitivesItems;
  collectionFormat?: ICollectionFormat;
  default?: ITypeDefault;
  maximum?: IMaximum;
  exclusiveMaximum?: IExclusiveMaximum;
  minimum?: IMinimum;
  exclusiveMinimum?: IExclusiveMinimum;
  maxLength?: IMaxLength;
  minLength?: IMinLength;
  pattern?: IPattern;
  maxItems?: IMaxItems;
  minItems?: IMinItems;
  uniqueItems?: IUniqueItems;
  enum?: IEnum;
  multipleOf?: IMultipleOf;
  [k: string]: IVendorExtension;
}

export type ISecurity = ISecurityRequirement[]

export interface ISecurityRequirement {
  [k: string]: string[];
}

export interface IXML {
  name?: string;
  namespace?: string;
  prefix?: string;
  attribute?: boolean;
  wrapped?: boolean;
  [k: string]: IVendorExtension;
}

export interface ITag {
  name: string;
  description?: string;
  externalDocs?: IExternalDocs;
  [k: string]: IVendorExtension;
}

export interface ISecurityDefinitions {
  [k: string]: IBasicAuthenticationSecurity | IAPIKeySecurity | IOauth2ImplicitSecurity | IOauth2PasswordSecurity | IOauth2ApplicationSecurity | IOauth2AccessCodeSecurity;
}

export interface IBasicAuthenticationSecurity {
  type: "basic";
  description?: string;
  [k: string]: IVendorExtension;
}

export interface IAPIKeySecurity {
  type: "apiKey";
  name: string;
  in: "header" | "query";
  description?: string;
  [k: string]: IVendorExtension;
}

export interface IOauth2ImplicitSecurity {
  type: "oauth2";
  flow: "implicit";
  scopes?: IOauth2Scopes;
  authorizationUrl: string;
  description?: string;
  [k: string]: IVendorExtension;
}

export interface IOauth2PasswordSecurity {
  type: "oauth2";
  flow: "password";
  scopes?: IOauth2Scopes;
  tokenUrl: string;
  description?: string;
  [k: string]: IVendorExtension;
}

export interface IOauth2ApplicationSecurity {
  type: "oauth2";
  flow: "application";
  scopes?: IOauth2Scopes;
  tokenUrl: string;
  description?: string;
  [k: string]: IVendorExtension;
}

export interface IOauth2AccessCodeSecurity {
  type: "oauth2";
  flow: "accessCode";
  scopes?: IOauth2Scopes;
  authorizationUrl: string;
  tokenUrl: string;
  description?: string;
  [k: string]: IVendorExtension;
}

export interface IOauth2Scopes {
  [k: string]: string;
}

export type IMediaTypeList = IMimeType[]

export type IParametersList = Array<IParameter | IJSONReference | any>

export type ISchemesList = Array<"http" | "https" | "ws" | "wss">

export type ICollectionFormat = "csv" | "ssv" | "tsv" | "pipes"

export type ICollectionFormatWithMulti = "csv" | "ssv" | "tsv" | "pipes" | "multi"

export type ITitle = string

export type IDescription = string

export type ITypeDefault = any

export type IMultipleOf = number

export type IMaximum = number

export type IExclusiveMaximum = boolean

export type IMinimum = number

export type IExclusiveMinimum = boolean

export type IMaxLength = number

export type IMinLength = number

export type IPattern = string

export type IMaxItems = number

export type IMinItems = number

export type IUniqueItems = boolean

export type IEnum = any[]

export interface IJSONReference {
  $ref: string;
}

export interface ISwagger {
  swagger: "2.0";
  info: IInfo;
  host?: string;
  basePath?: string;
  schemes?: ISchemesList;
  consumes?: IMediaTypeList;
  produces?: IMediaTypeList;
  paths: IPaths;
  definitions?: IDefinitions;
  parameters?: IParameterDefinitions;
  responses?: IResponseDefinitions;
  security?: ISecurity;
  securityDefinitions?: ISecurityDefinitions;
  tags?: ITag[];
  externalDocs?: IExternalDocs;
  [k: string]: IVendorExtension;
}
