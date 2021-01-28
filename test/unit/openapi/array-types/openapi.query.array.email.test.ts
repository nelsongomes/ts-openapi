import Joi from "joi";
import { OpenApi } from "../../../../src/openapi/openapi";
import { textPlain } from "../../../../src/openapi/helpers/body-mimetype";
import {
  Parameters,
  ParameterIn,
  WebRequestSchema
} from "../../../../src/openapi/openapi.types";
import { Types } from "../../../../src/openapi/helpers/types";

describe("src/openapi/openapi", () => {
  let openApi: OpenApi;

  describe("Array of email", () => {
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
              200: textPlain("Successful operation.")
            },
            summary: "Server Healthcheck",
            tags: ["Internals"]
          }
        },
        true
      );
    });

    test("email array simple", async () => {
      const query = Joi.object().keys({
        emails: Joi.array().items(Types.Email())
      });

      openApi.addPath(
        "/test",
        {
          get: {
            description: "Test endpoint",
            operationId: "id",
            validationSchema: { query },
            responses: {
              200: textPlain("Successful operation.")
            },
            summary: "Server Test",
            tags: ["Internals"]
          }
        },
        true
      );
      expect(openApi.generateJson()).toMatchSnapshot();
    });

    test("email array all options", async () => {
      const query = Joi.object()
        .keys({
          emails: Joi.array()
            .items(
              Types.Email({
                description: "email",
                nullable: true,
                required: true,
                maxLength: 999
              })
            )
            .min(1)
            .max(100)
            .required()
            .description("Email array")
            .default(["a@a.com", "b@b.com"])
            .example(["c@c.com"])
            .allow(null)
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
              200: textPlain("Successful operation.")
            },
            summary: "Server Test",
            tags: ["Internals"]
          }
        },
        true
      );
      expect(openApi.generateJson()).toMatchSnapshot();
    });
  });
});
