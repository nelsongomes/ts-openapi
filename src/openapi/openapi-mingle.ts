import axios from "axios";
import * as fs from "fs";
import { OpenApi } from "..";
import {
  OpenApiSchema,
  Path,
  Paths,
  SecurityScheme,
  Servers
} from "./openapi.types";

export type Service = {
  schemaUrl: string;
  publicPrefix: string;
  privatePrefix: string;
  type: string;
};

export type ServiceList = {
  [serviceName: string]: Service;
};

export class OpenApiMingle {
  private openApi: OpenApi;
  private json: object | undefined;
  private declaredPaths: string[] = [];
  private logFn: ((message: string, e?: Error) => void) | undefined;

  constructor(
    version: string,
    title: string,
    description: string,
    email: string,
    logFn?: (message: string, e?: Error) => void
  ) {
    this.openApi = new OpenApi(version, title, description, email);
    this.logFn = logFn;
  }

  public setServers(servers: Servers) {
    this.openApi.setServers(servers);
  }

  public setLicense(name: string, url: string, termsOfService: string) {
    this.openApi.setLicense(name, url, termsOfService);
  }

  public declareSecurityScheme(name: string, scheme: SecurityScheme) {
    this.openApi.declareSecurityScheme(name, scheme);
  }

  public addGlobalSecurityScheme(name: string, scopes?: string[] | undefined) {
    this.openApi.addGlobalSecurityScheme(name, scopes);
  }

  public generateJson() {
    if (!this.json) {
      throw new Error(
        "JSON schema is not yet generated, you need to call combineServices at least once."
      );
    }

    this.log("Successfully generated mingled schema.");
    return this.json;
  }

  private log(message: string, e?: Error) {
    if (this.logFn) {
      this.logFn(message, e);
    }
  }

  public async combineServices(serviceList: ServiceList) {
    const serviceNames = Object.getOwnPropertyNames(serviceList);

    this.log(`***** Started at ${new Date().toISOString()}' *****`);
    for (const serviceName of serviceNames) {
      const serviceDefinition = serviceList[serviceName];

      // try to read service definition
      const openApiDefinition = await this.readDefinition(
        serviceName,
        serviceDefinition
      );

      if (openApiDefinition) {
        this.checkOpenApiVersion(openApiDefinition.openapi);

        // filter paths
        const filteredPaths = this.filterPaths(
          openApiDefinition.paths,
          serviceDefinition
        );

        // copy referenced #/components/parameters/*
        // copy referenced #/components/schemas/*

        const paths = Object.getOwnPropertyNames(filteredPaths);
        paths.forEach((path: string) => {
          this.log(`\tAdding ${path}`);

          if (this.declaredPaths.includes(path)) {
            throw new Error(`Path ${path} was already declared.`);
          }

          this.openApi.addPath(path, filteredPaths[path], true);
          this.declaredPaths.push(path);
        });
      }
    }

    this.log(`***** Ended at ${new Date().toISOString()}' *****`);

    this.json = this.openApi.generateJson();
  }

  // openapi 3.1 changes:
  // https://apisyouwonthate.com/blog/openapi-v31-and-json-schema
  // https://blog.stoplight.io/difference-between-open-v2-v3-v31
  private checkOpenApiVersion(version: string) {
    if (!version.startsWith("3.0.")) {
      throw new Error(`We only support OpenApi version 3.0.x, not ${version}`);
    }
  }

  private filterPaths(implementedPaths: Paths, serviceDefinition: Service) {
    // clone paths
    const output: Paths = {};

    const pathsNames = Object.getOwnPropertyNames(implementedPaths);
    pathsNames.forEach((pathString: string) => {
      // clone methods
      const pathDefinition: Path = implementedPaths[pathString];
      const methods = Object.getOwnPropertyNames(pathDefinition)
        .sort()
        .join(",")
        .toUpperCase();

      if (pathString.startsWith(serviceDefinition.privatePrefix)) {
        const newPath = `${
          serviceDefinition.publicPrefix
        }${pathString.substring(serviceDefinition.privatePrefix.length)}`;

        output[newPath] = pathDefinition;

        this.log(`\tRemapping ${methods} from [${pathString}] to [${newPath}]`);
      } else {
        this.log(
          `\tSkipping ${methods} [${pathString}] because it's outside private path [${serviceDefinition.privatePrefix}*]`
        );
      }
    });

    return output;
  }

  /**
   * Reads a service definition from an uri
   */
  public async readDefinition(serviceName: string, service: Service) {
    const { schemaUrl } = service;

    this.log(`Retrieving service '${serviceName}' from uri ${schemaUrl}`);

    return this.readJsonUrl(schemaUrl);
  }

  /**
   * Read a resource uri, from a file or an uri
   */
  private async readJsonUrl(uri: string): Promise<OpenApiSchema | undefined> {
    if (uri.startsWith("file://")) {
      return JSON.parse(fs.readFileSync(uri.substr(7), "utf8"));
    }

    return this.readRemoteUri(uri);
  }

  /**
   * This method tries to read a remote json file
   */
  private async readRemoteUri(url: string): Promise<OpenApiSchema> {
    const result = await axios.get<OpenApiSchema>(url, {});

    return result.data;
  }
}
