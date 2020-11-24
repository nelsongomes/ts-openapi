import { ParameterIn } from "./openapi.types";

export function validateParameters(
  type: ParameterIn,
  parameter: any,
  name: string,
  parameterType: string,
  isParameterRequired: boolean
) {
  switch (type) {
    case ParameterIn.Path:
      validatePathParameters(name, parameterType, isParameterRequired);
      break;
    case ParameterIn.Query:
      validateQueryParameters(
        parameter,
        name,
        parameterType,
        isParameterRequired
      );
      break;
    case ParameterIn.Cookie:
      validateCookieParameters(name, parameterType);
      break;
  }
}

function validatePathParameters(
  key: string,
  parameterType: string,
  isParameterRequired: boolean
) {
  const nameMatch = key.match(/[A-Za-z0-9_]+/);

  if (nameMatch && nameMatch[0] !== key) {
    throw new Error(`Path param '${key}' name does not match [A-Za-z0-9_]`);
  }

  if (["object", "array"].includes(parameterType)) {
    throw new Error(`Path param '${key}' cannot be an object or an array.`);
  }

  if (!isParameterRequired) {
    throw new Error(
      `Path param '${key}' must be required because it is a path parameter.`
    );
  }
}

function validateQueryParameters(
  parameter: any,
  key: string,
  parameterType: string,
  _isParameterRequired: boolean
) {
  const nameMatch = key.match(/[A-Za-z0-9_]+/);

  if (["object"].includes(parameterType)) {
    throw new Error(`Query param '${key}' cannot be an object.`);
  }

  if (["array"].includes(parameterType) && parameter.items.properties) {
    const arrayProperties = parameter.items.properties;

    for (const propKey of Object.keys(arrayProperties)) {
      const property = arrayProperties[propKey];

      if (property.type === "array") {
        throw new Error(
          `Query param '${key}' type array can only have scalar types inside of it (cannot be an array of arrays or an array of objects).`
        );
      }
    }
  }
}

function validateCookieParameters(key: string, parameterType: string) {
  if (["object", "array"].includes(parameterType)) {
    throw new Error(`Cookie param '${key}' cannot be an object or an array.`);
  }
}
