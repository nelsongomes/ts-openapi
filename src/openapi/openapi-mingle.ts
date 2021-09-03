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

  constructor(
    version: string,
    title: string,
    description: string,
    email: string
  ) {
    this.openApi = new OpenApi(version, title, description, email);
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

    return this.json;
  }

  private log(_message: string, e?: Error) {
    if (e) {
      // console.log(message, e);
    } else {
      // console.log(message);
    }
  }

  public async combineServices(serviceList: ServiceList) {
    const serviceNames = Object.getOwnPropertyNames(serviceList);

    for (const serviceName of serviceNames) {
      const serviceDefinition = serviceList[serviceName];

      // try to read service definition
      const openApiDefinition = await this.readDefinition(
        serviceName,
        serviceDefinition
      );

      if (openApiDefinition) {
        // validate openApiDefinition
        // check version
        // check paths

        // filter paths
        const filteredPaths = this.filterPaths(
          openApiDefinition.paths,
          serviceDefinition
        );

        Object.getOwnPropertyNames(filteredPaths).forEach(path => {
          this.openApi.addPath(path, filteredPaths[path], true);
        });
      }
    }

    this.json = this.openApi.generateJson();
  }

  private filterPaths(implementedPaths: Paths, serviceDefinition: Service) {
    // clone paths
    const output: Paths = {};

    const pathsNames = Object.getOwnPropertyNames(implementedPaths);
    pathsNames.forEach((pathString: string) => {
      // clone methods
      const pathDefinition: Path = implementedPaths[pathString];
      const methods = Object.getOwnPropertyNames(pathDefinition);

      if (pathString.startsWith(serviceDefinition.privatePrefix)) {
        const newPath = `${
          serviceDefinition.publicPrefix
        }${pathString.substring(serviceDefinition.privatePrefix.length)}`;

        output[newPath] = pathDefinition;

        methods.forEach((method: string) => {
          this.log(
            `Remapping ${method.toUpperCase()} from ${pathString} to ${newPath}`
          );
        });
      } else {
        methods.forEach((method: string) => {
          this.log(
            `Skipping ${method.toUpperCase()} ${pathString} because it's outside private path ${
              serviceDefinition.privatePrefix
            }*`
          );
        });
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

    const serviceDefinition = await this.readJsonUrl(schemaUrl);

    if (serviceDefinition) {
      this.log(JSON.stringify(serviceDefinition));
    }

    return serviceDefinition;
  }

  /**
   * Read a resource uri, from a file or an uri
   */
  private async readJsonUrl(uri: string): Promise<OpenApiSchema | undefined> {
    try {
      if (uri.startsWith("file://")) {
        return JSON.parse(fs.readFileSync(uri.substr(7), "utf8"));
      }
    } catch (e) {
      this.log(`Failed to read uri ${uri} from local file ${uri.substr(7)}`, e);
    }

    // try to read schema from remote uri
    try {
      return this.readRemoteUri(uri);
    } catch (e) {
      this.log(`Failed to read uri ${uri} from remote address ${uri}`, e);
    }
    return;
  }

  /**
   * This method tries to read a remote json file
   */
  private async readRemoteUri(url: string): Promise<OpenApiSchema> {
    const result = await axios.get<OpenApiSchema>(url, {});

    if (result.status >= 200 && result.status < 300) {
      return result.data;
    }

    throw new Error("bad request");
  }
}
