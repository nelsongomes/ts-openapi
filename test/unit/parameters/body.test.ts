import { doesNotMatch, strict } from "assert";
import Joi from "joi";
import { OpenApi } from "../../../src/openapi/openapi";
import { textPlain } from "../../../src/openapi/helpers/body-mimetype";
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
      const body = Joi.object()
        .keys({
          username: Joi.string()
            .description("Username")
            .required(),
          password: Joi.string()
            .required()
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
            validationSchema: { body },
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

    test("should succeed with an object with all types", (done) => {
      const body = Joi.object()
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
            validationSchema: { body },
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
