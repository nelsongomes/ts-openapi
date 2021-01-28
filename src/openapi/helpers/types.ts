import Joi from "joi";

type Common = {
  description?: string;
  required?: boolean;
  nullable?: boolean;
};

type StringParameters = {
  default?: string;
  example?: string;
  minLength?: number;
  maxLength?: number;
} & Common;

type StringEnumParameters = {
  values: string[];
  default?: string;
  example?: string;
} & Common;

type EmailParameters = StringParameters;
type PasswordParameters = StringParameters;
type UuidParameters = StringParameters;

type DateParameters = {
  default?: string;
  example?: string;
} & Common;

type IntegerParameters = {
  default?: number;
  example?: number;
  minValue?: number;
  maxValue?: number;
} & Common;

type IntegerEnumParameters = {
  values: any[];
  default?: number;
  example?: number;
} & Common;

type NumberEnumParameters = IntegerEnumParameters;

type BooleanParameters = {
  default?: boolean;
  example?: boolean;
} & Common;

export const Types = {
  String: (parameters?: StringParameters) => {
    let joiType = Joi.string();

    if (parameters) {
      const {
        description,
        required,
        nullable,
        maxLength,
        minLength,
        example
      } = parameters;

      if (description) {
        joiType = joiType.description(description);
      }

      if (typeof required === "boolean" && required) {
        joiType = joiType.required();
      }

      if (typeof nullable === "boolean" && nullable) {
        joiType = joiType.allow(null);
      }

      if (minLength) {
        joiType = joiType.min(minLength);
      }

      if (maxLength) {
        joiType = joiType.max(maxLength);
      }

      if (parameters.default) {
        joiType = joiType.default(parameters.default);
      }

      if (parameters.example) {
        joiType = joiType.example(example);
      }
    }

    return joiType;
  },

  StringEnum: (parameters: StringEnumParameters) => {
    return Types.String(parameters).valid(...parameters.values);
  },

  Email: (parameters?: EmailParameters) => {
    return Types.String(parameters).email();
  },

  Password: (parameters?: PasswordParameters) => {
    return Types.String(parameters).meta({ format: "password" });
  },

  Uuid: (parameters?: UuidParameters) => {
    return Types.String(parameters).meta({ format: "uuid" });
  },

  DateTime: (parameters?: DateParameters) => {
    let joiType = Joi.string()
      .isoDate()
      .max(24);

    if (parameters) {
      const { description, required, nullable } = parameters;

      if (description) {
        joiType = joiType.description(description);
      }

      if (typeof required === "boolean" && required) {
        joiType = joiType.required();
      }

      if (typeof nullable === "boolean" && nullable) {
        joiType = joiType.allow(null);
      }
    }

    return joiType;
  },

  Date: (parameters?: DateParameters) => {
    return Types.DateTime(parameters)
      .meta({ format: "date" })
      .min(10)
      .max(10);
  },

  Number: (parameters?: IntegerParameters) => {
    let joiType = Joi.number();

    if (parameters) {
      const {
        description,
        required,
        nullable,
        minValue,
        maxValue,
        example
      } = parameters;

      if (description) {
        joiType = joiType.description(description);
      }

      if (typeof required === "boolean" && required) {
        joiType = joiType.required();
      }

      if (typeof nullable === "boolean" && nullable) {
        joiType = joiType.allow(null);
      }

      if (minValue) {
        joiType = joiType.min(minValue);
      }

      if (maxValue) {
        joiType = joiType.max(maxValue);
      }

      if (parameters.default) {
        joiType = joiType.default(parameters.default);
      }

      if (parameters.example) {
        joiType = joiType.example(example);
      }
    }

    return joiType;
  },

  NumberEnum: (parameters: NumberEnumParameters) => {
    return Types.Number(parameters).valid(...parameters.values);
  },

  Integer: (parameters?: IntegerParameters) => {
    return Types.Number(parameters).integer();
  },

  IntegerEnum: (parameters: IntegerEnumParameters) => {
    return Types.Integer(parameters).valid(...parameters.values);
  },

  Boolean: (parameters?: BooleanParameters) => {
    let joiType = Joi.boolean().strict();

    if (parameters) {
      const { description, required, nullable, example } = parameters;

      if (description) {
        joiType = joiType.description(description);
      }

      if (typeof required === "boolean" && required) {
        joiType = joiType.required();
      }

      if (typeof nullable === "boolean" && nullable) {
        joiType = joiType.allow(null);
      }

      if (typeof parameters.default === "boolean") {
        joiType = joiType.default(parameters.default);
      }

      if (typeof parameters.example === "boolean") {
        joiType = joiType.example(example);
      }
    }

    return joiType;
  }
};
