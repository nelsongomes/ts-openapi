import Joi from "joi";
import { OpenApi } from "../../../../src/openapi/openapi";
import { textPlain } from "../../../../src/openapi/helpers/body-mimetype";
import { Parameters, ParameterIn } from "../../../../src/openapi/openapi.types";

describe("src/openapi/openapi", () => {
  let openApi: OpenApi;

  describe("Array of string", () => {
    beforeEach(() => {
      openApi = new OpenApi(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      openApi.setServers([{ url: "https://server.com" }]);
    });

    test("string array simple", async () => {
      const query = Joi.object().keys({
        category: Joi.array().items(Joi.string()),
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

    test("string array all options", async () => {
      const query = Joi.object({
        category: Joi.array()
          .items(
            Joi.string()
              // ignore these
              .min(11)
              .max(20)
              .required()
              .example("example")
              .default("default")
              .allow(null)
          )
          .min(1)
          .max(50)
          .description("String array")
          .required()
          .example(["a"])
          .default("b")
          .allow(null),
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

    test("string array enum", async () => {
      enum EnumValues {
        AAA = "a",
        BBB = "b",
        CCC = "c",
      }

      const query = Joi.object({
        category: Joi.array().items(
          Joi.string().valid(...Object.values(EnumValues))
        ),
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

    test("string array enum min and max should be skipped (the values are already limited)", async () => {
      enum EnumValues {
        AAA = "a",
        BBB = "b",
        CCC = "c",
      }

      const query = Joi.object().keys({
        category: Joi.array()
          .items(
            Joi.string()
              .valid(...Object.values(EnumValues))
              .max(1)
              .min(10)
          )
          .required(),
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

    test("string array enum default is part of enum", async () => {
      enum EnumValues {
        AAA = "a",
        BBB = "b",
        CCC = "c",
      }

      const query = Joi.object().keys({
        category: Joi.array()
          .items(Joi.string().valid(...Object.values(EnumValues)))
          .default(["a", "b"]),
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

    test("string array enum default is undefined because is NOT in enum", async () => {
      enum EnumValues {
        AAA = "a",
        BBB = "b",
        CCC = "c",
      }

      const query = Joi.object().keys({
        category: Joi.array()
          .items(Joi.string().valid(...Object.values(EnumValues)))
          .default(["a", "z"]),
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

    test("string array enum all options", async () => {
      enum EnumValues {
        AAA = "a",
        BBB = "b",
        CCC = "c",
      }

      const query = Joi.object({
        category: Joi.array()
          .items(
            Joi.string()
              .valid(...Object.values(EnumValues))
              // ignore these
              .description("Just a string")
              .min(10)
              .max(20)
              .example("ignore")
              .default("ignore")
              .required()
              .allow(null)
          )
          .description("array of category")
          .required()
          .min(1)
          .max(10)
          .example(["a", "b", "c"])
          .default(["b"])
          .allow(null),
      }).description("ignore this");

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
