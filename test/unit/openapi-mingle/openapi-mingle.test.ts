import axios from "axios";
import {
  OpenApiMingle,
  ServiceList
} from "../../../src/openapi/openapi-mingle";
import { OpenApiSchema } from "../../../src/openapi/openapi.types";

import sample1Data from "./samples/sample1.json";
import openapiData from "./samples/openapi.json";
import { basicAuth, oauth2PasswordAuth } from "../../../src";
import editorSwaggerIoData from "./samples/editor.swagger.io.json";

// tslint:disable:no-console
function log(message: string, e?: Error) {
  if (e) {
    console.log(message, e);
  } else {
    console.log(message);
  }
}
// tslint:enable:no-console

describe("src/openapi/openapi-mingle", () => {
  describe("Constructor", () => {
    test("Create class", async done => {
      const serviceMingle = new OpenApiMingle(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      serviceMingle.setServers([
        {
          url: "https://explorer-eu.awesome-api.com",
          description: "EU Server"
        },
        {
          url: "https://explorer-us.awesome-api.com",
          description: "US Server"
        }
      ]);

      serviceMingle.setLicense("license", "http://license", "http://terms");

      expect(serviceMingle instanceof OpenApiMingle).toBe(true);

      done();
    });
  });

  describe("Mingle services", () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("Simple service remap from private path /public/:userId to public /users/{userId}, skipping other methods, from file", async done => {
      const serviceMingle = new OpenApiMingle(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      serviceMingle.setLicense("license", "http://license", "http://terms");

      const services: ServiceList = {
        users: {
          schemaUrl: "file://test/unit/openapi-mingle/samples/sample1.json",
          publicPrefix: "/users/",
          privatePrefix: "/public/",
          type: "consul"
        }
      };

      serviceMingle.setServers([
        { url: "https://explorer-eu.awesome-api.com" },
        { url: "https://explorer-us.awesome-api.com" }
      ]);

      await serviceMingle.combineServices(services);

      const json = serviceMingle.generateJson() as OpenApiSchema;

      expect(serviceMingle instanceof OpenApiMingle).toBe(true);

      expect(Object.getOwnPropertyNames(json.paths).length).toBe(1);
      expect(Object.getOwnPropertyNames(json.paths)[0]).toBe("/users/{userId}");

      expect(json).toMatchSnapshot();

      done();
    });

    test("Simple service remap from private path /public/:userId to public /users/{userId}, skipping other methods, from remote", async done => {
      const serviceMingle = new OpenApiMingle(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      serviceMingle.setLicense("license", "http://license", "http://terms");

      const services: ServiceList = {
        users: {
          schemaUrl: "http://www.server.test/sample1.json",
          publicPrefix: "/users/",
          privatePrefix: "/public/",
          type: "consul"
        }
      };

      serviceMingle.setServers([
        { url: "https://explorer-eu.awesome-api.com" },
        { url: "https://explorer-us.awesome-api.com" }
      ]);

      // mock axios get request
      jest
        .spyOn(axios, "get")
        .mockImplementation(() =>
          Promise.resolve({ data: sample1Data, status: 200 })
        );

      await serviceMingle.combineServices(services);

      const json = serviceMingle.generateJson() as OpenApiSchema;

      expect(serviceMingle instanceof OpenApiMingle).toBe(true);

      expect(Object.getOwnPropertyNames(json.paths).length).toBe(1);
      expect(Object.getOwnPropertyNames(json.paths)[0]).toBe("/users/{userId}");

      expect(json).toMatchSnapshot();

      done();
    });

    test("Simple service remap from local file and remote uri", async done => {
      const serviceMingle = new OpenApiMingle(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com",
        log
      );

      serviceMingle.setLicense("license", "http://license", "http://terms");

      const services: ServiceList = {
        users: {
          schemaUrl: "file://test/unit/openapi-mingle/samples/sample1.json",
          publicPrefix: "/users/",
          privatePrefix: "/public/",
          type: "consul"
        },
        demo: {
          schemaUrl: "https://generator3.swagger.io/openapi.json",
          publicPrefix: "/openapi/",
          privatePrefix: "/",
          type: "consul"
        }
      };

      serviceMingle.setServers([
        { url: "https://explorer-eu.awesome-api.com" },
        { url: "https://explorer-us.awesome-api.com" }
      ]);

      // mock axios get request
      jest
        .spyOn(axios, "get")
        .mockImplementation(() =>
          Promise.resolve({ data: openapiData, status: 200 })
        );

      await serviceMingle.combineServices(services);

      const json = serviceMingle.generateJson() as OpenApiSchema;

      expect(serviceMingle instanceof OpenApiMingle).toBe(true);

      // combined output will be 8 methods
      expect(Object.getOwnPropertyNames(json.paths).length).toBe(8);

      expect(json).toMatchSnapshot();

      done();
    });

    test("Should check all scopes are valid", async done => {
      const serviceMingle = new OpenApiMingle(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com",
        log
      );

      serviceMingle.setLicense("license", "http://license", "http://terms");

      const services: ServiceList = {
        users: {
          schemaUrl: "https://editor.swagger.io/openapi.json",
          publicPrefix: "/users/",
          privatePrefix: "/",
          type: "consul"
        }
      };

      serviceMingle.setServers([
        { url: "https://explorer-eu.awesome-api.com" },
        { url: "https://explorer-us.awesome-api.com" }
      ]);

      serviceMingle.declareSecurityScheme(
        "petstore_auth",
        oauth2PasswordAuth("Oauth2 auth", "http://", {
          "read:pets": "test scope",
          "write:pets": "test scope"
        })
      );
      serviceMingle.declareSecurityScheme("api_key", basicAuth());

      // mock axios get request
      jest
        .spyOn(axios, "get")
        .mockImplementation(() =>
          Promise.resolve({ data: editorSwaggerIoData, status: 200 })
        );

      await serviceMingle.combineServices(services);

      done();
    });

    test("Should throw error because security scheme scope is unknown", async done => {
      const serviceMingle = new OpenApiMingle(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com",
        log
      );

      serviceMingle.setLicense("license", "http://license", "http://terms");

      const services: ServiceList = {
        users: {
          schemaUrl: "https://editor.swagger.io/openapi.json",
          publicPrefix: "/users/",
          privatePrefix: "/",
          type: "consul"
        }
      };

      serviceMingle.setServers([
        { url: "https://explorer-eu.awesome-api.com" },
        { url: "https://explorer-us.awesome-api.com" }
      ]);

      serviceMingle.declareSecurityScheme(
        "petstore_auth",
        oauth2PasswordAuth("Oauth2 auth", "http://", {
          "scope:read": "test scope"
        })
      );
      serviceMingle.declareSecurityScheme("api_key", basicAuth());

      // mock axios get request
      jest
        .spyOn(axios, "get")
        .mockImplementation(() =>
          Promise.resolve({ data: editorSwaggerIoData, status: 200 })
        );

      try {
        await serviceMingle.combineServices(services);

        fail("Should have thrown an exception");
      } catch (error) {
        expect(error.message).toBe(
          "Security scope 'write:pets' does not have exist in petstore_auth flow 'password' declaration."
        );
      }

      done();
    });

    test("Should throw error because security scheme named does not have scopes", async done => {
      const serviceMingle = new OpenApiMingle(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com",
        log
      );

      serviceMingle.setLicense("license", "http://license", "http://terms");

      const services: ServiceList = {
        users: {
          schemaUrl: "https://editor.swagger.io/openapi.json",
          publicPrefix: "/users/",
          privatePrefix: "/",
          type: "consul"
        }
      };

      serviceMingle.setServers([
        { url: "https://explorer-eu.awesome-api.com" },
        { url: "https://explorer-us.awesome-api.com" }
      ]);

      serviceMingle.declareSecurityScheme("petstore_auth", basicAuth());
      serviceMingle.declareSecurityScheme("api_key", basicAuth());

      // mock axios get request
      jest
        .spyOn(axios, "get")
        .mockImplementation(() =>
          Promise.resolve({ data: editorSwaggerIoData, status: 200 })
        );

      try {
        await serviceMingle.combineServices(services);

        fail("Should have thrown an exception");
      } catch (e) {
        expect(e.message).toBe(
          "Security scheme 'petstore_auth' does not have scopes"
        );
      }

      done();
    });

    test("Should throw error because security scheme is unknown", async done => {
      const serviceMingle = new OpenApiMingle(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com",
        log
      );

      serviceMingle.setLicense("license", "http://license", "http://terms");

      const services: ServiceList = {
        users: {
          schemaUrl: "https://editor.swagger.io/openapi.json",
          publicPrefix: "/users/",
          privatePrefix: "/",
          type: "consul"
        }
      };

      serviceMingle.setServers([
        { url: "https://explorer-eu.awesome-api.com" },
        { url: "https://explorer-us.awesome-api.com" }
      ]);

      serviceMingle.declareSecurityScheme("basicSecurity", basicAuth());

      // mock axios get request
      jest
        .spyOn(axios, "get")
        .mockImplementation(() =>
          Promise.resolve({ data: editorSwaggerIoData, status: 200 })
        );

      try {
        await serviceMingle.combineServices(services);

        fail("Should have thrown an exception");
      } catch (e) {
        expect(e.message).toBe("Unknown security scheme 'petstore_auth'");
      }

      done();
    });

    test("Should throw because remote uri does not exist", async done => {
      const serviceMingle = new OpenApiMingle(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      serviceMingle.setLicense("license", "http://license", "http://terms");

      const services: ServiceList = {
        users: {
          schemaUrl: "http://www.server.test/sample1.json",
          publicPrefix: "/users/",
          privatePrefix: "/public/",
          type: "consul"
        }
      };

      serviceMingle.setServers([
        { url: "https://explorer-eu.awesome-api.com" },
        { url: "https://explorer-us.awesome-api.com" }
      ]);

      // mock axios get request
      jest
        .spyOn(axios, "get")
        .mockImplementation(() =>
          Promise.reject(new Error("Request failed with status code 404"))
        );

      try {
        await serviceMingle.combineServices(services);

        fail("Should have thrown");
      } catch (e) {
        expect(e.message).toBe("Request failed with status code 404");
      }

      done();
    });

    test("Should throw because there are 2 operations with same id", async done => {
      const serviceMingle = new OpenApiMingle(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      serviceMingle.setLicense("license", "http://license", "http://terms");

      const services: ServiceList = {
        users: {
          schemaUrl: "file://test/unit/openapi-mingle/samples/sample1.json",
          publicPrefix: "/users/",
          privatePrefix: "/public/",
          type: "consul"
        },

        duplicateUsers: {
          schemaUrl: "file://test/unit/openapi-mingle/samples/sample1.json",
          publicPrefix: "/usersDuplicate/",
          privatePrefix: "/public/",
          type: "consul"
        }
      };

      serviceMingle.setServers([
        { url: "https://explorer-eu.awesome-api.com" },
        { url: "https://explorer-us.awesome-api.com" }
      ]);

      try {
        await serviceMingle.combineServices(services);

        fail("Should have thrown exception");
      } catch (e) {
        expect(e.message).toBe(
          "Operations must have unique operationIds, id 'id' already exists."
        );
      }

      done();
    });

    test("Should throw because path parameter not declared", async done => {
      const serviceMingle = new OpenApiMingle(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      const services: ServiceList = {
        users: {
          schemaUrl:
            "file://test/unit/openapi-mingle/samples/sample1-error.json",
          publicPrefix: "/users/",
          privatePrefix: "/public/",
          type: "consul"
        }
      };

      serviceMingle.setServers([
        { url: "https://explorer-eu.awesome-api.com" },
        { url: "https://explorer-us.awesome-api.com" }
      ]);

      try {
        await serviceMingle.combineServices(services);

        fail("Expected to throw");
      } catch (e) {
        expect(e.message).toBe(
          "Parameters in path must be declared, missing userId"
        );
      }

      done();
    });

    test("Should throw if combineServices was never called", async () => {
      const serviceMingle = new OpenApiMingle(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      try {
        expect(serviceMingle.generateJson()).toMatchSnapshot();
        fail("Expected to throw exception");
      } catch (e) {
        expect(e.message).toBe(
          "JSON schema is not yet generated, you need to call combineServices at least once."
        );
      }
    });
  });
});
