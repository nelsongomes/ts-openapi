import Joi, { Schema } from "joi";
import { ApplicationError } from "../errors/application-error";
import joiToSwagger, { SwaggerSchema } from "../joi-conversion";
import {
  bodyParams,
  limitations,
  stringSchema,
  numberSchema,
  integerSchema,
  booleanSchema,
  arraySchema
} from "./openapi-functions";
import { validateParameters } from "./openapi-validation";
import {
  OpenApiSchema,
  ParameterIn,
  Parameters,
  PathInputDefinition,
  Body,
  Servers,
  SecurityScheme,
  WebRequestSchema,
  PathInput,
  PathDefinition,
  Scheme,
  FlowCommon,
  SecuritySchemeArray,
  ReferencedParameter,
  TypedParameter
} from "./openapi.types";
// tslint:disable:no-var-requires
const hasher = require("node-object-hash")();
// tslint:enable:no-var-requires

const REQUIRED_TYPES = [ParameterIn.Path];

export class OpenApi {
  private schema: OpenApiSchema;
  private operationIds: string[] = [];
  private declaredParameters: Map<string, string> = new Map<string, string>();
  private securitySchemeIds: string[] = [];

  constructor(
    version: string,
    title: string,
    description: string,
    email: string
  ) {
    this.schema = {
      info: {
        contact: {
          email
        },
        description,
        license: {
          name: "Apache 2.0",
          url: "http://www.apache.org/licenses/LICENSE-2.0.html"
        },
        termsOfService: "http://swagger.io/terms/",
        title,
        version
      },
      openapi: "3.0.1",
      paths: {},
      servers: []
    };
  }

  public setServers(servers: Servers) {
    this.schema.servers = servers;
  }

  public declareSecurityScheme(name: string, scheme: SecurityScheme) {
    if (this.securitySchemeIds.includes(name)) {
      throw new Error("Security scheme name already exists.");
    }

    if (!this.schema.components || !this.schema.components.securitySchemes) {
      this.schema.components = {};
      this.schema.components.securitySchemes = {};
    }

    // add new securityScheme by name
    this.schema.components.securitySchemes[name] = scheme;

    // add new id
    this.securitySchemeIds.push(name);
  }

  public addGlobalSecurityScheme(name: string, scopes?: string[]) {
    if (!this.securitySchemeIds.includes(name)) {
      throw new Error(`Unknown security scheme '${name}'`);
    }

    if (!this.schema.security) {
      this.schema.security = [];
    }

    this.schema.security.push({ [name]: scopes || [] });
    this.securitySchemeIds.push(name);
  }

  /**
   * this replaces path parameters from express to openapi format
   * @param apiPath
   */
  private replaceParameters(apiPath: string) {
    let newPath = apiPath;
    const paramsRegex = apiPath.match(/:([A-Za-z0-9_]+)/g);
    const checkParams = [];

    if (paramsRegex) {
      for (const param of paramsRegex) {
        newPath = newPath.replace(param, `{${param.substring(1)}}`);
        checkParams.push(param.substring(1));
      }
    }
    return { newPath, checkParams };
  }

  public addPath(path: string, inputDefinition: PathInput, visible: boolean) {
    if (!visible) {
      return;
    }

    const { newPath, checkParams } = this.replaceParameters(path);
    path = newPath;

    const methods: [string, PathInputDefinition][] = [];
    Object.getOwnPropertyNames(inputDefinition).forEach((method: string) => {
      methods.push([
        method,
        (inputDefinition as any)[method] as PathInputDefinition
      ]);
    });

    for (const [method, pathDefinition] of methods) {
      const operationId = pathDefinition.operationId;
      const responses = pathDefinition.responses;

      const { requestSchema, ...remainder } = pathDefinition;
      const { parameters, requestBody } = this.parametersAndBodyFromSchema(
        pathDefinition.requestSchema || {}
      );

      const definition: PathDefinition = {
        ...remainder,
        ...(parameters && { parameters }),
        ...(requestBody && { requestBody })
      };

      this.checkParameters(checkParams, definition);

      if (method === "get" && definition.requestBody) {
        throw new Error("GET operations cannot have a requestBody.");
      }

      if (Object.getOwnPropertyNames(responses).length === 0) {
        throw new Error("Should define at least one response.");
      }

      if (pathDefinition.security) {
        this.checkSecurityDefinition(pathDefinition.security);
      }

      if (!operationId) {
        throw new Error("No operationId supplied.");
      }

      if (this.operationIds.includes(operationId)) {
        throw new Error(
          `Operations must have unique operationIds, id '${operationId}' already exists.`
        );
      }

      this.operationIds.push(operationId);
      if (this.schema.paths[path]) {
        // add a secondary method on path
        this.schema.paths[path] = {
          [method]: definition,
          ...this.schema.paths[path]
        };
      } else {
        // add first method in this path
        this.schema.paths[path] = { [method]: definition };
      }
    }
  }

  private checkSecurityDefinition(security: SecuritySchemeArray) {
    security.forEach((securityScheme: Scheme) => {
      const securitySchemeName = Object.getOwnPropertyNames(securityScheme)[0];

      if (!this.securitySchemeIds.includes(securitySchemeName)) {
        throw new Error(`Unknown security scheme '${securitySchemeName}'`);
      }

      // check security scheme scopes exist
      const scopes = securityScheme[securitySchemeName];
      const schemeDefinition: SecurityScheme = this.schema.components!
        .securitySchemes![securitySchemeName];

      if (scopes.length) {
        if (schemeDefinition.type !== "oauth2") {
          throw new Error(
            `Security scheme '${securitySchemeName}' does not have scopes`
          );
        }

        scopes.forEach(scope => {
          const flowName = Object.getOwnPropertyNames(
            schemeDefinition.flows
          )[0];

          if (
            ![
              "authorizationCode",
              "implicit",
              "password",
              "clientCredentials"
            ].includes(flowName)
          ) {
            throw new Error(
              `${flowName} is not a valid flow for ${securitySchemeName}`
            );
          }

          const flow = (schemeDefinition.flows as any)[flowName] as FlowCommon;
          const scopeNames = Object.getOwnPropertyNames(flow.scopes);

          if (!scopeNames.includes(scope)) {
            throw new Error(
              `Security scope '${scope}' does not have exist in ${securitySchemeName} flow '${flowName}' declaration.`
            );
          }
        });
      }
    });
  }

  private checkParameters(checkParams: string[], definition: PathDefinition) {
    if (checkParams.length) {
      if (!definition.parameters?.length) {
        throw new Error("Parameters in path must be declared");
      }

      checkParams.forEach(paramCheck => {
        let found = false;

        definition.parameters?.forEach((detectedParam: any) => {
          if (
            detectedParam.$ref &&
            detectedParam.$ref.startsWith("#/components/parameters/") &&
            this.schema.components &&
            this.schema.components.parameters
          ) {
            // fetch declaration for check
            detectedParam = this.schema.components.parameters[
              detectedParam.$ref.substring(24)
            ] as any;
          }

          if (
            detectedParam.in === ParameterIn.Path &&
            detectedParam.name === paramCheck
          ) {
            found = true;
          }
        });

        if (!found) {
          throw new Error(
            `Parameters in path must be declared, missing ${paramCheck}`
          );
        }
      });
    }
  }

  public setLicense(name: string, url: string, termsOfService: string) {
    this.schema.info.license.name = name;
    this.schema.info.license.url = url;
    this.schema.info.termsOfService = termsOfService;
  }

  private parametersAndBodyFromSchema(
    requestSchema: WebRequestSchema
  ): { parameters: Parameters | undefined; requestBody: Body | undefined } {
    const parameters: Parameters = [];
    let requestBody: Body | undefined;

    if (requestSchema.query) {
      // get parameters
      this.genericParams(
        parameters,
        Joi.object().keys(requestSchema.query),
        ParameterIn.Query
      );
    }

    if (requestSchema.params) {
      // uri params
      this.genericParams(
        parameters,
        Joi.object(requestSchema.params),
        ParameterIn.Path
      );
    }

    if (requestSchema.cookie) {
      // cookie params
      this.genericParams(
        parameters,
        Joi.object(requestSchema.cookie),
        ParameterIn.Cookie
      );
    }

    if (requestSchema.headers) {
      // header params
      this.genericParams(
        parameters,
        Joi.object(requestSchema.headers),
        ParameterIn.Header
      );
    }

    if (requestSchema.body) {
      // request body
      requestBody = bodyParams(requestSchema.body);
    }

    return {
      parameters: parameters.length > 0 ? parameters : undefined,
      requestBody
    };
  }

  private genericParams(
    parameters: Parameters,
    schema: Schema,
    type: ParameterIn
  ) {
    const query = joiToSwagger(schema, {});

    for (const key of Object.keys(query.swagger.properties)) {
      const parameter = query.swagger.properties[key];
      const isParameterRequired = this.isRequiredProperty(query.swagger, key);

      // specific parameter context validation
      validateParameters(
        type,
        parameter,
        key,
        parameter.type,
        isParameterRequired
      );

      switch (parameter.type) {
        case "string":
          {
            const preparedParameter = this.stringParameter(
              key,
              parameter,
              isParameterRequired,
              type
            );

            this.declareParameter(
              parameter,
              parameters,
              key,
              preparedParameter
            );
          }
          break;
        case "number":
        case "integer":
          if (parameter.format && parameter.format === "float") {
            const preparedParameter = this.numberParameter(
              key,
              parameter,
              isParameterRequired,
              type
            );

            this.declareParameter(
              parameter,
              parameters,
              key,
              preparedParameter
            );
          } else {
            const preparedParameter = this.integerParameter(
              key,
              parameter,
              isParameterRequired,
              type
            );
            this.declareParameter(
              parameter,
              parameters,
              key,
              preparedParameter
            );
          }
          break;
        case "boolean":
          {
            const preparedParameter = this.booleanParameter(
              key,
              parameter,
              isParameterRequired,
              type
            );
            this.declareParameter(
              parameter,
              parameters,
              key,
              preparedParameter
            );
          }
          break;
        case "array":
          {
            const preparedParameter = this.arrayParameter(
              key,
              parameter,
              isParameterRequired,
              type
            );
            this.declareParameter(
              parameter,
              parameters,
              key,
              preparedParameter
            );
          }
          break;
        default:
          throw new Error(`Unknown type '${parameter.type}' in openapi`);
      }
    }
  }

  private declareParameter(
    parameter: any,
    parameters: Parameters,
    key: string,
    preparedParameter: TypedParameter
  ) {
    if (parameter.meta.parameter) {
      const reference = `#/components/parameters/${key}`;
      const parameterHash = hasher.hash(preparedParameter);

      if (!this.declaredParameters.get(key)) {
        // new parameter
        this.declaredParameters.set(key, parameterHash);

        // store declared component
        if (!this.schema.components) {
          this.schema.components = {};
        }

        if (!this.schema.components.parameters) {
          this.schema.components.parameters = {
            [key]: preparedParameter
          };
        }

        this.schema.components.parameters[key] = preparedParameter;
      } else {
        // check if parameter is different
        if (parameterHash !== this.declaredParameters.get(key)) {
          throw new Error(
            `There is a conflicting declaration of ${key} parameter, the parameter cannot change.`
          );
        }
      }

      parameters.push(this.referencedParameter(reference));
    } else {
      parameters.push(preparedParameter);
    }
  }

  private isRequiredProperty(swagger: SwaggerSchema, key: string) {
    return swagger.required && swagger.required.includes(key);
  }

  public generateJson(): object {
    if (this.schema.servers.length === 0) {
      throw new ApplicationError(
        500,
        "No servers were added to OpenApi definition"
      );
    }

    if (Object.getOwnPropertyNames(this.schema.paths).length === 0) {
      throw new ApplicationError(
        500,
        "No paths were added to OpenApi definition."
      );
    }

    return this.schema;
  }

  private stringParameter(
    name: string,
    parameter: any,
    required: boolean,
    type: ParameterIn
  ): TypedParameter {
    const limitationDetail = limitations(parameter);
    const p: TypedParameter = {
      description:
        (parameter.description || "Parameter without description.") +
        (limitationDetail || ""),
      in: type,
      name,
      required: isRequiredParameter(required, type),
      schema: stringSchema(parameter),
      ...(parameter.example && { example: parameter.example })
    };

    return p;
  }

  private referencedParameter(reference: string): ReferencedParameter {
    return { $ref: reference };
  }

  private numberParameter(
    name: string,
    parameter: any,
    required: boolean,
    type: ParameterIn
  ): TypedParameter {
    const limitationDetail = limitations(parameter);

    const p: TypedParameter = {
      description:
        (parameter.description || "Parameter without description.") +
        (limitationDetail || ""),
      in: type,
      name,
      required: isRequiredParameter(required, type),
      schema: numberSchema(parameter),
      ...(parameter.example && { example: parameter.example })
    };

    return p;
  }

  private integerParameter(
    name: string,
    parameter: any,
    required: boolean,
    type: ParameterIn
  ): TypedParameter {
    const limitationDetail = limitations(parameter);

    const p: TypedParameter = {
      description:
        (parameter.description || "Parameter without description.") +
        (limitationDetail || ""),
      in: type,
      name,
      required: isRequiredParameter(required, type),
      schema: integerSchema(parameter),
      ...(parameter.example && { example: parameter.example })
    };

    return p;
  }

  private booleanParameter(
    name: string,
    parameter: any,
    required: boolean,
    type: ParameterIn
  ): TypedParameter {
    const limitationDetail = limitations(parameter);

    const p: TypedParameter = {
      description:
        (parameter.description || "Parameter without description.") +
        (limitationDetail || ""),
      in: type,
      name,
      required: isRequiredParameter(required, type),
      schema: booleanSchema(parameter),
      ...(typeof parameter.example === "boolean" && {
        example: parameter.example
      })
    };

    return p;
  }

  private arrayParameter(
    name: string,
    parameter: any,
    required: boolean,
    type: ParameterIn
  ): TypedParameter {
    const limitationDetail = limitations(parameter);
    const schema = arraySchema(parameter);

    const p: TypedParameter = {
      description:
        (parameter.description || "Parameter without description.") +
        (limitationDetail || ""),
      in: type,
      name,
      required: isRequiredParameter(required, type),
      schema,
      ...(parameter.example && { example: parameter.example })
    };

    return p;
  }
}

// all required parameters or path parameters are parameters are required
function isRequiredParameter(required: boolean, type: ParameterIn) {
  return required || REQUIRED_TYPES.includes(type);
}
