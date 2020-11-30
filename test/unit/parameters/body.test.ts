import { doesNotMatch, strict } from "assert";
import Joi from "joi";
import { OpenApi } from "../../../src/openapi/openapi";
import { textPlain } from "../../../src/openapi/helpers/openapi-helpers";
import { ParameterIn, Parameters } from "../../../src/openapi/openapi.types";
import joiToSwagger from "../../../src/joi-conversion";

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

    test("should succeed with an object", (done) => {
      const query = Joi.object().keys({
        anyObjectParameter: Joi.object()
          .keys({
            username: Joi.string().description("Username"),
            password: Joi.string()
              .meta({ format: "password" })
              .description("User password"),
          })
          .required()
          .description("User login")
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
          "It should have thrown an exception because body is not required."
        );
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(
          "Request body must be always required, even if empty."
        );
        done();
      }
    });

    test("should throw an exception if multiple objects in body", (done) => {
      const parameters: Parameters = [];
      const query = Joi.object().keys({
        test: Joi.object()
          .keys({ name: Joi.string() })
          .required(),
        secondObject: Joi.object()
          .keys({ name: Joi.string() })
          .required(),
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
          "It should have thrown an exception because it's only possible to have one body object definition."
        );
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(
          "It's only possible to have one body object definition."
        );
        done();
      }
    });

    test("should throw an exception if body is declared as parameter", (done) => {
      const parameters: Parameters = [];

      const query = Joi.object().keys({
        passwords: Joi.array().items(Joi.string().meta({ format: "password" })),
      });

      try {
        openApi.genericParams(parameters, query, ParameterIn.Body);

        done.fail(
          "It should have thrown an exception because body content must declared with function bodyParams."
        );
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(
          "Body content must declared with function bodyParams."
        );
        done();
      }
    });

    test("should throw an exception if body is empty", (done) => {
      const parameters: Parameters = [];
      const query = Joi.object().keys({});

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

        done.fail("It should have thrown an exception when body is empty.");
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe("Empty object body.");
        done();
      }
    });

    test("should succeed with an object with all types", (done) => {
      const query = Joi.object().keys({
        anyObjectParameter: Joi.object()
          .keys({
            string: Joi.string().description("Username"),
            number: Joi.number(),
            integer: Joi.number().integer(),
            object: Joi.object().keys({ internalString: Joi.string() }),
            array: Joi.array().items(Joi.string()),
            boolean: Joi.boolean(),
            date: Joi.string()
              .isoDate()
              .meta({ format: "date" }),
            dateTime: Joi.string().isoDate(),
          })
          .required()
          .description("User login")
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
  });
});
