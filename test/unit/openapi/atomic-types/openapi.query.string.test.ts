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

  describe("genericParams", () => {
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
  });

  describe("String", () => {
    beforeEach(() => {
      openApi = new OpenApi(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      openApi.setServers([{ url: "https://server.com" }]);
    });

    test("string simple", async () => {
      const query = Joi.object().keys({
        user_name: Joi.string(),
      });

      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            validationSchema: { query },
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

    test("string simple all options", async () => {
      const query = Joi.object()
        .keys({
          name: Joi.string()
            .description("Complete user name.")
            .min(5)
            .max(100)
            .required()
            .default("name")
            .example("John Doe")
            .allow(null),
        })
        .description("ignore this");

      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            validationSchema: { query },
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

    test("string enum", async () => {
      enum EnumValues {
        AAA = "aaa",
        BBB = "bbb",
        CCC = "ccc",
      }

      const query = Joi.object().keys({
        option: Joi.string().valid(...Object.values(EnumValues)),
      });

      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            validationSchema: { query },
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

    test("string enum min and max should be skipped (the values are already limited)", async () => {
      enum EnumValues {
        AAA = "aaa",
        BBB = "bbb",
        CCC = "ccc",
      }

      const query = Joi.object().keys({
        option: Joi.string()
          .valid(...Object.values(EnumValues))
          .description("String options from enum")
          .min(1)
          .max(3),
      });

      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            validationSchema: { query },
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

    test("string enum default is part of enum", async () => {
      enum EnumValues {
        AAA = "aaa",
        BBB = "bbb",
        CCC = "ccc",
      }

      const query = Joi.object().keys({
        option: Joi.string()
          .valid(...Object.values(EnumValues))
          .description("String options from enum")
          .default("bbb")
          .min(1)
          .max(3),
      });

      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            validationSchema: { query },
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

    test("string enum default is undefined because is NOT in enum", async () => {
      enum EnumValues {
        AAA = "aaa",
        BBB = "bbb",
        CCC = "ccc",
      }

      const query = Joi.object().keys({
        option: Joi.string()
          .valid(...Object.values(EnumValues))
          .description("String options from enum")
          .default("abc")
          .min(1)
          .max(3),
      });

      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            validationSchema: { query },
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

    test("string enum all options", async () => {
      enum EnumValues {
        AAA = "cars",
        BBB = "boats",
        CCC = "planes",
      }

      const query = Joi.object()
        .keys({
          category: Joi.string()
            .valid(...Object.values(EnumValues))
            .description("Select vehicle type")
            .required()
            .default("cars")
            .example("planes")
            .allow(null)
            // ignore these
            .min(1)
            .max(20),
        })
        .description("ignore this");

      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            validationSchema: { query },
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
