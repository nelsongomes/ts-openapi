import { OpenApi } from "../../../src/openapi/openapi";
import { textPlain } from "../../../src/openapi/helpers/body-mimetype";
import { Types } from "../../../src/openapi/helpers/types";

describe("src/openapi/openapi", () => {
  let openApi: OpenApi;

  describe("Cookie parameters", () => {
    beforeEach(() => {
      openApi = new OpenApi(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      openApi.setServers([{ url: "https://server.com" }]);
    });

    test("should succeed", done => {
      const cookie = Types.Object({
        properties: {
          username: Types.String({ required: true })
        }
      });

      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            validationSchema: { cookie },
            responses: {
              200: textPlain("Successful operation.")
            },
            summary: "Server Test",
            tags: ["Internals"]
          }
        },
        true
      );

      done();
    });

    test("should throw an exception if query parameter is an object or an array", done => {
      const cookie = Types.Object({
        properties: {
          someObject: Types.Object({ properties: { test: Types.String() } })
        }
      });

      try {
        openApi.addPath(
          "/test",
          {
            get: {
              description: "Test endpoint",
              operationId: "id",
              validationSchema: { cookie },
              responses: {
                200: textPlain("Successful operation.")
              },
              summary: "Server Test",
              tags: ["Internals"]
            }
          },
          true
        );

        done.fail(
          "It should have thrown an exception because it cannot be object or array"
        );
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(
          "Cookie param 'someObject' cannot be an object or an array."
        );
        done();
      }
    });
  });
});
