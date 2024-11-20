import { OpenApi } from "../../../src/openapi/openapi";
import { textPlain } from "../../../src/openapi/helpers/body-mimetype";
import { Types } from "../../../src/openapi/helpers/types";

let openApi: OpenApi;

describe("Query parameters", () => {
  beforeEach(() => {
    openApi = new OpenApi(
      "1.0.0",
      "Server API",
      "Some test api",
      "nelson.ricardo.gomes@gmail.com"
    );

    openApi.setServers([{ url: "https://server.com" }]);
  });

  test("should throw an exception if query parameter is an object", () => {
    const query = {
      someObject: Types.Object({ properties: { test: Types.String() } }),
    };

    try {
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

      fail("It should have thrown an exception it's an object");
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toBe(
        "Query param 'someObject' cannot be an object."
      );
    }
  });

  test("should throw an exception if query parameter is an array of objects", () => {
    const query = {
      arrayOfArrays: Types.Array({
        arrayType: Types.Object({
          properties: {
            test: Types.Array({ arrayType: Types.String() }),
          },
        }),
      }),
    };

    try {
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

      fail(
        "It should have thrown an exception because only scalar arrays are valid"
      );
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toBe(
        "Query param 'arrayOfArrays' type array can only have scalar types inside of it (cannot be an array of arrays or an array of objects)."
      );
    }
  });

  test("should throw an exception if query parameter is an array of arrays", () => {
    const query = {
      arrayOfArrays: Types.Array({
        arrayType: Types.Array({ arrayType: Types.String() }),
      }),
    };

    try {
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

      fail(
        "It should have thrown an exception because only scalar arrays are valid"
      );
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toBe(
        "Query param type array can only have scalar types inside of it (cannot be an array of arrays or an array of objects)."
      );
    }
  });

  test("should succeed query parameter is an array of scalar", () => {
    const query = {
      arrayOfString: Types.Array({ arrayType: Types.String() }),
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
  });
});
