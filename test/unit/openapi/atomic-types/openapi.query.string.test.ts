import { OpenApi } from "../../../../src/openapi/openapi";
import { textPlain } from "../../../../src/openapi/helpers/body-mimetype";
import { Types } from "../../../../src/openapi/helpers/types";

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
              200: textPlain("Successful operation.")
            },
            summary: "Server Healthcheck",
            tags: ["Internals"]
          }
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
      const query = {
        user_name: Types.String()
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

    test("string simple all options", async () => {
      const query = {
        name: Types.String({
          description: "Complete user name.",
          minLength: 5,
          maxLength: 100,
          required: true,
          default: "name",
          example: "John Doe",
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

    test("string enum", async () => {
      enum EnumValues {
        AAA = "aaa",
        BBB = "bbb",
        CCC = "ccc"
      }

      const query = {
        option: Types.StringEnum({ values: Object.values(EnumValues) })
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

    test("string enum min and max should be skipped (the values are already limited)", async () => {
      enum EnumValues {
        AAA = "aaa",
        BBB = "bbb",
        CCC = "ccc"
      }

      const query = {
        option: Types.StringEnum({
          values: Object.values(EnumValues),
          description: "String options from enum"
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

    test("string enum default is part of enum", async () => {
      enum EnumValues {
        AAA = "aaa",
        BBB = "bbb",
        CCC = "ccc"
      }

      const query = {
        option: Types.StringEnum({
          values: Object.values(EnumValues),
          description: "String options from enum",
          default: "bbb"
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

    test("string enum default is undefined because is NOT in enum", async () => {
      enum EnumValues {
        AAA = "aaa",
        BBB = "bbb",
        CCC = "ccc"
      }

      const query = {
        option: Types.StringEnum({
          values: Object.values(EnumValues),
          description: "String options from enum",
          default: "abc"
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

    test("string enum all options", async () => {
      enum EnumValues {
        AAA = "cars",
        BBB = "boats",
        CCC = "planes"
      }

      const query = {
        category: Types.StringEnum({
          values: Object.values(EnumValues),
          description: "Select vehicle type",
          required: true,
          default: EnumValues.AAA,
          example: EnumValues.CCC,
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
