import { OpenApi } from "../../../src/openapi/openapi";
import { textPlain } from "../../../src/openapi/helpers/body-mimetype";
import { Types } from "../../../src/openapi/helpers/types";

describe("src/openapi/openapi", () => {
  let openApi: OpenApi;

  describe("Path parameters", () => {
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
      const params = {
        username: Types.String({ required: true })
      };

      openApi.addPath(
        "/test/:username",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            validationSchema: { params },
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

      done();
    });

    test("should throw an exception if path parameter name is not made up of “word characters” ([A-Za-z0-9_])", done => {
      const params = {
        "user#name": Types.String()
      };

      try {
        openApi.addPath(
          "/test",
          {
            get: {
              description: "Test endpoint",
              operationId: "id",
              validationSchema: { params },
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
          "It should have thrown an exception because name is not valid"
        );
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(
          "Path param 'user#name' name does not match [A-Za-z0-9_]"
        );
        done();
      }
    });

    test("should throw an exception if path parameter is an object or array", done => {
      const params = {
        stringArray: Types.Array({
          arrayType: Types.Object({ properties: { list: Types.String() } })
        })
      };

      try {
        openApi.addPath(
          "/test",
          {
            get: {
              description: "Test endpoint",
              operationId: "id",
              validationSchema: { params },
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
          "It should have thrown an exception because param cannot be object or array"
        );
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(
          "Path param 'stringArray' cannot be an object or an array."
        );
        done();
      }
    });

    test("should throw an exception if path parameter is not required", done => {
      const params = {
        someString: Types.String()
      };

      try {
        openApi.addPath(
          "/test",
          {
            get: {
              description: "Test endpoint",
              operationId: "id",
              validationSchema: { params },
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
          "It should have thrown an exception because name is not valid"
        );
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(
          "Path param 'someString' must be required because it is a path parameter."
        );
        done();
      }
    });
  });
});
