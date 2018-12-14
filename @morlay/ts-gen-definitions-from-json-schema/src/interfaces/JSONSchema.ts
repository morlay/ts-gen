export enum SimpleTypes {
  array = "array",
  boolean = "boolean",
  integer = "integer",
  null = "null",
  number = "number",
  object = "object",
  string = "string",
}

export type ISchemaArray = IJSONSchema[];

export type IPositiveInteger = number;

export type IPositiveIntegerDefault0 = IPositiveInteger;

export type ISimpleTypes = keyof typeof SimpleTypes;

export type IStringArray = string[];

export interface IJSONSchema {
  id?: string;
  $ref?: string;
  $schema?: string;
  title?: string;
  description?: string;
  default?: any;
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: boolean;
  minimum?: number;
  exclusiveMinimum?: boolean;
  maxLength?: IPositiveInteger;
  minLength?: IPositiveIntegerDefault0;
  pattern?: string;
  additionalItems?: boolean | IJSONSchema;
  items?: IJSONSchema | ISchemaArray;
  maxItems?: IPositiveInteger;
  minItems?: IPositiveIntegerDefault0;
  uniqueItems?: boolean;
  maxProperties?: IPositiveInteger;
  minProperties?: IPositiveIntegerDefault0;
  required?: IStringArray;
  additionalProperties?: boolean | IJSONSchema;
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
  enum?: any[];
  type?: ISimpleTypes | ISimpleTypes[];
  allOf?: ISchemaArray;
  anyOf?: ISchemaArray;
  oneOf?: ISchemaArray;
  not?: IJSONSchema;
}
