import { doesNotMatch, strict } from "assert";
import Joi from "joi";
import { OpenApi } from "../../../src/openapi/openapi";
import { textPlain } from "../../../src/openapi/openapi-helpers";
import {
  Parameters,
  ParameterIn,
  WebRequestSchema,
} from "../../../src/openapi/openapi.types";

describe("src/openapi/openapi", () => {
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

    test("should throw an exception if query parameter is an object", (done) => {
      const parameters: Parameters = [];
      const query = Joi.object().keys({
        someObject: Joi.object().keys({ test: Joi.string() }),
      });

      try {
        openApi.genericParams(parameters, query, ParameterIn.Query);

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

        done.fail("It should have thrown an exception it's an object");
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe("Query param 'someObject' cannot be an object.");
        done();
      }
    });

    test("should throw an exception if query parameter is an array of arrays", (done) => {
      const parameters: Parameters = [];
      const query = Joi.object().keys({
        arrayOfArrays: Joi.array().items({
          test: Joi.array().items({ string: Joi.string() }),
        }),
      });

      try {
        openApi.genericParams(parameters, query, ParameterIn.Query);

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
          "It should have thrown an exception because only scalar arrays are valid"
        );
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(
          "Query param 'arrayOfArrays' type array can only have scalar types inside of it (cannot be an array of arrays or an array of objects)."
        );
        done();
      }
    });

    test("should succeed query parameter is an array of scalar", (done) => {
      const parameters: Parameters = [];
      const query = Joi.object().keys({
        arrayOfArrays: Joi.array().items({
          test: Joi.string(),
        }),
      });

      openApi.genericParams(parameters, query, ParameterIn.Query);

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
  });
});
