import { OpenApi } from "../../../src/openapi/openapi";
import { textPlain } from "../../../src/openapi/helpers/body-mimetype";
import { Types } from "../../../src/openapi/helpers/types";

describe("src/openapi/openapi", () => {
  describe("Constructor", () => {
    test("simple", async () => {
      const openApi = new OpenApi(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      expect(openApi instanceof OpenApi).toBe(true);
    });

    test("add body", async () => {
      const openApi = new OpenApi(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      const body = Types.Object({
        properties: {
          username: Types.String()
        },
        description: "Sample body"
      });

      openApi.setServers([{ url: "https://server.com" }]);
      openApi.addPath(
        "/something",
        {
          post: {
            operationId: "id",
            description: "desc",
            summary: "summary",
            tags: ["example"],
            responses: {
              [200]: { description: "Success", content: { "plain/text": {} } }
            },
            validationSchema: { body }
          }
        },
        true
      );

      expect(openApi.generateJson()).toMatchSnapshot();
    });

    test("simple, but no servers were added", async () => {
      const openApi = new OpenApi(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      try {
        openApi.generateJson();
        fail("Should have thrown exception");
      } catch (e) {
        expect(e.message).toBe("No servers were added to OpenApi definition");
      }
    });

    test("simple, but no paths were added", done => {
      const openApi = new OpenApi(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      try {
        openApi.setServers([{ url: "https://server.com" }]);
        openApi.generateJson();

        done.fail("Should have thrown exception");
      } catch (e) {
        expect(e.message).toBe("No paths were added to OpenApi definition.");

        done();
      }
    });

    test("simple, added servers and paths", async () => {
      const openApi = new OpenApi(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      try {
        openApi.setServers([{ url: "https://server.com" }]);
        openApi.addPath(
          "/health",
          {
            get: {
              description: "Service healthcheck endpoint",
              operationId: "healthcheck",
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

        expect(openApi.generateJson()).toMatchSnapshot();
      } catch (e) {
        fail("No exception expected");
      }
    });

    test("simple, added servers and paths, get cannot have body", async () => {
      const openApi = new OpenApi(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      const body = Types.Object({
        properties: {
          username: Types.String()
        },
        description: "Sample body"
      });

      try {
        openApi.setServers([{ url: "https://server.com" }]);
        openApi.addPath(
          "/health",
          {
            get: {
              description: "Service healthcheck endpoint",
              operationId: "healthcheck",
              validationSchema: { body },
              responses: {
                200: textPlain("Successful operation.")
              },
              summary: "Server Healthcheck",
              tags: ["Internals"]
            }
          },
          true
        );

        openApi.generateJson();
      } catch (e) {
        expect(e.message).toBe("GET operations cannot have a requestBody.");
      }
    });

    test("addPath, no operationId", async () => {
      const openApi = new OpenApi(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      try {
        openApi.setServers([{ url: "https://server.com" }]);
        openApi.addPath(
          "/health",
          {
            get: {
              description: "Service healthcheck endpoint",
              validationSchema: {},
              responses: {
                200: textPlain("Successful operation.")
              },
              summary: "Server Healthcheck",
              tags: ["Internals"]
            } as any
          },
          true
        );

        fail("Expected to throw exception");
      } catch (e) {
        expect(e.message).toBe("No operationId supplied.");
      }
    });

    test("addPath, no response", async () => {
      const openApi = new OpenApi(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      try {
        openApi.setServers([{ url: "https://server.com" }]);
        openApi.addPath(
          "/health",
          {
            get: {
              description: "Service healthcheck endpoint",
              operationId: "",
              validationSchema: {},
              responses: {},
              summary: "Server Healthcheck",
              tags: ["Internals"]
            }
          },
          true
        );

        fail("Expected to throw exception");
      } catch (e) {
        expect(e.message).toBe("Should define at least one response.");
      }
    });

    test("addPath, duplicate operationId", async () => {
      const openApi = new OpenApi(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      try {
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

        fail("Expected to throw exception");
      } catch (e) {
        expect(e.message).toBe("Operations must have unique operationIds.");
      }
    });

    test("addPath, public vs private method (private method does not get included)", async () => {
      const openApi = new OpenApi(
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
        false
      );

      expect(openApi.generateJson()).toMatchSnapshot();
    });

    test("setLicense", async () => {
      const openApi = new OpenApi(
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

      openApi.setLicense(
        "Apache 33.0",
        "http://www.apache.org/licenses/LICENSE-33.0.html",
        "http://dummy.io/terms/"
      );

      expect(openApi.generateJson()).toMatchSnapshot();
    });
  });
});
