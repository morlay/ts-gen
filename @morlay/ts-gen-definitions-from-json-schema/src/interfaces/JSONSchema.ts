export enum SimpleTypes {
  array = "array",
  "boolean" = "boolean",
  integer = "integer",
  "null" = "null",
  number = "number",
  object = "object",
  string = "string",
}

export type ISchemaOrBoolean = IJSONSchema | boolean;

export type ISchemaArray = IJSONSchema[];

export type INonNegativeInteger = number;

export type INonNegativeIntegerDefault0 = INonNegativeInteger;

export type ISimpleTypes = keyof typeof SimpleTypes;

export type IStringArray = string[];

export interface IJSONSchema {
  $id?: string;
  $schema?: string;
  $ref?: string;
  $comment?: string;
  title?: string;
  description?: string;
  default?: any;
  readOnly?: boolean;
  examples?: any[];
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: boolean;
  minimum?: number;
  exclusiveMinimum?: boolean;
  maxLength?: INonNegativeInteger;
  minLength?: INonNegativeIntegerDefault0;
  pattern?: string;
  additionalItems?: ISchemaOrBoolean;
  items?: IJSONSchema | ISchemaArray;
  maxItems?: INonNegativeInteger;
  minItems?: INonNegativeIntegerDefault0;
  uniqueItems?: boolean;
  contains?: IJSONSchema;
  maxProperties?: INonNegativeInteger;
  minProperties?: INonNegativeIntegerDefault0;
  required?: IStringArray;
  additionalProperties?: ISchemaOrBoolean;
  definitions?: {
    [k: string]: IJSONSchema;
  };
  properties?: {
    [k: string]: IJSONSchema;
  };
  patternProperties?: {
    [k: string]: IJSONSchema;
  };
  dependencies?: {
    [k: string]: IJSONSchema | IStringArray;
  };
  propertyNames?: IJSONSchema;
  enum?: any[];
  type?: ISimpleTypes;
  format?: string;
  contentMediaType?: string;
  contentEncoding?: string;
  if?: IJSONSchema;
  then?: IJSONSchema;
  else?: IJSONSchema;
  allOf?: ISchemaArray;
  anyOf?: ISchemaArray;
  oneOf?: ISchemaArray;
  not?: IJSONSchema;
}
