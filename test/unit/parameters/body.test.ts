import { doesNotMatch, strict } from "assert";
import Joi from "joi";
import { OpenApi } from "../../../src/openapi/openapi";
import { textPlain } from "../../../src/openapi/openapi-helpers";
import { Parameters } from "../../../src/openapi/openapi.types";

describe("src/openapi/openapi", () => {
  let openApi: OpenApi;

  describe("Body parameters", () => {
    beforeEach(() => {
      openApi = new OpenApi(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      openApi.setServers([{ url: "https://server.com" }]);
    });

    test.only("should succeed with an object", (done) => {
      const query = Joi.object().keys({
        anyObjectParameter: Joi.object()
          .keys({
            username: Joi.string().description("Username"),
            password: Joi.string()
              .meta({ format: "password" })
              .description("User password"),
          })
          .required()
          .description("IGNORED")
          .example({ username: "johndoe@acme.com", password: "*******" }),
      });

      openApi.addPath(
        "/test",
        {
          post: {
            description: "Test endpoint",
            operationId: "id",
            requestBody: openApi.bodyParams(query, "Login request body."),
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
      done();
    });

    test("should throw an exception if body is NOT an object", (done) => {
      const parameters: Parameters = [];
      const query = Joi.object().keys({
        test: Joi.string(),
      });

      try {
        openApi.addPath(
          "/test",
          {
            post: {
              description: "Test endpoint",
              operationId: "id",
              requestBody: openApi.bodyParams(query, "desc"),
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
        expect(e.message).toBe("Request body must be an object definition.");
        done();
      }
    });

    test("should throw an exception if body is NOT required", (done) => {
      const parameters: Parameters = [];
      const query = Joi.object().keys({
        test: Joi.object().keys({ name: Joi.string() }),
      });

      try {
        openApi.addPath(
          "/test",
          {
            post: {
              description: "Test endpoint",
              operationId: "id",
              requestBody: openApi.bodyParams(query, "desc"),
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
          "It should have thrown an exception because body is not required"
        );
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(
          "Request body must be always required, even if empty."
        );
        done();
      }
    });
  });
});
