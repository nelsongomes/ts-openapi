import { OpenApi } from "../../../src/openapi/openapi";
import {
  apiKeyAuth,
  basicAuth,
  bearerAuth,
  cookieAuth,
  textPlain,
} from "../../../src/openapi/helpers/openapi-helpers";

describe("src/openapi/openapi", () => {
  describe("Security Schemes", () => {
    test("Basic Security (global)", async () => {
      const openApi = new OpenApi(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      try {
        openApi.setServers([{ url: "https://server.com" }]);

        // declare security schemes available
        openApi.declareSecurityScheme("basicSecurity", basicAuth());

        // declare global schemes (applicable to all methods)
        openApi.addGlobalSecurityScheme("basicSecurity");

        openApi.addPath(
          "/health",
          {
            get: {
              description: "Service healthcheck endpoint",
              operationId: "healthcheck",
              parameters: [],
              responses: {
                200: textPlain("Successful operation."),
              },
              summary: "Server Healthcheck",
              tags: ["Internals"],
            },
          },
          true
        );

        expect(openApi.generateJson()).toMatchSnapshot();
      } catch (e) {
        fail("No exception expected");
      }
    });

    test("Basic Security (local)", async () => {
      const openApi = new OpenApi(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      try {
        openApi.setServers([{ url: "https://server.com" }]);

        // declare security schemes available
        openApi.declareSecurityScheme("basicSecurity", basicAuth());

        openApi.addPath(
          "/health",
          {
            get: {
              description: "Service healthcheck endpoint",
              operationId: "healthcheck",
              parameters: [],
              responses: {
                200: textPlain("Successful operation."),
              },
              summary: "Server Healthcheck",
              tags: ["Internals"],
              security: [{ basicSecurity: [] }],
            },
          },
          true
        );

        expect(openApi.generateJson()).toMatchSnapshot();
      } catch (e) {
        fail("No exception expected");
      }
    });

    test("Api Key Security (local)", async () => {
      const openApi = new OpenApi(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      try {
        openApi.setServers([{ url: "https://server.com" }]);

        // declare security schemes available
        openApi.declareSecurityScheme(
          "apiSecurity",
          apiKeyAuth("X-API-KEY", "header")
        );

        openApi.addPath(
          "/health",
          {
            get: {
              description: "Service healthcheck endpoint",
              operationId: "healthcheck",
              parameters: [],
              responses: {
                200: textPlain("Successful operation."),
              },
              summary: "Server Healthcheck",
              tags: ["Internals"],
              security: [{ apiSecurity: [] }],
            },
          },
          true
        );

        expect(openApi.generateJson()).toMatchSnapshot();
      } catch (e) {
        fail("No exception expected");
      }
    });

    test("Cookie Security (local)", async () => {
      const openApi = new OpenApi(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      try {
        openApi.setServers([{ url: "https://server.com" }]);

        // declare security schemes available
        openApi.declareSecurityScheme(
          "cookieSecurity",
          cookieAuth("JSESSIONID")
        );

        openApi.addPath(
          "/health",
          {
            get: {
              description: "Service healthcheck endpoint",
              operationId: "healthcheck",
              parameters: [],
              responses: {
                200: textPlain("Successful operation."),
              },
              summary: "Server Healthcheck",
              tags: ["Internals"],
              security: [{ cookieSecurity: [] }],
            },
          },
          true
        );

        expect(openApi.generateJson()).toMatchSnapshot();
      } catch (e) {
        fail("No exception expected");
      }
    });

    test("Bearer Security (local)", async () => {
      const openApi = new OpenApi(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      try {
        openApi.setServers([{ url: "https://server.com" }]);

        // declare security schemes available
        openApi.declareSecurityScheme("bearerSecurity", bearerAuth());

        openApi.addPath(
          "/health",
          {
            get: {
              description: "Service healthcheck endpoint",
              operationId: "healthcheck",
              parameters: [],
              responses: {
                200: textPlain("Successful operation."),
              },
              summary: "Server Healthcheck",
              tags: ["Internals"],
              security: [{ bearerSecurity: [] }],
            },
          },
          true
        );

        expect(openApi.generateJson()).toMatchSnapshot();
      } catch (e) {
        fail("No exception expected");
      }
    });

    test("Bearer Security with bearerFormat (local)", async () => {
      const openApi = new OpenApi(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      try {
        openApi.setServers([{ url: "https://server.com" }]);

        // declare security schemes available
        openApi.declareSecurityScheme("bearerJwtSecurity", bearerAuth("JWT"));

        openApi.addPath(
          "/health",
          {
            get: {
              description: "Service healthcheck endpoint",
              operationId: "healthcheck",
              parameters: [],
              responses: {
                200: textPlain("Successful operation."),
              },
              summary: "Server Healthcheck",
              tags: ["Internals"],
              security: [{ bearerJwtSecurity: [] }],
            },
          },
          true
        );

        expect(openApi.generateJson()).toMatchSnapshot();
      } catch (e) {
        fail("No exception expected");
      }
    });

    test("Should throw an error (global)", async () => {
      const openApi = new OpenApi(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      try {
        openApi.setServers([{ url: "https://server.com" }]);

        // declare security schemes available
        openApi.declareSecurityScheme("basicSecurity", basicAuth());

        // declare global schemes (applicable to all methods)
        openApi.addGlobalSecurityScheme("basicSecurityUnknown");
      } catch (e) {
        expect(e.message).toBe(
          "Unknown security scheme 'basicSecurityUnknown'"
        );
      }
    });

    test("Should throw an error (local)", async () => {
      const openApi = new OpenApi(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      try {
        openApi.setServers([{ url: "https://server.com" }]);

        // declare security schemes available
        openApi.declareSecurityScheme("basicSecurity", basicAuth());
      } catch (e) {
        expect(e.message).toBe(
          "Unknown security scheme 'basicSecurityUnknown'"
        );
      }
    });
  });
});
