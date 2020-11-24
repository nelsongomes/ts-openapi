import { doesNotMatch } from "assert";
import Joi from "joi";
import { OpenApi } from "../../../src/openapi/openapi";
import { textPlain } from "../../../src/openapi/openapi-helpers";
import { Parameters, ParameterIn } from "../../../src/openapi/openapi.types";

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

    test("should succeed", (done) => {
      const parameters: Parameters = [];
      const query = Joi.object().keys({
        username: Joi.string().required(),
      });

      openApi.genericParams(parameters, query, ParameterIn.Path);

      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            parameters,
            responses: {
              200: textPlain("Successful operation."),
            },
            summary: "Server Test",
            tags: ["Internals"],
          },
        },
        true
      );

      done();
    });

    test("should throw an exception if path parameter name is not made up of “word characters” ([A-Za-z0-9_])", (done) => {
      const parameters: Parameters = [];
      const query = Joi.object().keys({
        "user#name": Joi.string(),
      });

      try {
        openApi.genericParams(parameters, query, ParameterIn.Path);

        openApi.addPath(
          "/test",
          {
            get: {
              description: "Test endpoint",
              operationId: "id",
              parameters,
              responses: {
                200: textPlain("Successful operation."),
              },
              summary: "Server Test",
              tags: ["Internals"],
            },
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

    test("should throw an exception if path parameter is an object or array", (done) => {
      const parameters: Parameters = [];
      const query = Joi.object().keys({
        stringArray: Joi.array().items({ list: Joi.string() }),
      });

      try {
        openApi.genericParams(parameters, query, ParameterIn.Path);

        openApi.addPath(
          "/test",
          {
            get: {
              description: "Test endpoint",
              operationId: "id",
              parameters,
              responses: {
                200: textPlain("Successful operation."),
              },
              summary: "Server Test",
              tags: ["Internals"],
            },
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

    test("should throw an exception if path parameter is not required", (done) => {
      const parameters: Parameters = [];
      const query = Joi.object().keys({
        someString: Joi.string(),
      });

      try {
        openApi.genericParams(parameters, query, ParameterIn.Path);

        openApi.addPath(
          "/test",
          {
            get: {
              description: "Test endpoint",
              operationId: "id",
              parameters,
              responses: {
                200: textPlain("Successful operation."),
              },
              summary: "Server Test",
              tags: ["Internals"],
            },
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
