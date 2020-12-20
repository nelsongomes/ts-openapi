import {
  Body,
  SecurityApiKeyScheme,
  SecurityApiKeySchemeMethod,
  SecurityBasicScheme,
  SecurityBearerScheme,
} from "../openapi.types";

export function textPlain(description: string): Body {
  return {
    description,
    content: { "text-plain": {} },
  };
}

export function basicAuth(): SecurityBasicScheme {
  return {
    type: "http",
    scheme: "basic",
  };
}

export function apiKeyAuth(
  name: string,
  method: SecurityApiKeySchemeMethod
): SecurityApiKeyScheme {
  return {
    type: "apiKey",
    in: method,
    name,
  };
}

export function cookieAuth(cookieName: string): SecurityApiKeyScheme {
  return {
    type: "apiKey",
    in: "cookie",
    name: cookieName,
  };
}

export function bearerAuth(
  bearerFormat?: "JWT" | string
): SecurityBearerScheme {
  return {
    type: "http",
    scheme: "bearer",
    ...(bearerFormat && { bearerFormat }),
  };
}
