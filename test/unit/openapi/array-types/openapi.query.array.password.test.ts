import Joi from "joi";
import { example } from "yargs";
import { OpenApi } from "../../../../src/openapi/openapi";
import { textPlain } from "../../../../src/openapi/helpers/body-mimetype";
import {
  Parameters,
  ParameterIn,
  WebRequestSchema,
} from "../../../../src/openapi/openapi.types";

describe("src/openapi/openapi", () => {
  let openApi: OpenApi;

  describe("Array of password", () => {
    beforeEach(() => {
      openApi = new OpenApi(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      openApi.setServers([{ url: "https://server.com" }]);
      openApi.addPath(
        "/health",
        {
          get: {
            description: "Service healthcheck endpoint",
            operationId: "repeated",
            parameters: [],
            responses: {
              200: textPlain("Successful operation."),
            },
            summary: "Server Healthcheck",
            tags: ["Internals"],
          },
        },
        true
      );
    });

    test("password array simple", async () => {
      const parameters: Parameters = [];

      const query = Joi.object().keys({
        passwords: Joi.array().items(Joi.string().meta({ format: "password" })),
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
      expect(openApi.generateJson()).toMatchSnapshot();
    });

    test("password array all options", async () => {
      const parameters: Parameters = [];
      const query = Joi.object()
        .keys({
          passwords: Joi.array()
            .items(
              Joi.string()
                .meta({ format: "password" })
                // ignore these
                .description("password string")
                .max(999)
                .allow(null)
                .required()
            )
            .min(1)
            .max(100)
            .required()
            .description("Email array")
            .default(["a@a.com", "b@b.com"])
            .example(["c@c.com"])
            .allow(null),
        })
        .description("ignore");

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
