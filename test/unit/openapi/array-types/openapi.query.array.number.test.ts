import { OpenApi } from "../../../../src/openapi/openapi";
import { textPlain } from "../../../../src/openapi/helpers/body-mimetype";
import { Types } from "../../../../src/openapi/helpers/types";

describe("src/openapi/openapi", () => {
  let openApi: OpenApi;

  describe("Array of number", () => {
    beforeEach(() => {
      openApi = new OpenApi(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      openApi.setServers([{ url: "https://server.com" }]);
    });

    test("number array all options", async () => {
      const query = {
        numberList: Types.Array({
          arrayType: Types.Number({
            minValue: 1,
            maxValue: 50,
            required: true,
            description: "Some integer",
            example: 1,
            default: 2,
            nullable: true
          }),
          description: "Array of integers",
          required: true,
          minLength: 1,
          maxLength: 10,
          default: [1, 2, 3],
          example: [4, 5, 6],
          nullable: true
        })
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

    test("number array minimal options", async () => {
      const query = {
        numberList: Types.Array({ arrayType: Types.Number() })
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
