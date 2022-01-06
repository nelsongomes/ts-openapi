import axios from "axios";
import * as fs from "fs";
import * as _ from "lodash";
import { OpenApi } from "..";
import {
  Method,
  OpenApiSchema,
  Path,
  PathDefinition,
  Paths,
  ReferencedParameter,
  SchemaTypeObject,
  SecurityScheme,
  Servers,
  TypedParameter
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

function getPropertyValues(object: any, prop: string): string[] {
  return _.reduce(
    object,
    (result: string[], value: string, key: string): string[] => {
      if (key === prop) {
        result.push(value);
      } else if (_.isObjectLike(value)) {
        return result.concat(getPropertyValues(value, prop) as string[]);
      }

      return result;
    },
    []
  );
}

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

        const paths = Object.getOwnPropertyNames(filteredPaths);
        paths.forEach((path: string) => {
          this.log(`\tAdding ${path}`);

          if (this.declaredPaths.includes(path)) {
            throw new Error(`Path ${path} was already declared.`);
          }

          const addedPath = filteredPaths[path];

          // copy referenced schemas from #/components/schemas/*
          this.copyReferenceSchemas(path, addedPath, openApiDefinition);

          // copy referenced parameters #/components/parameters/*
          this.copyReferencedParameters(path, addedPath, openApiDefinition);

          this.openApi.addPath(path, addedPath, true);
          this.declaredPaths.push(path);
        });
      }
    }

    this.log(`***** Ended at ${new Date().toISOString()}' *****`);

    this.json = this.openApi.generateJson();
  }

  private copyReferenceSchemas(
    path: string,
    addedPath: Path,
    openApiDefinition: OpenApiSchema
  ) {
    for (const verb of Object.getOwnPropertyNames(addedPath)) {
      const verbInfo: PathDefinition = addedPath[verb as Method] as any;
      const responseIsJson = verbInfo.requestBody?.content["application/json"];

      // copy body schemas
      if (responseIsJson) {
        this.checkSchema(path, verb, openApiDefinition, responseIsJson);
      }

      // copy referenced responses
      for (const responseCode of Object.getOwnPropertyNames(
        verbInfo.responses
      )) {
        const response = verbInfo.responses[Number(responseCode)];
        const responseCodeIsJson = response?.content["application/json"];

        this.checkSchema(
          path,
          `${verb} (${responseCode})`,
          openApiDefinition,
          responseCodeIsJson
        );
      }
    }
  }

  private checkSchema(
    path: string,
    verb: string,
    openApiDefinition: OpenApiSchema,
    jsonSchema: { schema?: SchemaTypeObject | undefined }
  ) {
    if (
      jsonSchema &&
      jsonSchema.schema &&
      (jsonSchema.schema.$ref ||
        (jsonSchema.schema.additionalProperties &&
          jsonSchema.schema.additionalProperties.$ref))
    ) {
      const ref = (jsonSchema.schema.$ref ||
        jsonSchema.schema.additionalProperties!.$ref)!;

      this.log(
        `\tChecking referenced schema ${ref} at ${verb.toUpperCase()} ${path}`
      );

      const preparedSchema = this.checkReference(ref, openApiDefinition);

      // check inner references
      const innerReferences = getPropertyValues(preparedSchema, "$ref");

      while (innerReferences.length) {
        const innerRef = innerReferences.pop()!;
        const innerSchema = this.checkReference(innerRef, openApiDefinition);
        const innerSchemaRefs = getPropertyValues(innerSchema, "$ref");

        if (innerSchemaRefs.length) {
          innerReferences.push(...innerSchemaRefs);
        }
      }
    }
  }

  private checkReference(ref: string, openApiDefinition: OpenApiSchema) {
    if (!ref.startsWith("#/components/schemas/")) {
      throw new Error(
        `Schema reference ${ref} does not start with #/components/schemas/`
      );
    }

    const key = ref.substring(21);
    const preparedSchema = openApiDefinition.components?.schemas![key] as any;

    if (!preparedSchema) {
      throw new Error(`Failed to find schema for key ${key}`);
    }

    this.openApi.checkAndSetSchema(key, preparedSchema);

    return preparedSchema;
  }

  private copyReferencedParameters(
    path: string,
    addedPath: Path,
    openApiDefinition: OpenApiSchema
  ) {
    for (const verb of Object.getOwnPropertyNames(addedPath)) {
      const verbInfo: PathDefinition = addedPath[verb as Method] as any;

      if (verbInfo.parameters) {
        for (const parameter of verbInfo.parameters) {
          const referencedParameter = parameter as ReferencedParameter;

          if (referencedParameter && referencedParameter.$ref) {
            this.log(
              `\tChecking referenced parameter ${
                referencedParameter.$ref
              } at ${verb.toUpperCase()} ${path}`
            );
            const key = referencedParameter.$ref.substring(24);

            if (
              !openApiDefinition.components ||
              !openApiDefinition.components.parameters ||
              !openApiDefinition.components.parameters[key]
            ) {
              throw new Error(
                `Couldn't find definition for parameter ${key} in #/components/parameters/${key} in path ${path}, verb ${verb}`
              );
            }

            const preparedParameter = openApiDefinition.components?.parameters[
              key
            ] as TypedParameter;

            this.openApi.checkAndSetParameter(key, preparedParameter);
          }
        }
      }
    }
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
