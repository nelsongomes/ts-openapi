import { OpenApi } from "../../../../src/openapi/openapi";
import { textPlain } from "../../../../src/openapi/helpers/body-mimetype";
import { Types } from "../../../../src/openapi/helpers/types";

describe("src/openapi/openapi", () => {
  let openApi: OpenApi;

  describe("Binary", () => {
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

    test("binary simple", async () => {
      const query = {
        base64string: Types.Binary(),
      };

      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            requestSchema: { query },
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

    test("binary all options", async () => {
      const query = {
        base64string: Types.Binary({
          description: "some binary base64 value",
          required: true,
          minLength: 512,
          maxLength: 1024,
          default: "c2FtcGxlMQ==",
          example: "c2FtcGxlMQ==",
          nullable: true,
        }),
      };

      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            requestSchema: { query },
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

    test("binary all options, declared as parameter", async () => {
      const query = {
        base64string: Types.Binary({
          description: "some binary base64 value",
          required: true,
          minLength: 512,
          maxLength: 1024,
          default: "c2FtcGxlMQ==",
          example: "c2FtcGxlMQ==",
          nullable: true,
          isParameter: true,
        }),
        base64string2: Types.Binary({
          description: "some binary base64 value",
          required: true,
          minLength: 512,
          maxLength: 1024,
          default: "c2FtcGxlMQ==",
          example: "c2FtcGxlMQ==",
          nullable: true,
          isParameter: true,
        }),
        dateTimeParameter: Types.DateTime({
          description: "some datetime parameter",
          required: true,
          nullable: true,
          isParameter: true,
        }),
        numberParameter: Types.Number({
          description: "some number parameter",
          required: true,
          nullable: true,
          isParameter: true,
        }),
        booleanParameter: Types.Boolean({
          description: "some boolean parameter",
          required: true,
          nullable: true,
          isParameter: true,
        }),
        arrayParameter: Types.Array({
          arrayType: Types.String(),
          description: "some string array parameter",
          required: true,
          nullable: true,
          isParameter: true,
        }),
      };

      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            requestSchema: { query },
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

    test("binary all options, declared as parameter should throw an exception, because parameter has 2 variations", async () => {
      const query = {
        base64string: Types.Binary({
          description: "some binary base64 value",
          required: true,
          minLength: 512,
          maxLength: 1024,
          default: "c2FtcGxlMQ==",
          example: "c2FtcGxlMQ==",
          nullable: true,
          isParameter: true,
        }),
      };

      const queryVariation = {
        base64string: Types.Binary({
          description: "some binary base64 value",
          required: true,
          minLength: 512,
          maxLength: 1000,
          default: "c2FtcGxlMQ==",
          example: "c2FtcGxlMQ==",
          nullable: true,
          isParameter: true,
        }),
      };

      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            requestSchema: { query },
            responses: {
              200: textPlain("Successful operation."),
            },
            summary: "Server Test",
            tags: ["Internals"],
          },
        },
        true
      );

      openApi.addPath(
        "/testValid",
        {
          get: {
            description: "Test endpoint",
            operationId: "id2",
            requestSchema: { query },
            responses: {
              200: textPlain("Successful operation."),
            },
            summary: "Server Test",
            tags: ["Internals"],
          },
        },
        true
      );

      try {
        openApi.addPath(
          "/testInvalid",
          {
            get: {
              description: "Test endpoint",
              operationId: "id3",
              requestSchema: { query: queryVariation },
              responses: {
                200: textPlain("Successful operation."),
              },
              summary: "Server Test",
              tags: ["Internals"],
            },
          },
          true
        );

        fail("Should have thrown exception");
      } catch (e) {
        expect((e as Error).message).toBe(
          "There is a conflicting declaration of base64string parameter, the parameter cannot change."
        );
      }

      expect(openApi.generateJson()).toMatchSnapshot();
    });
  });
});
