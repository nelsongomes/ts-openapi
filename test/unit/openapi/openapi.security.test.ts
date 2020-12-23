import { OpenApi } from "../../../src/openapi/openapi";
import {
  apiKeyAuth,
  basicAuth,
  bearerAuth,
  cookieAuth,
  oauth2AuthorizationCodeAuth,
  oauth2ClientCredentialsAuth,
  oauth2ImplicitAuth,
  oauth2PasswordAuth,
} from "../../../src/openapi/helpers/auth";
import { textPlain } from "../../../src/openapi/helpers/body-mimetype";
import { doesNotMatch } from "assert";

describe("src/openapi/openapi", () => {
  describe("Security Schemes", () => {
    test("Basic Security (global)", async (done) => {
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

        done();
      } catch (e) {
        fail("No exception expected");
      }
    });

    test("Basic Security (local)", async (done) => {
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

        done();
      } catch (e) {
        fail("No exception expected");
      }
    });

    test("Api Key Security (local)", async (done) => {
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

        done();
      } catch (e) {
        fail("No exception expected");
      }
    });

    test("Cookie Security (local)", async (done) => {
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

        done();
      } catch (e) {
        fail("No exception expected");
      }
    });

    test("Bearer Security (local)", async (done) => {
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

        done();
      } catch (e) {
        fail("No exception expected");
      }
    });

    test("Oauth2 Security authorizationCode (local)", async (done) => {
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
          "oauth2Security",
          oauth2AuthorizationCodeAuth(
            "This API uses OAuth 2 with the authorizationCode grant flow. [More info](https://api.example.com/docs/auth)",
            "https://api.example.com/oauth2/authorize",
            "https://api.example.com/oauth2/tokenUrl",
            {
              read_pets: "Read your pets",
              write_pets: "Modify pets in your account",
            },
            "https://www.domain.com/refreshUrl"
          )
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
              security: [{ oauth2Security: ["read_pets"] }],
            },
          },
          true
        );

        expect(openApi.generateJson()).toMatchSnapshot();

        done();
      } catch (e) {
        fail("No exception expected");
      }
    });

    test("Oauth2 Security implicit (local)", async (done) => {
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
          "oauth2Security",
          oauth2ImplicitAuth(
            "This API uses OAuth 2 with the implicit grant flow. [More info](https://api.example.com/docs/auth)",
            "https://api.example.com/oauth2/authorize",
            {
              read_pets: "Read your pets",
              write_pets: "Modify pets in your account",
            },
            "https://www.domain.com/refreshUrl"
          )
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
              security: [{ oauth2Security: ["read_pets"] }],
            },
          },
          true
        );

        expect(openApi.generateJson()).toMatchSnapshot();
        done();
      } catch (e) {
        fail("No exception expected");
      }
    });

    test("Oauth2 Security password (local)", async (done) => {
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
          "oauth2Security",
          oauth2PasswordAuth(
            "This API uses OAuth 2 with the implicit grant flow. [More info](https://api.example.com/docs/auth)",
            "https://api.example.com/tokenUrl",
            {
              read_pets: "Read your pets",
              write_pets: "Modify pets in your account",
            },
            "https://www.domain.com/refreshUrl"
          )
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
              security: [{ oauth2Security: ["read_pets"] }],
            },
          },
          true
        );

        expect(openApi.generateJson()).toMatchSnapshot();

        done();
      } catch (e) {
        fail("No exception expected");
      }
    });

    test("Oauth2 Security clientCredentials (local)", async (done) => {
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
          "oauth2Security",
          oauth2ClientCredentialsAuth(
            "This API uses OAuth 2 with the implicit grant flow. [More info](https://api.example.com/docs/auth)",
            "https://api.example.com/tokenUrl",
            {
              read_pets: "Read your pets",
              write_pets: "Modify pets in your account",
            },
            "https://www.domain.com/refreshUrl"
          )
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
              security: [{ oauth2Security: ["read_pets"] }],
            },
          },
          true
        );

        expect(openApi.generateJson()).toMatchSnapshot();

        done();
      } catch (e) {
        fail("No exception expected");
      }
    });

    test("Bearer Security with bearerFormat (local)", async (done) => {
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

        done();
      } catch (e) {
        fail("No exception expected");
      }
    });

    test("Should throw an error if security scheme does not exist (global)", async (done) => {
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
        openApi.addGlobalSecurityScheme("unknown");

        expect(openApi.generateJson()).toMatchSnapshot();
      } catch (e) {
        expect(e.message).toBe("Unknown security scheme 'unknown'");

        done();
      }
    });

    test("Should throw an error if duplicate scheme", async (done) => {
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

        // try to redeclare security scheme
        openApi.declareSecurityScheme("basicSecurity", basicAuth());
      } catch (e) {
        expect(e.message).toBe("Security scheme name already exists.");

        done();
      }
    });

    test("Should throw an error if security scheme does not exist (local)", async (done) => {
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
              security: [{ bearerJwtSecurity: [] }],
            },
          },
          true
        );
      } catch (e) {
        expect(e.message).toBe("Unknown security scheme 'bearerJwtSecurity'");

        done();
      }
    });
  });
});
