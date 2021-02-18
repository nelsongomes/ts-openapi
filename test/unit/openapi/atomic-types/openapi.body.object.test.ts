import { OpenApi } from "../../../../src/openapi/openapi";
import { textPlain } from "../../../../src/openapi/helpers/body-mimetype";
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
      const body = Types.Object({
        properties: {
          float: Types.Number(),
          integer: Types.Integer(),
          string: Types.String(),
          binary: Types.Binary(),
          byte: Types.Byte(),
          boolean: Types.Boolean(),
          date: Types.Date(),
          dateTime: Types.DateTime(),
          stringarray: Types.Array({ arrayType: Types.String() }),
          base64array: Types.Array({ arrayType: Types.Byte() }),
          internalobject: Types.Object({
            properties: {
              uuid: Types.Uuid(),
              boolean: Types.Boolean()
            }
          }),
          objectArray: Types.Array({
            arrayType: Types.Object({
              properties: {
                obj: Types.Object({
                  properties: {
                    uuid: Types.Uuid(),
                    boolean: Types.Boolean()
                  }
                })
              }
            })
          })
        }
      });

      openApi.addPath(
        "/test",
        {
          post: {
            description: "Test endpoint",
            operationId: "id",
            requestSchema: { body },
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
      const body = Types.Object({
        properties: {
          parameter1: Types.String({ description: "String parameter" })
        },
        required: true,
        default: { parameter1: "default" },
        example: { parameter1: "default" },
        nullable: true,
        description: "My body description"
      });

      openApi.addPath(
        "/test",
        {
          post: {
            description: "Test endpoint",
            operationId: "id",
            requestSchema: { body },
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
