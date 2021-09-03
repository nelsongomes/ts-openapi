import axios from "axios";
import {
  OpenApiMingle,
  ServiceList
} from "../../../src/openapi/openapi-mingle";
import { OpenApiSchema } from "../../../src/openapi/openapi.types";
import data from "./samples/sample1.json";

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
        { url: "https://explorer-eu.awesome-api.com" },
        { url: "https://explorer-us.awesome-api.com" }
      ]);

      serviceMingle.setLicense("license", "http://license", "http://terms");

      expect(serviceMingle instanceof OpenApiMingle).toBe(true);

      done();
    });
  });

  describe("Mingle services", () => {
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

    test.only("Simple service remap from private path /public/:userId to public /users/{userId}, skipping other methods, from http", async done => {
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

      jest
        .spyOn(axios, "get")
        .mockImplementation(() => Promise.resolve({ data, status: 200 }));

      await serviceMingle.combineServices(services);

      const json = serviceMingle.generateJson() as OpenApiSchema;

      expect(serviceMingle instanceof OpenApiMingle).toBe(true);

      expect(Object.getOwnPropertyNames(json.paths).length).toBe(1);
      expect(Object.getOwnPropertyNames(json.paths)[0]).toBe("/users/{userId}");

      expect(json).toMatchSnapshot();

      done();
    });

    test("Simple service remap from private path /public/:userId to public /users/{userId}, skipping other methods, from https", async done => {
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

    test.skip("simple service remap from private path /public/:userId to public /users/{userId}, skipping other methods", async done => {
      const serviceMingle = new OpenApiMingle(
        "1.0.0",
        "Server API",
        "Some test api",
        "nelson.ricardo.gomes@gmail.com"
      );

      const services: ServiceList = {
        /*products: {
          schemaUrl:
            "https://raw.githubusercontent.com/nelsongomes/ts-openapi/main/package.json",
          publicPrefix: "/products/",
          privatePrefix: "/",
          type: "static",
        },*/
        users: {
          schemaUrl: "file://test/unit/openapi-mingle/samples/sample1.json",
          publicPrefix: "/users/",
          privatePrefix: "/public/",
          type: "consul"
        }
        /*emails: {
          schemaUrl: "http://12.12.12.12:33233/api-schema.json",
          publicPrefix: "/emails/",
          privatePrefix: "/api/",
          type: "consul",
        },*/
      };

      serviceMingle.setServers([
        { url: "https://explorer-eu.awesome-api.com" },
        { url: "https://explorer-us.awesome-api.com" }
      ]);

      // read and map all services
      await serviceMingle.combineServices(services);

      const json = serviceMingle.generateJson() as any;

      expect(serviceMingle instanceof OpenApiMingle).toBe(true);

      expect(Object.getOwnPropertyNames(json.paths).length).toBe(1);
      expect(Object.getOwnPropertyNames(json.paths)[0]).toBe("/users/{userId}");

      expect(json).toMatchSnapshot();

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
