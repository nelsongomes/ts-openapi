import Joi from "joi";
import { OpenApi } from "../../../../src/openapi/openapi";
import { textPlain } from "../../../../src/openapi/helpers/body-mimetype";
import { Types } from "../../../../src/openapi/helpers/types";

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
    });

    test("number simple", async () => {
      const query = Joi.object().keys({
        user_name: Types.Number()
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

    test("number simple all options", async () => {
      const query = Joi.object({
        sensor: Types.Number({
          description: "Sensor value.",
          required: true,
          minValue: 0.5,
          maxValue: 100.66,
          default: 1,
          example: 33.333,
          nullable: true
        })
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

    test("number enum", async () => {
      enum EnumValues {
        AAA = 4.1,
        BBB = 10,
        CCC = 20
      }

      const query = Joi.object({
        option: Types.NumberEnum({ values: Object.values(EnumValues) })
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

    test("number enum min and max should be skipped (the values are already limited)", async () => {
      enum EnumValues {
        AAA = 3,
        BBB = 6,
        CCC = 9
      }

      const query = Joi.object({
        option: Types.NumberEnum({
          values: Object.values(EnumValues),
          description: "Integer options from enum"
        })
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

    test("number enum default is part of enum", async () => {
      enum EnumValues {
        AAA = 10,
        BBB = 20,
        CCC = 30
      }

      const query = Joi.object().keys({
        option: Types.NumberEnum({
          values: Object.values(EnumValues),
          description: "Integer options from enum",
          default: 20
        })
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

    test("number enum default is undefined because is NOT in enum", async () => {
      enum EnumValues {
        AAA = 10,
        BBB = 20,
        CCC = 30
      }

      const query = Types.Object({
        properties: {
          option: Types.NumberEnum({
            values: Object.values(EnumValues),
            description: "Integer options from enum",
            default: 12
          })
        }
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

    test("number enum all options", async () => {
      enum EnumValues {
        AAA = 10.1,
        BBB = 20.2,
        CCC = 30.3
      }

      const query = Types.Object({
        properties: {
          sensor: Types.NumberEnum({
            values: Object.values(EnumValues),
            description: "Sensor value.",
            required: true,
            default: 10.1,
            example: 30.3,
            nullable: true
          })
        },
        description: "ignore it!"
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
  });
});
