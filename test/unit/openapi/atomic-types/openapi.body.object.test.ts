import Joi from "joi";
import { OpenApi } from "../../../../src/openapi/openapi";
import { textPlain } from "../../../../src/openapi/openapi-helpers";
import {
  Parameters,
  ParameterIn,
  WebRequestSchema,
  RequestBody,
} from "../../../../src/openapi/openapi.types";

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
        object: Joi.object()
          .keys({
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
          })
          .required(),
      });

      const parameters: Parameters = [];

      openApi.addPath(
        "/test",
        {
          post: {
            description: "Test endpoint",
            operationId: "id",
            parameters,
            requestBody: openApi.bodyParams(
              bodySchema,
              "Just an object description"
            ),
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

    test.only("object all options", async () => {
      const parameters: Parameters = [];
      const query = Joi.object()
        .keys({
          base64string: Joi.binary()
            .description("some binary base64 value")
            .required()
            .min(512)
            .max(1024)
            .default("c2FtcGxlMQ==")
            .example("c2FtcGxlMQ==")
            .allow(null),
        })
        .description("ignore this");

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
      expect(openApi.generateJson()).toMatchSnapshot();
    });
  });
});
