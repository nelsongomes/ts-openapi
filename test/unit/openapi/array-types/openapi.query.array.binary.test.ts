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

  describe("Array of binary", () => {
    beforeEach(() => {
      openApi = new OpenApi(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      openApi.setServers([{ url: "https://server.com" }]);
    });

    test("binary array simple", async () => {
      const query = Joi.object().keys({
        binaryArray: Joi.array().items(Joi.binary()),
      });

      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            validationSchema: { query },
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

    test("binary array all options", async () => {
      const query = Joi.object()
        .keys({
          base64string: Joi.array()
            .items(
              Joi.binary()
                .description("some binary base64 value")
                // ignore these
                .required()
                .min(512)
                .max(1024)
                .default("c2FtcGxlMQ==")
                .example("c2FtcGxlMQ==")
                .allow(null)
            )
            .required()
            .min(10)
            .max(20)
            .default(["c2FtcGxlMQ=="])
            .example(["c2FtcGxlMQ=="])
            .allow(null),
        })
        .description("ignore");

      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            validationSchema: { query },
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
