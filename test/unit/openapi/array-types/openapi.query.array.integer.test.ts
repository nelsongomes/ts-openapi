import Joi from "joi";
import { OpenApi } from "../../../../src/openapi/openapi";
import { textPlain } from "../../../../src/openapi/helpers/body-mimetype";
import {
  Parameters,
  ParameterIn,
  WebRequestSchema,
} from "../../../../src/openapi/openapi.types";

describe("src/openapi/openapi", () => {
  let openApi: OpenApi;

  describe("Array of integer", () => {
    beforeEach(() => {
      openApi = new OpenApi(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      openApi.setServers([{ url: "https://server.com" }]);
    });

    test("integer array all options", async () => {
      const parameters: Parameters = [];

      const query = Joi.object()
        .keys({
          integerList: Joi.array()
            .items(
              Joi.number()
                .integer()

                // ignore these for arrays
                .min(1)
                .max(50)
                .required()
                .description("Integer description, age")
                .example(1)
                .default(2)
                .allow(null)
            )
            .description("Array of integers")
            .required()
            .min(1)
            .max(10)
            .default([1, 2, 3])
            .example([4, 5, 6])
            .allow(null),
        })
        .description("IGNORED");

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

    test("integer array minimal options", async () => {
      const parameters: Parameters = [];

      const query = Joi.object().keys({
        integerList: Joi.array().items(Joi.number().integer()),
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
  });
});
