import Joi from "joi";
import { OpenApi } from "../../../../src/openapi/openapi";
import { textPlain } from "../../../../src/openapi/helpers/body-mimetype";
import { Types } from "../../../../src/openapi/helpers/types";

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
        category: Joi.array().items(Types.String())
      });

      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            validationSchema: { query },
            responses: {
              200: textPlain("Successful operation.")
            },
            summary: "Server Test",
            tags: ["Internals"]
          }
        },
        true
      );
      expect(openApi.generateJson()).toMatchSnapshot();
    });

    test("string array all options", async () => {
      const query = Joi.object({
        category: Joi.array()
          .items(
            Types.String({
              minLength: 11,
              maxLength: 20,
              required: true,
              nullable: true,
              default: "default",
              example: "example"
            })
          )
          .min(1)
          .max(50)
          .description("String array")
          .required()
          .example(["a"])
          .default("b")
          .allow(null)
      });

      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            validationSchema: { query },
            responses: {
              200: textPlain("Successful operation.")
            },
            summary: "Server Test",
            tags: ["Internals"]
          }
        },
        true
      );
      expect(openApi.generateJson()).toMatchSnapshot();
    });

    test("string array enum", async () => {
      enum EnumValues {
        AAA = "a",
        BBB = "b",
        CCC = "c"
      }

      const query = Joi.object({
        category: Joi.array().items(
          Types.StringEnum({ values: Object.values(EnumValues) })
        )
      });

      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            validationSchema: { query },
            responses: {
              200: textPlain("Successful operation.")
            },
            summary: "Server Test",
            tags: ["Internals"]
          }
        },
        true
      );
      expect(openApi.generateJson()).toMatchSnapshot();
    });

    test("string array enum min and max (string length) should be skipped (the values are already limited)", async () => {
      enum EnumValues {
        AAA = "a",
        BBB = "b",
        CCC = "c"
      }

      const query = Joi.object().keys({
        category: Joi.array()
          .items(Types.StringEnum({ values: Object.values(EnumValues) }))
          .required()
      });

      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            validationSchema: { query },
            responses: {
              200: textPlain("Successful operation.")
            },
            summary: "Server Test",
            tags: ["Internals"]
          }
        },
        true
      );
      expect(openApi.generateJson()).toMatchSnapshot();
    });

    test("string array enum default is part of enum", async () => {
      enum EnumValues {
        AAA = "a",
        BBB = "b",
        CCC = "c"
      }

      const query = Joi.object().keys({
        category: Joi.array()
          .items(Types.StringEnum({ values: Object.values(EnumValues) }))
          .default(["a", "b"])
      });

      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            validationSchema: { query },
            responses: {
              200: textPlain("Successful operation.")
            },
            summary: "Server Test",
            tags: ["Internals"]
          }
        },
        true
      );
      expect(openApi.generateJson()).toMatchSnapshot();
    });

    test("string array enum default is undefined because is NOT in enum", async () => {
      enum EnumValues {
        AAA = "a",
        BBB = "b",
        CCC = "c"
      }

      const query = Joi.object().keys({
        category: Joi.array()
          .items(Types.StringEnum({ values: Object.values(EnumValues) }))
          .default(["a", "z"])
      });

      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            validationSchema: { query },
            responses: {
              200: textPlain("Successful operation.")
            },
            summary: "Server Test",
            tags: ["Internals"]
          }
        },
        true
      );
      expect(openApi.generateJson()).toMatchSnapshot();
    });

    test("string array enum all options", async () => {
      enum EnumValues {
        AAA = "a",
        BBB = "b",
        CCC = "c"
      }

      const query = Joi.object({
        category: Joi.array()
          .items(
            Types.StringEnum({
              values: Object.values(EnumValues),
              description: "Enum of strings",
              nullable: true,
              required: true
            })
          )
          .description("array of category")
          .required()
          .min(1)
          .max(10)
          .example(["a", "b", "c"])
          .default(["b"])
          .allow(null)
      }).description("ignore this");

      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            validationSchema: { query },
            responses: {
              200: textPlain("Successful operation.")
            },
            summary: "Server Test",
            tags: ["Internals"]
          }
        },
        true
      );
      expect(openApi.generateJson()).toMatchSnapshot();
    });
  });
});
