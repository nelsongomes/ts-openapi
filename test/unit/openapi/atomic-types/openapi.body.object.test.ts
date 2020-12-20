import Joi from "joi";
import { OpenApi } from "../../../../src/openapi/openapi";
import { textPlain } from "../../../../src/openapi/helpers/openapi-helpers";
import { Parameters, ParameterIn } from "../../../../src/openapi/openapi.types";
import { bodyParams } from "../../../../src/openapi/openapi-functions";

describe("src/openapi/openapi", () => {
  let openApi: OpenApi;

  describe("Object", () => {
    beforeEach(() => {
      openApi = new OpenApi(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      openApi.setServers([{ url: "https://server.com" }]);
    });

    test("object simple", async () => {
      const bodySchema = Joi.object().keys({
        float: Joi.number(),
        integer: Joi.number().integer(),
        string: Joi.string(),
        binary: Joi.binary(),
        byte: Joi.binary().encoding("base64"),
        boolean: Joi.boolean(),
        date: Joi.string()
          .isoDate()
          .meta({ format: "date" }),
        dateTime: Joi.string().isoDate(),
        stringarray: Joi.array().items(Joi.string()),
        base64array: Joi.array().items(Joi.binary().encoding("base64")),
        internalobject: Joi.object().keys({
          uuid: Joi.string().meta({ format: "uuid" }),
          boolean: Joi.boolean(),
        }),
        objectArray: Joi.array().items({
          obj: Joi.object().keys({
            uuid: Joi.string().meta({ format: "uuid" }),
            boolean: Joi.boolean(),
          }),
        }),
      });

      const parameters: Parameters = [];

      openApi.addPath(
        "/test",
        {
          post: {
            description: "Test endpoint",
            operationId: "id",
            parameters,
            requestBody: bodyParams(bodySchema),
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

    test("object all options", async () => {
      const query = Joi.object()
        .keys({
          parameter1: Joi.string().description("String parameter"),
        })
        .required()
        .default({ parameter1: "default" })
        .example({ parameter1: "default" })
        .allow(null)
        .description("My body description");

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
    });
  });
});
