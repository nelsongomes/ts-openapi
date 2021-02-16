import Joi, { ObjectSchema } from "joi";
import joiToSwagger from "../joi-conversion";
import {
  Body,
  IntegerFormats,
  NumberFormats,
  SchemaTypeArray,
  SchemaTypeBoolean,
  SchemaTypeInteger,
  SchemaTypeNumber,
  SchemaTypeObject,
  SchemaTypeString,
  StringFormats
} from "./openapi.types";

export function limitations(parameter: any): string {
  const limitationArray = [];

  if (parameter.type === "string" && parameter.enum) {
    // min & max should be ignored when is an enum
    delete parameter.minLength;
    delete parameter.maxLength;
  }

  // string
  if (parameter.minLength) {
    limitationArray.push(`min:${parameter.minLength} chars`);
  }

  if (parameter.maxLength) {
    limitationArray.push(`max:${parameter.maxLength} chars`);
  }

  // integer / float
  if (parameter.type === "integer" && parameter.enum) {
    // min & max should be ignored when is an enum
    delete parameter.minimum;
    delete parameter.maximum;
  }

  if (typeof parameter.minimum === "number") {
    limitationArray.push(`min:${parameter.minimum}`);
  }

  if (typeof parameter.maximum === "number") {
    limitationArray.push(`max:${parameter.maximum}`);
  }

  // array
  if (parameter.minItems) {
    limitationArray.push(`minItems:${parameter.minItems}`);
  }

  if (parameter.maxItems) {
    limitationArray.push(`maxItems:${parameter.maxItems}`);
  }

  if (parameter.format) {
    switch (parameter.format) {
      case StringFormats.DateTime:
        if (parameter.meta && parameter.meta.format === "date") {
          limitationArray.push(`date:yyyy-mm-dd`);
        } else {
          limitationArray.push(`ISO8601 date-time format`);
        }
        break;
      case StringFormats.Byte:
        limitationArray.push("base64 encoded string");
        break;
      case StringFormats.Binary:
        limitationArray.push("binary string");
        break;
    }
  }

  return limitationArray.length > 0 ? ` (${limitationArray.join(", ")})` : "";
}

export function bodyParams(schema: ObjectSchema): Body {
  const internalSchema = Joi.object().keys({ object: schema.required() });
  const query = joiToSwagger(internalSchema, {});

  const key = Object.keys(query.swagger.properties)[0];
  const parameter = query.swagger.properties[key];

  return {
    description:
      query.swagger.properties[key].description ||
      "Body does not have a description.",
    content: {
      "application/json": {
        schema: objectSchema(parameter),
        ...(parameter.example && { example: parameter.example })
      }
    }
  };
}

function objectSchema(parameter: any): SchemaTypeObject {
  const description =
    (parameter.description || "Parameter without description.") +
    (limitations(parameter) || "");

  const output: SchemaTypeObject = {
    description,
    ...(typeof parameter.default === "object" && {
      default: parameter.default
    }),
    ...(parameter.minItems && { minItems: parameter.minItems }),
    ...(parameter.maxItems && { maxItems: parameter.maxItems }),
    ...(typeof parameter.nullable === "boolean" && {
      nullable: parameter.nullable
    }),
    type: "object",
    properties: {}
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
        } = stringSchema(property);

        output.properties[propertyKey] = restOfStringSchema;
        break;
      case "number":
        const {
          default: ignoreB1,
          nullable: ignoreB2,
          minimum: ignoreB3,
          maximum: ignoreB4,
          ...restNumberOfSchema
        } = numberSchema(property);

        output.properties[propertyKey] = restNumberOfSchema;
        break;
      case "boolean":
        const {
          default: ignoreE1,
          nullable: ignorE2,
          ...restBooleanOfSchema
        } = booleanSchema(property);

        output.properties[propertyKey] = restBooleanOfSchema;
        break;
      case "integer":
        const {
          default: ignoreC1,
          nullable: ignoreC2,
          minimum: ignoreC3,
          maximum: ignoreC4,
          ...restIntegerOfSchema
        } = integerSchema(property);

        output.properties[propertyKey] = restIntegerOfSchema;
        break;
      case "object":
        const {
          default: ignoreD1,
          nullable: ignoreD2,
          ...restOfObjectSchema
        } = objectSchema(property);

        output.properties[propertyKey] = restOfObjectSchema;
        break;
      case "array":
        const {
          default: ignoreF1,
          nullable: ignoreF2,
          ...restOfArraySchema
        } = arraySchema(property);

        output.properties[propertyKey] = restOfArraySchema;
        break;
      default:
        throw new Error(`${property.type} not implemented`);
    }
  }

  return output;
}

export function stringSchema(parameter: any): SchemaTypeString {
  const supportedFormats = Object.values(StringFormats);
  const description =
    (parameter.description || "Parameter without description.") +
    (limitations(parameter) || "");

  const output: SchemaTypeString = {
    description,
    ...(parameter.default && { default: parameter.default }),
    ...(parameter.format &&
      supportedFormats.includes(parameter.format) && {
        format: parameter.format
      }),
    ...(parameter.enum && { enum: parameter.enum }),
    ...(parameter.minLength && { minLength: parameter.minLength }),
    ...(parameter.maxLength && { maxLength: parameter.maxLength }),
    ...(typeof parameter.nullable === "boolean" && {
      nullable: parameter.nullable
    }),
    type: "string"
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

export function numberSchema(parameter: any): SchemaTypeNumber {
  const description =
    (parameter.description || "Parameter without description.") +
    (limitations(parameter) || "");

  const output: SchemaTypeNumber = {
    description,
    ...(parameter.default && { default: parameter.default }),
    ...(parameter.enum && { enum: parameter.enum }),
    ...(typeof parameter.minimum === "number" && {
      minimum: parameter.minimum
    }),
    ...(typeof parameter.maximum === "number" && {
      maximum: parameter.maximum
    }),
    ...(typeof parameter.nullable === "boolean" && {
      nullable: parameter.nullable
    }),
    format: NumberFormats.Double,
    type: "number"
  };

  return output;
}

export function booleanSchema(parameter: any): SchemaTypeBoolean {
  const description =
    (parameter.description || "Parameter without description.") +
    (limitations(parameter) || "");

  const output: SchemaTypeBoolean = {
    description,
    ...(typeof parameter.default === "boolean" && {
      default: parameter.default
    }),
    ...(typeof parameter.nullable === "boolean" && {
      nullable: parameter.nullable
    }),
    type: "boolean"
  };

  return output;
}

export function integerSchema(parameter: any): SchemaTypeInteger {
  const description =
    (parameter.description || "Parameter without description.") +
    (limitations(parameter) || "");

  const output: SchemaTypeInteger = {
    description,
    ...(typeof parameter.default === "number" && {
      default: parameter.default
    }),
    ...(typeof parameter.example === "number" && {
      example: parameter.example
    }),
    ...(parameter.enum && { enum: parameter.enum }),
    ...(typeof parameter.minimum === "number" && {
      minimum: parameter.minimum
    }),
    ...(typeof parameter.maximum === "number" && {
      maximum: parameter.maximum
    }),
    ...(typeof parameter.nullable === "boolean" && {
      nullable: parameter.nullable
    }),
    format: IntegerFormats.Int64,
    type: "integer"
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

export function arraySchema(parameter: any): SchemaTypeArray {
  const output: SchemaTypeArray = {
    ...(typeof parameter.default === "object" && {
      default: parameter.default
    }),
    ...(parameter.minItems && { minItems: parameter.minItems }),
    ...(parameter.maxItems && { maxItems: parameter.maxItems }),
    ...(typeof parameter.nullable === "boolean" && {
      nullable: parameter.nullable
    }),
    type: "array"
  };

  switch (parameter.items.type) {
    case "string":
      const {
        default: ignoreA1,
        nullable: ignoreA2,
        minLength,
        maxLength,
        ...restOfStringSchema
      } = stringSchema(parameter.items);

      output.items = restOfStringSchema;
      break;
    case "number":
      const {
        default: ignoreB1,
        nullable: ignoreB2,
        minimum: ignoreB3,
        maximum: ignoreB4,
        ...restNumberOfSchema
      } = numberSchema(parameter.items);

      output.items = restNumberOfSchema;
      break;
    case "integer":
      const {
        default: ignoreC1,
        nullable: ignoreC2,
        minimum: ignoreC3,
        maximum: ignoreC4,
        ...restIntegerOfSchema
      } = integerSchema(parameter.items);

      output.items = restIntegerOfSchema;
      break;
    case "object":
      const {
        default: ignoreD1,
        nullable: ignoreD2,
        ...restOfObjectSchema
      } = objectSchema(parameter.items);

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

export function bodySchema(schema: ObjectSchema): Body {
  return bodyParams(schema);
}
