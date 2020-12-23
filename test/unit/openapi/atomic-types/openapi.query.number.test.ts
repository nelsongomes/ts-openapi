import Joi from "joi";
import { OpenApi } from "../../../../src/openapi/openapi";
import { textPlain } from "../../../../src/openapi/helpers/body-mimetype";
import {
  Parameters,
  ParameterIn,
  WebRequestSchema,
} from "../../../../src/openapi/openapi.types";

describe("src/openapi/openapi", () => {
  let openApi: OpenApi;

  describe("Number", () => {
    beforeEach(() => {
      openApi = new OpenApi(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      openApi.setServers([{ url: "https://server.com" }]);
      openApi.addPath(
        "/health",
        {
          get: {
            description: "Service healthcheck endpoint",
            operationId: "repeated",
            parameters: [],
            responses: {
              200: textPlain("Successful operation."),
            },
            summary: "Server Healthcheck",
            tags: ["Internals"],
          },
        },
        true
      );
    });

    test("number simple", async () => {
      const parameters: Parameters = [];
      const query = Joi.object().keys({
        user_name: Joi.number(),
      });

      openApi.genericParams(parameters, query, ParameterIn.Query);
      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            parameters,
            responses: {
              200: textPlain("Successful operation."),
            },
            summary: "Server Test",
            tags: ["Internals"],
          },
        },
        true
      );
      expect(openApi.generateJson()).toMatchSnapshot();
    });

    test("number simple all options", async () => {
      const parameters: Parameters = [];
      const query = Joi.object({
        sensor: Joi.number()
          .description("Sensor value.")
          .required()
          .min(0.5)
          .max(100.66)
          .default(1)
          .example(33.333)
          .allow(null),
      }).description("ignore this");

      openApi.genericParams(parameters, query, ParameterIn.Query);
      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            parameters,
            responses: {
              200: textPlain("Successful operation."),
            },
            summary: "Server Test",
            tags: ["Internals"],
          },
        },
        true
      );
      expect(openApi.generateJson()).toMatchSnapshot();
    });

    test("number enum", async () => {
      enum EnumValues {
        AAA = 4.1,
        BBB = 10,
        CCC = 20,
      }

      const parameters: Parameters = [];
      const query = Joi.object({
        option: Joi.number().valid(...Object.values(EnumValues)),
      });

      openApi.genericParams(parameters, query, ParameterIn.Query);
      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            parameters,
            responses: {
              200: textPlain("Successful operation."),
            },
            summary: "Server Test",
            tags: ["Internals"],
          },
        },
        true
      );
      expect(openApi.generateJson()).toMatchSnapshot();
    });

    test("number enum min and max should be skipped (the values are already limited)", async () => {
      enum EnumValues {
        AAA = 3,
        BBB = 6,
        CCC = 9,
      }

      const parameters: Parameters = [];
      const query = Joi.object({
        option: Joi.number()
          .valid(...Object.values(EnumValues))
          .description("Integer options from enum")
          .min(1)
          .max(3),
      });

      openApi.genericParams(parameters, query, ParameterIn.Query);
      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            parameters,
            responses: {
              200: textPlain("Successful operation."),
            },
            summary: "Server Test",
            tags: ["Internals"],
          },
        },
        true
      );
      expect(openApi.generateJson()).toMatchSnapshot();
    });

    test("number enum default is part of enum", async () => {
      enum EnumValues {
        AAA = 10,
        BBB = 20,
        CCC = 30,
      }

      const parameters: Parameters = [];
      const query = Joi.object().keys({
        option: Joi.number()
          .valid(...Object.values(EnumValues))
          .description("Integer options from enum")
          .default(20),
      });

      openApi.genericParams(parameters, query, ParameterIn.Query);
      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            parameters,
            responses: {
              200: textPlain("Successful operation."),
            },
            summary: "Server Test",
            tags: ["Internals"],
          },
        },
        true
      );
      expect(openApi.generateJson()).toMatchSnapshot();
    });

    test("number enum default is undefined because is NOT in enum", async () => {
      enum EnumValues {
        AAA = 10,
        BBB = 20,
        CCC = 30,
      }

      const parameters: Parameters = [];
      const query = Joi.object({
        option: Joi.number()
          .valid(...Object.values(EnumValues))
          .description("Integer options from enum")
          .default(12),
      });

      openApi.genericParams(parameters, query, ParameterIn.Query);
      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            parameters,
            responses: {
              200: textPlain("Successful operation."),
            },
            summary: "Server Test",
            tags: ["Internals"],
          },
        },
        true
      );
      expect(openApi.generateJson()).toMatchSnapshot();
    });

    test("number enum all options", async () => {
      enum EnumValues {
        AAA = 10.1,
        BBB = 20.2,
        CCC = 30.3,
      }

      const parameters: Parameters = [];
      const query = Joi.object({
        sensor: Joi.number()
          .description("Sensor value.")
          .required()
          .valid(...Object.values(EnumValues))
          .default(10.1)
          .example(30.3)
          .allow(null),
      }).description("ignore this");
      openApi.genericParams(parameters, query, ParameterIn.Query);
      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            parameters,
            responses: {
              200: textPlain("Successful operation."),
            },
            summary: "Server Test",
            tags: ["Internals"],
          },
        },
        true
      );
      expect(openApi.generateJson()).toMatchSnapshot();
    });
  });
});
