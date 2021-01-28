import Joi from "joi";
import { OpenApi } from "../../../../src/openapi/openapi";
import { textPlain } from "../../../../src/openapi/helpers/body-mimetype";
import { Parameters, ParameterIn } from "../../../../src/openapi/openapi.types";
import { Types } from "../../../../src/openapi/helpers/types";

describe("src/openapi/openapi", () => {
  let openApi: OpenApi;

  describe("Array of date-time", () => {
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

    test("date-time array simple", async () => {
      const query = Joi.object().keys({
        timestamps: Joi.array().items(Types.DateTime())
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

    test("date array simple", async () => {
      const query = Joi.object().keys({
        timestamps: Joi.array().items(Types.Date())
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

    test("date-time array all options", async () => {
      const query = Joi.object()
        .keys({
          timestamps: Joi.array()
            .items(
              Types.DateTime({
                description: "ignore",
                nullable: true,
                required: true
              })
            )
            .min(1)
            .max(100)
            .required()
            .description("date-time array")
            .default(["2020-10-14T22:12:53.065Z", "2020-10-14T22:12:53.065Z"])
            .example(["2020-10-14T22:12:53.065Z"])
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
