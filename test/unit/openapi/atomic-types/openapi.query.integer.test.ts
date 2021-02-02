import { OpenApi } from "../../../../src/openapi/openapi";
import { textPlain } from "../../../../src/openapi/helpers/body-mimetype";
import { Types } from "../../../../src/openapi/helpers/types";

describe("src/openapi/openapi", () => {
  let openApi: OpenApi;

  describe("Integer", () => {
    beforeEach(() => {
      openApi = new OpenApi(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      openApi.setServers([{ url: "https://server.com" }]);
    });

    test("integer simple", async () => {
      const query = {
        user_name: Types.Integer()
      };

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

    test("integer simple all options", async () => {
      const query = {
        user_name: Types.Integer({
          description: "Some integer value",
          required: true,
          minValue: 5,
          maxValue: 100,
          default: 99,
          example: 5,
          nullable: true
        })
      };

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

    test("integer enum", async () => {
      enum EnumValues {
        AAA = 5,
        BBB = 10,
        CCC = 20
      }

      const query = {
        option: Types.IntegerEnum({
          values: Object.values((EnumValues as unknown) as number[]),
          description: "Integer options from enum"
        })
      };

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

    test("integer enum min and max should be skipped (the values are already limited)", async () => {
      enum EnumValues {
        AAA = 3,
        BBB = 6,
        CCC = 9
      }

      const query = {
        option: Types.IntegerEnum({
          values: Object.values(EnumValues),
          description: "Integer options from enum"
        })
      };

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

    test("integer enum default is part of enum", async () => {
      enum EnumValues {
        AAA = 10,
        BBB = 20,
        CCC = 30
      }

      const query = {
        option: Types.IntegerEnum({
          values: Object.values(EnumValues),
          description: "Integer options from enum",
          default: 20
        })
      };

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

    test("integer enum default is undefined because is NOT in enum", async () => {
      enum EnumValues {
        AAA = 10,
        BBB = 20,
        CCC = 30
      }

      const query = {
        option: Types.IntegerEnum({
          values: Object.values(EnumValues),
          description: "Integer options from enum",
          default: 13
        })
      };

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

    test("integer enum all options", async () => {
      enum EnumValues {
        AAA = 5,
        BBB = 10,
        CCC = 20
      }

      const query = {
        option: Types.IntegerEnum({
          required: true,
          values: Object.values(EnumValues),
          description: "Integer options from enum",
          default: 5,
          example: 20,
          nullable: true
        })
      };

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
