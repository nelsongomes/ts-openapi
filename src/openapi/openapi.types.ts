import Joi from "joi";

export type Server = { url: string };
export type Servers = Server[];
export type Method = "put" | "get" | "post" | "delete";
export type Tags = string[];

export type Body = {
  description: string;
  schema?: SchemaTypes;
  content: {
    [mimetype: string]: {
      schema?: SchemaTypeObject;
    };
  };
  required?: boolean;
};

export type Responses = {
  [statusCode: number]: Body;
};

export type EnumArray = {
  type: "array";
  items: {
    type: "string";
    default?: string;
    enum: string[];
  };
};

export enum ParameterIn {
  Query = "query",
  Path = "path",
  Header = "header",
  Cookie = "cookie",
  Body = "requestBody",
}

export enum StringFormats {
  DateTime = "date-time",
  Date = "date",
  Byte = "byte",
  Binary = "binary",
  Email = "email",
  Password = "password",
  Uuid = "uuid",
  Uri = "uri",
  Hostname = "hostname",
  Ipv4 = "ipv4",
  Ipv6 = "ipv6",
}
export enum NumberFormats {
  Float = "float",
  Double = "double",
}
export enum IntegerFormats {
  Int32 = "int32",
  Int64 = "int64",
}

export type SchemaTypeString = {
  type: "string";
  format?: StringFormats;
  default?: string;
  nullable?: boolean;
  minLength?: number;
  maxLength?: number;
  description?: string;
};
export type SchemaTypeBoolean = {
  type: "boolean";
  default?: number;
  nullable?: boolean;
  description?: string;
};
export type SchemaTypeInteger = {
  type: "integer";
  format?: IntegerFormats;
  minimum?: number;
  maximum?: number;
  default?: number;
  nullable?: boolean;
  description?: string;
};
export type SchemaTypeNumber = {
  type: "number";
  format?: NumberFormats;
  minimum?: number;
  maximum?: number;
  default?: number;
  nullable?: boolean;
  description?: string;
};
export type SchemaTypeArray = {
  type: "array";
  items?: SchemaTypes;
  default?: string[] | number[];
  example?: string[] | number[];
  nullable?: boolean;
};
export type SchemaTypeObject = {
  type: "object";
  properties: { [k: string]: SchemaTypes };
  default?: string;
  nullable?: boolean;
  $ref?: string;
  description: string;
};
export type SchemaTypes =
  | SchemaTypeString
  | SchemaTypeInteger
  | SchemaTypeNumber
  | SchemaTypeArray
  | SchemaTypeBoolean
  | SchemaTypeObject;

export type Parameter = {
  name: string;
  in: ParameterIn;
  description: string;
  required: boolean;
  style?: "form";
  explode?: boolean;
  schema: SchemaTypes;
  example?: string | number | string[] | number[];
};
export type Parameters = Parameter[];
export type Path = {
  [K in Method]?: {
    tags: Tags;
    summary: string;
    description: string;
    operationId: string;
    parameters?: Parameters;
    requestBody?: Body;
    responses: Responses;
  };
};
export type Paths = {
  [path: string]: Path;
};

export type OpenApiSchema = {
  info: {
    contact: { email: string };
    description: string;
    license: {
      name: string;
      url: string;
    };
    termsOfService: string;
    title: string;
    version: string;
  };
  openapi: "3.0.1";
  paths: Paths;
  servers: Servers;
};

export type WebRequestSchema = {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
  headers?: Joi.ObjectSchema;
};
