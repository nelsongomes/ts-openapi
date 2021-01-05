import Joi from "joi";
import { OpenApi } from "../../../../src/openapi/openapi";
import { textPlain } from "../../../../src/openapi/helpers/body-mimetype";

describe("src/openapi/openapi", () => {
  let openApi: OpenApi;

  describe("Array of byte", () => {
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
            validationSchema: {},
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

    test("byte array simple", async () => {
      const query = Joi.object().keys({
        base64array: Joi.array().items(Joi.binary().encoding("base64")),
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

    test("byte array all options", async () => {
      const query = Joi.object()
        .keys({
          base64array: Joi.array()
            .items(
              Joi.binary()
                .description("some binary base64 value")
                .encoding("base64")
                // ignore these
                .required()
                .min(512)
                .max(1024)
                .default("c2FtcGxlMQ==")
                .example("c2FtcGxlMQ==")
                .allow(null)
            )
            .required()
            .min(1)
            .max(10)
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
