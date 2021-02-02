import { OpenApi } from "../../../src/openapi/openapi";
import { textPlain } from "../../../src/openapi/helpers/body-mimetype";
import { Types } from "../../../src/openapi/helpers/types";

describe.only("src/openapi/openapi", () => {
  let openApi: OpenApi;

  describe("Body parameters", () => {
    beforeEach(() => {
      openApi = new OpenApi(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      openApi.setServers([{ url: "https://server.com" }]);
    });

    test("should succeed with an object, without description", done => {
      const body = Types.Object({
        properties: {
          username: Types.String({ description: "Username", required: true }),
          password: Types.Password({
            required: true,
            description: "User password"
          })
        },
        required: true,
        example: { username: "johndoe@acme.com", password: "*******" }
      });

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
      done();
    });

    test("should succeed with an object with all types", done => {
      const body = Types.Object({
        properties: {
          string: Types.String({ description: "Username" }),
          number: Types.Number(),
          integer: Types.Integer(),
          object: Types.Object({
            properties: { internalString: Types.String() }
          }),
          array: Types.Array({ arrayType: Types.String() }),
          arrayOfObjects: Types.Array({
            arrayType: Types.Object({
              properties: { internalString: Types.String() }
            })
          }),
          boolean: Types.Boolean(),
          date: Types.Date(),
          dateTime: Types.DateTime()
        },
        required: true,
        description: "Full body description.",
        example: { username: "johndoe@acme.com", password: "*******" }
      });

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
      done();
    });
  });
});
