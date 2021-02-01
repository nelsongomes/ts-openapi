import Joi from "joi";
import { OpenApi } from "../../../../src/openapi/openapi";
import { textPlain } from "../../../../src/openapi/helpers/body-mimetype";
import { Parameters, ParameterIn } from "../../../../src/openapi/openapi.types";
import { bodyParams } from "../../../../src/openapi/openapi-functions";
import { Types } from "../../../../src/openapi/helpers/types";

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
      const body = Joi.object().keys({
        float: Types.Number(),
        integer: Types.Integer(),
        string: Types.String(),
        binary: Types.Binary(),
        byte: Types.Byte(),
        boolean: Types.Boolean(),
        date: Types.Date(),
        dateTime: Types.DateTime(),
        stringarray: Joi.array().items(Types.String()),
        base64array: Joi.array().items(Types.Byte()),
        internalobject: Types.Object({
          properties: {
            uuid: Types.Uuid(),
            boolean: Types.Boolean()
          }
        }),
        objectArray: Joi.array().items({
          obj: Joi.object().keys({
            uuid: Types.Uuid(),
            boolean: Types.Boolean()
          })
        })
      });

      const parameters: Parameters = [];

      openApi.addPath(
        "/test",
        {
          post: {
            description: "Test endpoint",
            operationId: "id",
            validationSchema: { body },
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

    test("object all options", async () => {
      const body = Joi.object()
        .keys({
          parameter1: Types.String({ description: "String parameter" })
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
            validationSchema: { body },
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
