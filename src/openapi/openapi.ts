import { Schema } from "joi";
import { ApplicationError } from "../errors/application-error";
import joiToSwagger, { SwaggerSchema } from "../joi-conversion";
import { validateParameters } from "./openapi-validation";
import {
  IntegerFormats,
  NumberFormats,
  OpenApiSchema,
  Parameter,
  ParameterIn,
  Parameters,
  Path,
  SchemaTypeArray,
  SchemaTypeInteger,
  SchemaTypeNumber,
  SchemaTypeString,
  SchemaTypeBoolean,
  Servers,
  StringFormats,
  SchemaTypeObject,
  RequestBody,
} from "./openapi.types";

const REQUIRED_TYPES = [ParameterIn.Path];

export class OpenApi {
  private schema: OpenApiSchema;
  private operationIds: string[] = [];

  constructor(
    version: string,
    title: string,
    description: string,
    email: string
  ) {
    this.schema = {
      info: {
        contact: {
          email,
        },
        description,
        license: {
          name: "Apache 2.0",
          url: "http://www.apache.org/licenses/LICENSE-2.0.html",
        },
        termsOfService: "http://swagger.io/terms/",
        title,
        version,
      },
      openapi: "3.0.1",
      paths: {},
      servers: [],
    };
  }

  public setServers(servers: Servers) {
    this.schema.servers = servers;
  }

  public addPath(path: string, definition: Path, visible: boolean) {
    if (!visible) {
      return;
    }

    if (definition.get && definition.get.requestBody) {
      throw new Error("GET operations cannot have a requestBody.");
    }

    const operationId = (
      definition.get ||
      definition.post ||
      definition.put ||
      definition.delete || { operationId: "unknownOperationId" }
    ).operationId;

    const responses = (
      definition.get ||
      definition.post ||
      definition.put ||
      definition.delete ||
      {}
    ).responses;
    if (Object.getOwnPropertyNames(responses).length === 0) {
      throw new Error("Should define at least one response.");
    }

    if (!operationId) {
      throw new Error("No operationId supplied.");
    }

    if (this.operationIds.includes(operationId)) {
      throw new Error("Operations must have unique operationIds.");
    }

    this.operationIds.push(operationId);
    this.schema.paths[path] = definition;
  }

  public setLicense(name: string, url: string, termsOfService: string) {
    this.schema.info.license.name = name;
    this.schema.info.license.url = url;
    this.schema.info.termsOfService = termsOfService;
  }

  public bodyParams(schema: Schema, description: string): RequestBody {
    const query = joiToSwagger(schema, {});

    if (!schema || Object.keys(query.swagger.properties).length === 0) {
      throw new Error("Empty object body.");
    }

    if (Object.keys(query.swagger.properties).length > 1) {
      throw new Error("It's only possible to have one body object definition.");
    }

    const key = Object.keys(query.swagger.properties)[0];
    const parameter = query.swagger.properties[key];
    const isRequired =
      query.swagger.required && query.swagger.required.includes(key);

    if (parameter.type !== "object") {
      throw new Error("Request body must be an object definition.");
    }

    if (!isRequired) {
      throw new Error("Request body must be always required, even if empty.");
    }

    return {
      description,
      content: {
        "application/json": {
          schema: this.objectSchema(parameter),
          ...(parameter.example && { example: parameter.example }),
        },
      },
      required: true,
    };
  }

  public genericParams(
    parameters: Parameters,
    schema: Schema,
    type: ParameterIn
  ) {
    if (type === ParameterIn.Body) {
      throw new Error("body content must declared with function bodyParams");
    }

    // added line 345:
    /**
     * if(flattenMeta) {
		Object.assign(swagger, { meta: flattenMeta })
	  }
     */
    const query = joiToSwagger(schema, {});

    for (const key of Object.keys(query.swagger.properties)) {
      const parameter = query.swagger.properties[key];
      const isParameterRequired = this.isRequiredProperty(query.swagger, key);

      // specific parameter context validation
      validateParameters(
        type,
        parameter,
        key,
        parameter.type,
        isParameterRequired
      );

      switch (parameter.type) {
        case "string":
          parameters.push(
            this.stringParameter(key, parameter, isParameterRequired, type)
          );
          break;
        case "number":
        case "integer":
          if (parameter.format && parameter.format === "float") {
            parameters.push(
              this.numberParameter(key, parameter, isParameterRequired, type)
            );
          } else {
            parameters.push(
              this.integerParameter(key, parameter, isParameterRequired, type)
            );
          }
          break;
        case "boolean":
          parameters.push(
            this.booleanParameter(key, parameter, isParameterRequired, type)
          );
          break;
        case "array":
          parameters.push(
            this.arrayParameter(key, parameter, isParameterRequired, type)
          );
          break;
        case "object":
          parameters.push(
            this.objectParameter(key, parameter, isParameterRequired, type)
          );
          break;
        default:
          throw new Error(`Unknown type '${parameter.type}' in openapi`);
      }
    }
  }

  private isRequiredProperty(swagger: SwaggerSchema, key: string) {
    return swagger.required && swagger.required.includes(key);
  }

  public generateJson(): {} {
    if (this.schema.servers.length === 0) {
      throw new ApplicationError(
        500,
        "No servers were added to OpenApi definition"
      );
    }

    if (Object.getOwnPropertyNames(this.schema.paths).length === 0) {
      throw new ApplicationError(
        500,
        "No paths were added to OpenApi definition."
      );
    }

    return this.schema;
  }

  private limitations(parameter: any): string {
    const limitations = [];

    if (parameter.type === "string" && parameter.enum) {
      // min & max should be ignored when is an enum
      delete parameter.minLength;
      delete parameter.maxLength;
    }

    // string
    if (parameter.minLength) {
      limitations.push(`min:${parameter.minLength} chars`);
    }

    if (parameter.maxLength) {
      limitations.push(`max:${parameter.maxLength} chars`);
    }

    // integer / float
    if (parameter.type === "integer" && parameter.enum) {
      // min & max should be ignored when is an enum
      delete parameter.minimum;
      delete parameter.maximum;
    }

    if (parameter.minimum) {
      limitations.push(`min:${parameter.minimum}`);
    }

    if (parameter.maximum) {
      limitations.push(`max:${parameter.maximum}`);
    }

    // array
    if (parameter.minItems) {
      limitations.push(`minItems:${parameter.minItems}`);
    }

    if (parameter.maxItems) {
      limitations.push(`maxItems:${parameter.maxItems}`);
    }

    if (parameter.format) {
      switch (parameter.format) {
        case StringFormats.DateTime:
          if (parameter.meta && parameter.meta.format === "date") {
            limitations.push("min:10");
            limitations.push("max:10");
            limitations.push(`date:yyyy-mm-dd`);
          } else {
            limitations.push(`ISO8601 date-time format`);
          }
          break;
        case StringFormats.Byte:
          limitations.push("base64 encoded string");
          break;
        case StringFormats.Binary:
          limitations.push("binary string");
          break;
      }
    }

    return limitations.length > 0 ? ` (${limitations.join(", ")})` : "";
  }

  private stringParameter(
    name: string,
    parameter: any,
    required: boolean,
    type: ParameterIn
  ): Parameter {
    const limitationDetail = this.limitations(parameter);
    const p: Parameter = {
      description:
        (parameter.description || "Parameter without description.") +
        (limitationDetail || ""),
      in: type,
      name,
      required: isRequiredParameter(required, type),
      schema: this.stringSchema(parameter),
      ...(parameter.example && { example: parameter.example }),
    };

    return p;
  }

  private stringSchema(parameter: any): SchemaTypeString {
    const supportedFormats = Object.values(StringFormats);
    const description =
      (parameter.description || "Parameter without description.") +
      (this.limitations(parameter) || "");

    const output: SchemaTypeString = {
      description,
      ...(parameter.default && { default: parameter.default }),
      ...(parameter.format &&
        supportedFormats.includes(parameter.format) && {
          format: parameter.format,
        }),
      ...(parameter.enum && { enum: parameter.enum }),
      ...(parameter.minLength && { minLength: parameter.minLength }),
      ...(parameter.maxLength && { maxLength: parameter.maxLength }),
      ...(typeof parameter.nullable === "boolean" && {
        nullable: parameter.nullable,
      }),
      type: "string",
    };

    if (parameter.meta) {
      if (parameter.meta.format) {
        parameter.format = parameter.meta.format;
      }
    }

    if (parameter.format && supportedFormats.includes(parameter.format)) {
      output.format = parameter.format;

      switch (parameter.format) {
        case StringFormats.Date:
          output.maxLength = 10; // 2020-10-14
          output.minLength = 10;
          break;
        case StringFormats.DateTime:
          output.minLength = 16; // 20201014T214403Z
          output.maxLength = 25; // 2020-10-14T21:44:03+00:00
          break;
        case StringFormats.Password:
          delete output.default; // no defaults for passwords
          break;
      }
    }

    // default values must be part of enum
    if (
      parameter.enum instanceof Array &&
      !parameter.enum.includes(output.default)
    ) {
      delete output.default;
    }

    return output;
  }

  private numberParameter(
    name: string,
    parameter: any,
    required: boolean,
    type: ParameterIn
  ): Parameter {
    const limitationDetail = this.limitations(parameter);

    const p: Parameter = {
      description:
        (parameter.description || "Parameter without description.") +
        (limitationDetail || ""),
      in: type,
      name,
      required: isRequiredParameter(required, type),
      schema: this.numberSchema(parameter),
      ...(parameter.example && { example: parameter.example }),
    };

    return p;
  }

  private numberSchema(parameter: any): SchemaTypeNumber {
    const description =
      (parameter.description || "Parameter without description.") +
      (this.limitations(parameter) || "");

    const output: SchemaTypeNumber = {
      description,
      ...(parameter.default && { default: parameter.default }),
      ...(parameter.enum && { enum: parameter.enum }),
      ...(parameter.minimum && { minimum: parameter.minimum }),
      ...(parameter.maximum && { maximum: parameter.maximum }),
      ...(typeof parameter.nullable === "boolean" && {
        nullable: parameter.nullable,
      }),
      format: NumberFormats.Double,
      type: "number",
    };

    return output;
  }

  private integerParameter(
    name: string,
    parameter: any,
    required: boolean,
    type: ParameterIn
  ): Parameter {
    const limitationDetail = this.limitations(parameter);

    const p: Parameter = {
      description:
        (parameter.description || "Parameter without description.") +
        (limitationDetail || ""),
      in: type,
      name,
      required: isRequiredParameter(required, type),
      schema: this.integerSchema(parameter),
      ...(parameter.example && { example: parameter.example }),
    };

    return p;
  }

  private integerSchema(parameter: any): SchemaTypeInteger {
    const description =
      (parameter.description || "Parameter without description.") +
      (this.limitations(parameter) || "");

    const output: SchemaTypeInteger = {
      description,
      ...(parameter.default && { default: parameter.default }),
      ...(parameter.enum && { enum: parameter.enum }),
      ...(parameter.minimum && { minimum: parameter.minimum }),
      ...(parameter.maximum && { maximum: parameter.maximum }),
      ...(typeof parameter.nullable === "boolean" && {
        nullable: parameter.nullable,
      }),
      format: IntegerFormats.Int64,
      type: "integer",
    };

    // default values must be part of enum
    if (
      parameter.enum instanceof Array &&
      !parameter.enum.includes(output.default)
    ) {
      delete output.default;
    }

    return output;
  }

  private booleanParameter(
    name: string,
    parameter: any,
    required: boolean,
    type: ParameterIn
  ): Parameter {
    const limitationDetail = this.limitations(parameter);

    const p: Parameter = {
      description:
        (parameter.description || "Parameter without description.") +
        (limitationDetail || ""),
      in: type,
      name,
      required: isRequiredParameter(required, type),
      schema: this.booleanSchema(parameter),
      ...(typeof parameter.example === "boolean" && {
        example: parameter.example,
      }),
    };

    return p;
  }

  private booleanSchema(parameter: any): SchemaTypeBoolean {
    const description =
      (parameter.description || "Parameter without description.") +
      (this.limitations(parameter) || "");

    const output: SchemaTypeBoolean = {
      description,
      ...(typeof parameter.default === "boolean" && {
        default: parameter.default,
      }),
      ...(typeof parameter.nullable === "boolean" && {
        nullable: parameter.nullable,
      }),
      type: "boolean",
    };

    return output;
  }

  private arrayParameter(
    name: string,
    parameter: any,
    required: boolean,
    type: ParameterIn
  ): Parameter {
    const limitationDetail = this.limitations(parameter);
    const schema = this.arraySchema(parameter);

    const p: Parameter = {
      description:
        (parameter.description || "Parameter without description.") +
        (limitationDetail || ""),
      in: type,
      name,
      required: isRequiredParameter(required, type),
      schema,
      ...(parameter.example && { example: parameter.example }),
    };

    return p;
  }

  private arraySchema(parameter: any): SchemaTypeArray {
    const output: SchemaTypeArray = {
      ...(typeof parameter.default === "object" && {
        default: parameter.default,
      }),
      ...(parameter.minItems && { minItems: parameter.minItems }),
      ...(parameter.maxItems && { maxItems: parameter.maxItems }),
      ...(typeof parameter.nullable === "boolean" && {
        nullable: parameter.nullable,
      }),
      type: "array",
    };

    switch (parameter.items.type) {
      case "string":
        const {
          default: ignoreA1,
          nullable: ignoreA2,
          minLength,
          maxLength,
          ...restOfStringSchema
        } = this.stringSchema(parameter.items);

        output.items = restOfStringSchema;
        break;
      case "number":
        const {
          default: ignoreB1,
          nullable: ignoreB2,
          minimum: ignoreB3,
          maximum: ignoreB4,
          ...restNumberOfSchema
        } = this.numberSchema(parameter.items);

        output.items = restNumberOfSchema;
        break;
      case "integer":
        const {
          default: ignoreC1,
          nullable: ignoreC2,
          minimum: ignoreC3,
          maximum: ignoreC4,
          ...restIntegerOfSchema
        } = this.integerSchema(parameter.items);

        output.items = restIntegerOfSchema;
        break;
      case "object":
        const {
          default: ignoreD1,
          nullable: ignoreD2,
          ...restOfObjectSchema
        } = this.objectSchema(parameter.items);

        output.items = restOfObjectSchema;
        break;
      default:
        throw new Error("not implemented");
    }

    if (parameter.items.enum instanceof Array) {
      // default values must be part of enum
      if (
        output.default instanceof Array &&
        !output.default.every((element: any, _index: number, _array: any[]) =>
          parameter.items.enum.includes(element)
        )
      ) {
        delete output.default;
      }

      // string enums are already limited
      if (parameter.items.type === "string") {
        delete (output.items as SchemaTypeString).minLength;
        delete (output.items as SchemaTypeString).maxLength;
      }
    }

    return output;
  }

  private objectParameter(
    name: string,
    parameter: any,
    required: boolean,
    type: ParameterIn
  ): Parameter {
    const limitationDetail = this.limitations(parameter);
    const schema = this.objectSchema(parameter);

    const p: Parameter = {
      description:
        (parameter.description || "Parameter without description.") +
        (limitationDetail || ""),
      in: type,
      name,
      required: isRequiredParameter(required, type),
      schema,
      ...(parameter.example && { example: parameter.example }),
    };

    return p;
  }

  private objectSchema(parameter: any): SchemaTypeObject {
    const description =
      (parameter.description || "Parameter without description.") +
      (this.limitations(parameter) || "");

    const output: SchemaTypeObject = {
      description,
      ...(typeof parameter.default === "object" && {
        default: parameter.default,
      }),
      ...(parameter.minItems && { minItems: parameter.minItems }),
      ...(parameter.maxItems && { maxItems: parameter.maxItems }),
      ...(typeof parameter.nullable === "boolean" && {
        nullable: parameter.nullable,
      }),
      type: "object",
      properties: {},
    };

    for (const propertyKey of Object.keys(parameter.properties)) {
      const property = parameter.properties[propertyKey];

      switch (property.type) {
        case "string":
          const {
            default: ignoreA1,
            nullable: ignoreA2,
            minLength,
            maxLength,
            ...restOfStringSchema
          } = this.stringSchema(property);

          output.properties[propertyKey] = restOfStringSchema;
          break;
        case "number":
          const {
            default: ignoreB1,
            nullable: ignoreB2,
            minimum: ignoreB3,
            maximum: ignoreB4,
            ...restNumberOfSchema
          } = this.numberSchema(property);

          output.properties[propertyKey] = restNumberOfSchema;
          break;
        case "boolean":
          const {
            default: ignoreE1,
            nullable: ignorE2,
            ...restBooleanOfSchema
          } = this.booleanSchema(property);

          output.properties[propertyKey] = restBooleanOfSchema;
          break;
        case "integer":
          const {
            default: ignoreC1,
            nullable: ignoreC2,
            minimum: ignoreC3,
            maximum: ignoreC4,
            ...restIntegerOfSchema
          } = this.integerSchema(property);

          output.properties[propertyKey] = restIntegerOfSchema;
          break;
        case "object":
          const {
            default: ignoreD1,
            nullable: ignoreD2,
            ...restOfObjectSchema
          } = this.objectSchema(property);

          output.properties[propertyKey] = restOfObjectSchema;
          break;
        case "array":
          const {
            default: ignoreF1,
            nullable: ignoreF2,
            ...restOfArraySchema
          } = this.arraySchema(property);

          output.properties[propertyKey] = restOfArraySchema;
          break;
        default:
          throw new Error(`${property.type} not implemented`);
      }
    }

    return output;
  }
}

// all required parameters or path parameters are parameters are required
function isRequiredParameter(required: boolean, type: ParameterIn) {
  return required || REQUIRED_TYPES.includes(type);
}
