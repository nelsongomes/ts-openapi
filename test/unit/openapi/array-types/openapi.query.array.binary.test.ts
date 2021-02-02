import Joi from "joi";
import { OpenApi } from "../../../../src/openapi/openapi";
import { textPlain } from "../../../../src/openapi/helpers/body-mimetype";
import { Types } from "../../../../src/openapi/helpers/types";

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
      const query = {
        binaryArray: Joi.array().items(Types.Binary())
      };

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

    test("binary array all options", async () => {
      const query = {
        base64string: Joi.array()
          .items(
            Types.Binary({
              description: "some binary base64 value",
              required: true,
              minLength: 512,
              maxLength: 1024,
              default: "c2FtcGxlMQ==",
              example: "c2FtcGxlMQ==",
              nullable: true
            })
          )
          .required()
          .min(10)
          .max(20)
          .default(["c2FtcGxlMQ=="])
          .example(["c2FtcGxlMQ=="])
          .description("bin array")
          .allow(null)
      };

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
