import axios from "axios";
import {
  OpenApiMingle,
  ServiceList,
} from "../../../src/openapi/openapi-mingle";
import { OpenApiSchema } from "../../../src/openapi/openapi.types";

import sample1Data from "./samples/sample1.json";
import openapiData from "./samples/openapi.json";
import { basicAuth, oauth2PasswordAuth } from "../../../src";
import editorSwaggerIoData from "./samples/editor.swagger.io.json";
import _ from "lodash";

// tslint:disable:no-console
function log(_message: string, _e?: Error) {
  /*if (e) {
    console.log(message, e);
  } else {
    console.log(message);
  }*/
}
// tslint:enable:no-console

describe("src/openapi/openapi-mingle", () => {
  describe("Constructor", () => {
    test("Create class", async () => {
      const serviceMingle = new OpenApiMingle(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      serviceMingle.setServers([
        {
          url: "https://explorer-eu.awesome-api.com",
          description: "EU Server",
        },
        {
          url: "https://explorer-us.awesome-api.com",
          description: "US Server",
        },
      ]);

      serviceMingle.setLicense("license", "http://license", "http://terms");

      expect(serviceMingle instanceof OpenApiMingle).toBe(true);
    });
  });

  describe("Mingle services", () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("Simple service remap from private path /public/:userId to public /users/{userId}, skipping other methods, from file", async () => {
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
          type: "consul",
        },
      };

      serviceMingle.setServers([
        { url: "https://explorer-eu.awesome-api.com" },
        { url: "https://explorer-us.awesome-api.com" },
      ]);

      serviceMingle.declareSecurityScheme("basicAuth", basicAuth());
      serviceMingle.addGlobalSecurityScheme("basicAuth");

      await serviceMingle.combineServices(services);

      const json = serviceMingle.generateJson() as OpenApiSchema;

      expect(serviceMingle instanceof OpenApiMingle).toBe(true);

      expect(Object.getOwnPropertyNames(json.paths).length).toBe(1);
      expect(Object.getOwnPropertyNames(json.paths)[0]).toBe("/users/{userId}");

      expect(json).toMatchSnapshot();
    });

    test("Simple service remap from private path /public/:userId to public /users/{userId}, skipping other methods, from remote", async () => {
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
          type: "consul",
        },
      };

      serviceMingle.setServers([
        { url: "https://explorer-eu.awesome-api.com" },
        { url: "https://explorer-us.awesome-api.com" },
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
    });

    test("Simple service remap from local file and remote uri", async () => {
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
          type: "consul",
        },
        demo: {
          schemaUrl: "https://generator3.swagger.io/openapi.json",
          publicPrefix: "/openapi/",
          privatePrefix: "/",
          type: "consul",
        },
      };

      serviceMingle.setServers([
        { url: "https://explorer-eu.awesome-api.com" },
        { url: "https://explorer-us.awesome-api.com" },
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
    });

    test("Should throw error because schema reference does not start with #/components/schemas/", async () => {
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
          type: "consul",
        },
        demo: {
          schemaUrl: "https://generator3.swagger.io/openapi.json",
          publicPrefix: "/openapi/",
          privatePrefix: "/",
          type: "consul",
        },
      };

      serviceMingle.setServers([
        { url: "https://explorer-eu.awesome-api.com" },
        { url: "https://explorer-us.awesome-api.com" },
      ]);

      // delete schema GenerationRequest
      const missingModelOpenapi = _.cloneDeep(openapiData);
      missingModelOpenapi.paths["/generate"].post.requestBody.content[
        "application/json"
      ].schema.$ref = "#/components/invalid/GenerationRequest";

      // mock axios get request
      jest
        .spyOn(axios, "get")
        .mockImplementation(() =>
          Promise.resolve({ data: missingModelOpenapi, status: 200 })
        );

      try {
        await serviceMingle.combineServices(services);

        fail("Should have thrown an exception");
      } catch (e) {
        expect((e as Error).message).toBe(
          "Schema reference #/components/invalid/GenerationRequest does not start with #/components/schemas/"
        );
      }
    });

    test("Should throw error because schema reference is missing", async () => {
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
          type: "consul",
        },
        demo: {
          schemaUrl: "https://generator3.swagger.io/openapi.json",
          publicPrefix: "/openapi/",
          privatePrefix: "/",
          type: "consul",
        },
      };

      serviceMingle.setServers([
        { url: "https://explorer-eu.awesome-api.com" },
        { url: "https://explorer-us.awesome-api.com" },
      ]);

      // delete schema GenerationRequest
      const missingModelOpenapi = _.cloneDeep(openapiData);
      delete (missingModelOpenapi.components.schemas as any).GenerationRequest;

      // mock axios get request
      jest
        .spyOn(axios, "get")
        .mockImplementation(() =>
          Promise.resolve({ data: missingModelOpenapi, status: 200 })
        );

      try {
        await serviceMingle.combineServices(services);

        fail("Should have thrown an exception");
      } catch (e) {
        expect((e as Error).message).toBe(
          "Failed to find schema for key GenerationRequest"
        );
      }
    });

    test("Should throw error because parameter reference does not start with #/components/parameters/", async () => {
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
          type: "consul",
        },
        demo: {
          schemaUrl: "https://generator3.swagger.io/openapi.json",
          publicPrefix: "/openapi/",
          privatePrefix: "/",
          type: "consul",
        },
      };

      serviceMingle.setServers([
        { url: "https://explorer-eu.awesome-api.com" },
        { url: "https://explorer-us.awesome-api.com" },
      ]);

      // delete schema GenerationRequest
      const missingModelOpenapi = _.cloneDeep(openapiData);
      missingModelOpenapi.paths["/clients"].get.parameters[0].$ref =
        "#/components/invalid/GenerationRequest";

      // mock axios get request
      jest
        .spyOn(axios, "get")
        .mockImplementation(() =>
          Promise.resolve({ data: missingModelOpenapi, status: 200 })
        );

      try {
        await serviceMingle.combineServices(services);

        fail("Should have thrown an exception");
      } catch (e) {
        expect((e as Error).message).toBe(
          "Parameter reference #/components/invalid/GenerationRequest does not start with #/components/parameters/"
        );
      }
    });

    test("Should throw error because parameter reference is missing", async () => {
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
          type: "consul",
        },
        demo: {
          schemaUrl: "https://generator3.swagger.io/openapi.json",
          publicPrefix: "/openapi/",
          privatePrefix: "/",
          type: "consul",
        },
      };

      serviceMingle.setServers([
        { url: "https://explorer-eu.awesome-api.com" },
        { url: "https://explorer-us.awesome-api.com" },
      ]);

      // delete schema GenerationRequest
      const missingModelOpenapi = _.cloneDeep(openapiData);
      delete (missingModelOpenapi as any).components.parameters.version;

      // mock axios get request
      jest
        .spyOn(axios, "get")
        .mockImplementation(() =>
          Promise.resolve({ data: missingModelOpenapi, status: 200 })
        );

      try {
        await serviceMingle.combineServices(services);

        fail("Should have thrown an exception");
      } catch (e) {
        expect((e as Error).message).toBe(
          "Couldn't find definition for parameter version in #/components/parameters/version in path /openapi/clients, verb get"
        );
      }
    });

    test("Should throw error because schema version is not 3.0.x", async () => {
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
          type: "consul",
        },
        demo: {
          schemaUrl: "https://generator3.swagger.io/openapi.json",
          publicPrefix: "/openapi/",
          privatePrefix: "/",
          type: "consul",
        },
      };

      serviceMingle.setServers([
        { url: "https://explorer-eu.awesome-api.com" },
        { url: "https://explorer-us.awesome-api.com" },
      ]);

      // delete schema GenerationRequest
      const missingModelOpenapi = _.cloneDeep(openapiData);
      missingModelOpenapi.openapi = "3.1.0";

      // mock axios get request
      jest
        .spyOn(axios, "get")
        .mockImplementation(() =>
          Promise.resolve({ data: missingModelOpenapi, status: 200 })
        );

      try {
        await serviceMingle.combineServices(services);

        fail("Should have thrown an exception");
      } catch (e) {
        expect((e as Error).message).toBe(
          "We only support OpenApi version 3.0.x, not 3.1.0"
        );
      }
    });

    test("Should check all scopes are valid", async () => {
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
          type: "consul",
        },
      };

      serviceMingle.setServers([
        { url: "https://explorer-eu.awesome-api.com" },
        { url: "https://explorer-us.awesome-api.com" },
      ]);

      serviceMingle.declareSecurityScheme(
        "petstore_auth",
        oauth2PasswordAuth("Oauth2 auth", "http://", {
          "read:pets": "test scope",
          "write:pets": "test scope",
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
    });

    test("Should throw error because security scheme scope is unknown", async () => {
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
          type: "consul",
        },
      };

      serviceMingle.setServers([
        { url: "https://explorer-eu.awesome-api.com" },
        { url: "https://explorer-us.awesome-api.com" },
      ]);

      serviceMingle.declareSecurityScheme(
        "petstore_auth",
        oauth2PasswordAuth("Oauth2 auth", "http://", {
          "scope:read": "test scope",
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
      } catch (e) {
        expect((e as Error).message).toBe(
          "Security scope 'write:pets' does not have exist in petstore_auth flow 'password' declaration."
        );
      }
    });

    test("Should throw error because same path was already declared", async () => {
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
          type: "consul",
        },
        users2: {
          schemaUrl: "https://editor.swagger.io/openapi.json",
          publicPrefix: "/users/",
          privatePrefix: "/",
          type: "consul",
        },
      };

      serviceMingle.setServers([
        { url: "https://explorer-eu.awesome-api.com" },
        { url: "https://explorer-us.awesome-api.com" },
      ]);

      serviceMingle.declareSecurityScheme(
        "petstore_auth",
        oauth2PasswordAuth("Oauth2 auth", "http://", {
          "read:pets": "test scope",
          "write:pets": "test scope",
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
      } catch (e) {
        expect((e as Error).message).toBe(
          "Path /users/pet was already declared."
        );
      }
    });

    test("Should throw error because security scheme named does not have scopes", async () => {
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
          type: "consul",
        },
      };

      serviceMingle.setServers([
        { url: "https://explorer-eu.awesome-api.com" },
        { url: "https://explorer-us.awesome-api.com" },
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
        expect((e as Error).message).toBe(
          "Security scheme 'petstore_auth' does not have scopes"
        );
      }
    });

    test("Should throw error because security scheme is unknown", async () => {
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
          type: "consul",
        },
      };

      serviceMingle.setServers([
        { url: "https://explorer-eu.awesome-api.com" },
        { url: "https://explorer-us.awesome-api.com" },
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
        expect((e as Error).message).toBe(
          "Unknown security scheme 'petstore_auth'"
        );
      }
    });

    test("Should throw because remote uri does not exist", async () => {
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
          type: "consul",
        },
      };

      serviceMingle.setServers([
        { url: "https://explorer-eu.awesome-api.com" },
        { url: "https://explorer-us.awesome-api.com" },
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
        expect((e as Error).message).toBe(
          "Request failed with status code 404"
        );
      }
    });

    test("Should throw because there are 2 operations with same id", async () => {
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
          type: "consul",
        },

        duplicateUsers: {
          schemaUrl: "file://test/unit/openapi-mingle/samples/sample1.json",
          publicPrefix: "/usersDuplicate/",
          privatePrefix: "/public/",
          type: "consul",
        },
      };

      serviceMingle.setServers([
        { url: "https://explorer-eu.awesome-api.com" },
        { url: "https://explorer-us.awesome-api.com" },
      ]);

      try {
        await serviceMingle.combineServices(services);

        fail("Should have thrown exception");
      } catch (e) {
        expect((e as Error).message).toBe(
          "Operations must have unique operationIds, id 'id' already exists."
        );
      }
    });

    test("Should throw because path parameter not declared", async () => {
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
          type: "consul",
        },
      };

      serviceMingle.setServers([
        { url: "https://explorer-eu.awesome-api.com" },
        { url: "https://explorer-us.awesome-api.com" },
      ]);

      try {
        await serviceMingle.combineServices(services);

        fail("Expected to throw");
      } catch (e) {
        expect((e as Error).message).toBe(
          "Parameters in path must be declared, missing userId"
        );
      }
    });

    test("Should throw if combineServices was never called", () => {
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
        expect((e as Error).message).toBe(
          "JSON schema is not yet generated, you need to call combineServices at least once."
        );
      }
    });
  });
});
