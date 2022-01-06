import {
  IntegerFormats,
  NumberFormats,
  SchemaTypeBoolean,
  SchemaTypeInteger,
  SchemaTypeNumber,
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

export function openapiEscapeChars(key: string) {
  return key.replace(/~/g, "~0").replace(/\//g, "~1");
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
        output.maxLength = 25; // 2021-11-05T00:00:00.000Z or 2020-10-14T21:44:03+00:00
        output.minLength = 10; // 2020-10-14
        break;
      case StringFormats.DateTime:
        output.minLength = 16; // 20201014T214403Z
        output.maxLength = 25; // 2021-11-05T00:00:00.000Z or 2020-10-14T21:44:03+00:00
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
