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
      const query = {
        category: Types.Array({ arrayType: Types.String() })
      };

      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            requestSchema: { query },
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
      const query = {
        category: Types.Array({
          arrayType: Types.String({
            minLength: 11,
            maxLength: 20,
            required: true,
            nullable: true,
            default: "default",
            example: "example"
          }),
          minLength: 1,
          maxLength: 50,
          description: "String array",
          required: true,
          example: ["a"],
          default: ["b"],
          nullable: true
        })
      };

      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            requestSchema: { query },
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

      const query = {
        category: Types.Array({
          arrayType: Types.StringEnum({ values: Object.values(EnumValues) })
        })
      };

      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            requestSchema: { query },
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

      const query = {
        category: Types.Array({
          arrayType: Types.StringEnum({ values: Object.values(EnumValues) }),
          required: true
        })
      };

      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            requestSchema: { query },
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

      const query = {
        category: Types.Array({
          arrayType: Types.StringEnum({ values: Object.values(EnumValues) }),
          default: ["a", "b"]
        })
      };

      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            requestSchema: { query },
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

      const query = {
        category: Types.Array({
          arrayType: Types.StringEnum({ values: Object.values(EnumValues) }),
          default: ["a", "z"]
        })
      };

      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            requestSchema: { query },
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

      const query = {
        category: Types.Array({
          arrayType: Types.StringEnum({
            values: Object.values(EnumValues),
            description: "Enum of strings",
            nullable: true,
            required: true
          }),
          description: "array of category",
          required: true,
          minLength: 1,
          maxLength: 10,
          example: ["a", "b", "c"],
          default: ["b"],
          nullable: true
        })
      };

      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            requestSchema: { query },
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
