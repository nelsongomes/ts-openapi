import { Schema } from "joi";
import { ApplicationError } from "../errors/application-error";
import joiToSwagger, { SwaggerSchema } from "../joi-conversion";
import {
  bodyParams,
  limitations,
  stringSchema,
  numberSchema,
  integerSchema,
  booleanSchema,
  arraySchema,
} from "./openapi-functions";
import { validateParameters } from "./openapi-validation";
import {
  OpenApiSchema,
  Parameter,
  ParameterIn,
  Parameters,
  PathInputDefinition,
  Body,
  Servers,
  SecurityScheme,
  WebRequestSchema,
  PathInput,
  PathDefinition,
} from "./openapi.types";

const REQUIRED_TYPES = [ParameterIn.Path];

export class OpenApi {
  private schema: OpenApiSchema;
  private operationIds: string[] = [];
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
          email,
        },
        description,
        license: {
          name: "Apache 2.0",
          url: "http://www.apache.org/licenses/LICENSE-2.0.html",
        },
        termsOfService: "http://swagger.io/terms/",
        title,
        version,
      },
      openapi: "3.0.1",
      paths: {},
      servers: [],
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
  private replaceParameters(apiPath: string): string {
    let newPath = apiPath;
    const paramsRegex = apiPath.match(/:([A-Za-z0-9_]+)/g);

    if (paramsRegex) {
      for (const param of paramsRegex) {
        newPath = newPath.replace(param, `{${param.substring(1)}}`);
      }
    }
    return newPath;
  }

  public addPath(path: string, inputDefinition: PathInput, visible: boolean) {
    if (!visible) {
      return;
    }

    path = this.replaceParameters(path);

    const pathDefinition =
      (inputDefinition.get as PathInputDefinition) ||
      (inputDefinition.post as PathInputDefinition) ||
      (inputDefinition.put as PathInputDefinition) ||
      (inputDefinition.delete as PathInputDefinition);

    const method = Object.getOwnPropertyNames(inputDefinition)[0];

    const operationId = pathDefinition.operationId;
    const responses = pathDefinition.responses;

    const { validationSchema, ...remainder } = pathDefinition;
    const { parameters, requestBody } = this.parametersAndBodyFromSchema(
      pathDefinition.validationSchema || {}
    );

    let definition: PathDefinition = {
      ...remainder,
      ...(parameters && { parameters }),
      ...(requestBody && { requestBody }),
    };

    if (inputDefinition.get && definition.requestBody) {
      throw new Error("GET operations cannot have a requestBody.");
    }

    if (Object.getOwnPropertyNames(responses).length === 0) {
      throw new Error("Should define at least one response.");
    }

    if (pathDefinition.security) {
      // TODO verify security scheme exists
      pathDefinition.security.forEach((securityScheme) => {
        const securitySchemeName = Object.getOwnPropertyNames(
          securityScheme
        )[0];

        if (!this.securitySchemeIds.includes(securitySchemeName)) {
          throw new Error(`Unknown security scheme '${securitySchemeName}'`);
        }
      });
    }

    if (!operationId) {
      throw new Error("No operationId supplied.");
    }

    if (this.operationIds.includes(operationId)) {
      throw new Error("Operations must have unique operationIds.");
    }

    this.operationIds.push(operationId);
    this.schema.paths[path] = { [method]: definition };
  }

  public setLicense(name: string, url: string, termsOfService: string) {
    this.schema.info.license.name = name;
    this.schema.info.license.url = url;
    this.schema.info.termsOfService = termsOfService;
  }

  private parametersAndBodyFromSchema(
    validationSchema: WebRequestSchema
  ): { parameters: Parameters | undefined; requestBody: Body | undefined } {
    let parameters: Parameters = [];
    let requestBody: Body | undefined;

    if (validationSchema.query) {
      // get parameters
      this.genericParams(parameters, validationSchema.query, ParameterIn.Query);
    }

    if (validationSchema.params) {
      // uri params
      this.genericParams(parameters, validationSchema.params, ParameterIn.Path);
    }

    if (validationSchema.cookie) {
      // cookie params
      this.genericParams(
        parameters,
        validationSchema.cookie,
        ParameterIn.Cookie
      );
    }

    if (validationSchema.headers) {
      // header params
      this.genericParams(
        parameters,
        validationSchema.headers,
        ParameterIn.Header
      );
    }

    if (validationSchema.body) {
      // request body
      requestBody = bodyParams(validationSchema.body);
    }

    return {
      parameters: parameters.length > 0 ? parameters : undefined,
      requestBody,
    };
  }

  private genericParams(
    parameters: Parameters,
    schema: Schema,
    type: ParameterIn
  ) {
    if (type === ParameterIn.Body) {
      throw new Error("Body content must declared with function bodyParams.");
    }

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
          parameters.push(
            this.stringParameter(key, parameter, isParameterRequired, type)
          );
          break;
        case "number":
        case "integer":
          if (parameter.format && parameter.format === "float") {
            parameters.push(
              this.numberParameter(key, parameter, isParameterRequired, type)
            );
          } else {
            parameters.push(
              this.integerParameter(key, parameter, isParameterRequired, type)
            );
          }
          break;
        case "boolean":
          parameters.push(
            this.booleanParameter(key, parameter, isParameterRequired, type)
          );
          break;
        case "array":
          parameters.push(
            this.arrayParameter(key, parameter, isParameterRequired, type)
          );
          break;
        default:
          throw new Error(`Unknown type '${parameter.type}' in openapi`);
      }
    }
  }

  private isRequiredProperty(swagger: SwaggerSchema, key: string) {
    return swagger.required && swagger.required.includes(key);
  }

  public generateJson(): {} {
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
  ): Parameter {
    const limitationDetail = limitations(parameter);
    const p: Parameter = {
      description:
        (parameter.description || "Parameter without description.") +
        (limitationDetail || ""),
      in: type,
      name,
      required: isRequiredParameter(required, type),
      schema: stringSchema(parameter),
      ...(parameter.example && { example: parameter.example }),
    };

    return p;
  }

  private numberParameter(
    name: string,
    parameter: any,
    required: boolean,
    type: ParameterIn
  ): Parameter {
    const limitationDetail = limitations(parameter);

    const p: Parameter = {
      description:
        (parameter.description || "Parameter without description.") +
        (limitationDetail || ""),
      in: type,
      name,
      required: isRequiredParameter(required, type),
      schema: numberSchema(parameter),
      ...(parameter.example && { example: parameter.example }),
    };

    return p;
  }

  private integerParameter(
    name: string,
    parameter: any,
    required: boolean,
    type: ParameterIn
  ): Parameter {
    const limitationDetail = limitations(parameter);

    const p: Parameter = {
      description:
        (parameter.description || "Parameter without description.") +
        (limitationDetail || ""),
      in: type,
      name,
      required: isRequiredParameter(required, type),
      schema: integerSchema(parameter),
      ...(parameter.example && { example: parameter.example }),
    };

    return p;
  }

  private booleanParameter(
    name: string,
    parameter: any,
    required: boolean,
    type: ParameterIn
  ): Parameter {
    const limitationDetail = limitations(parameter);

    const p: Parameter = {
      description:
        (parameter.description || "Parameter without description.") +
        (limitationDetail || ""),
      in: type,
      name,
      required: isRequiredParameter(required, type),
      schema: booleanSchema(parameter),
      ...(typeof parameter.example === "boolean" && {
        example: parameter.example,
      }),
    };

    return p;
  }

  private arrayParameter(
    name: string,
    parameter: any,
    required: boolean,
    type: ParameterIn
  ): Parameter {
    const limitationDetail = limitations(parameter);
    const schema = arraySchema(parameter);

    const p: Parameter = {
      description:
        (parameter.description || "Parameter without description.") +
        (limitationDetail || ""),
      in: type,
      name,
      required: isRequiredParameter(required, type),
      schema,
      ...(parameter.example && { example: parameter.example }),
    };

    return p;
  }
}

// all required parameters or path parameters are parameters are required
function isRequiredParameter(required: boolean, type: ParameterIn) {
  return required || REQUIRED_TYPES.includes(type);
}
