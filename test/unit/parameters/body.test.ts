import { doesNotMatch, strict } from "assert";
import Joi from "joi";
import { OpenApi } from "../../../src/openapi/openapi";
import { textPlain } from "../../../src/openapi/helpers/openapi-helpers";
import { ParameterIn, Parameters } from "../../../src/openapi/openapi.types";
import { bodyParams } from "../../../src/openapi/openapi-functions";

describe.only("src/openapi/openapi", () => {
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

    test("should succeed with an object, without description", (done) => {
      const query = Joi.object()
        .keys({
          username: Joi.string().description("Username"),
          password: Joi.string()
            .meta({ format: "password" })
            .description("User password"),
        })
        .required()
        .example({ username: "johndoe@acme.com", password: "*******" });

      openApi.addPath(
        "/test",
        {
          post: {
            description: "Test endpoint",
            operationId: "id",
            requestBody: bodyParams(query),
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

    test("should succeed with an object with all types", (done) => {
      const query = Joi.object()
        .keys({
          string: Joi.string().description("Username"),
          number: Joi.number(),
          integer: Joi.number().integer(),
          object: Joi.object().keys({ internalString: Joi.string() }),
          array: Joi.array().items(Joi.string()),
          arrayOfObjects: Joi.array().items(
            Joi.object().keys({ internalString: Joi.string() })
          ),
          boolean: Joi.boolean(),
          date: Joi.string()
            .isoDate()
            .meta({ format: "date" }),
          dateTime: Joi.string().isoDate(),
        })
        .required()
        .description("User login")
        .example({ username: "johndoe@acme.com", password: "*******" })
        .description("Full body description.");

      openApi.addPath(
        "/test",
        {
          post: {
            description: "Test endpoint",
            operationId: "id",
            requestBody: bodyParams(query),
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
