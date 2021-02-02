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
  Body = "requestBody"
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
  Ipv6 = "ipv6"
}
export enum NumberFormats {
  Float = "float",
  Double = "double"
}
export enum IntegerFormats {
  Int32 = "int32",
  Int64 = "int64"
}

export type Scheme = { [k: string]: string[] };
export type SecuritySchemeArray = Scheme[];

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
export type PathDefinition = {
  tags: Tags;
  summary: string;
  description: string;
  operationId: string;
  security?: SecuritySchemeArray;
  parameters?: Parameters;
  requestBody?: Body;
  responses: Responses;
};
export type Path = {
  [K in Method]?: PathDefinition;
};
export type PathInputDefinition = {
  tags: Tags;
  summary: string;
  description: string;
  operationId: string;
  security?: SecuritySchemeArray;
  responses: Responses;
  validationSchema?: WebRequestSchema;
};
export type PathInput = {
  [K in Method]?: PathInputDefinition;
};
export type Paths = {
  [path: string]: Path;
};

export type SecurityBasicScheme = {
  type: "http";
  scheme: "basic";
};

export type SecurityApiKeySchemeMethod = "header" | "cookie" | "query";
export type SecurityApiKeyScheme = {
  type: "apiKey";
  in: SecurityApiKeySchemeMethod;
  name: string;
};

export type SecurityBearerScheme = {
  type: "http";
  scheme: "bearer";
  bearerFormat?: string;
};

export type SecurityOauth2Scopes = {
  [scopeName: string]: string;
};
export type SecurityOauth2Scheme = {
  type: "oauth2";
  description: string;
  flows: {
    authorizationCode?: {
      authorizationUrl: string;
      tokenUrl: string;
      refreshUrl?: string;
      scopes: SecurityOauth2Scopes;
    };
    implicit?: {
      authorizationUrl: string;
      refreshUrl?: string;
      scopes: SecurityOauth2Scopes;
    };
    password?: {
      tokenUrl: string;
      refreshUrl?: string;
      scopes: SecurityOauth2Scopes;
    };
    clientCredentials?: {
      tokenUrl: string;
      refreshUrl?: string;
      scopes: SecurityOauth2Scopes;
    };
  };
};

export type SecurityScheme =
  | SecurityBasicScheme
  | SecurityApiKeyScheme
  | SecurityBearerScheme
  | SecurityOauth2Scheme;

export type OpenApiComponents = {
  schemas?: { [k: string]: SchemaTypes };
  securitySchemes?: { [k: string]: SecurityScheme };
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
  components?: OpenApiComponents;
  security?: SecuritySchemeArray;
};

export type WebRequestSchema = {
  body?: Joi.ObjectSchema;
  query?: Joi.SchemaMap<any>;
  params?: Joi.SchemaMap<any>;
  headers?: Joi.SchemaMap<any>;
  cookie?: Joi.SchemaMap<any>;
};
