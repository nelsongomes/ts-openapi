import {
  SecurityApiKeyScheme,
  SecurityApiKeySchemeMethod,
  SecurityBasicScheme,
  SecurityBearerScheme,
  SecurityOauth2Scheme,
  SecurityOauth2Scopes,
} from "../openapi.types";

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

export function oauth2ImplicitAuth(
  description: string,
  authorizationUrl: string,
  scopes: SecurityOauth2Scopes,
  refreshUrl?: string
): SecurityOauth2Scheme {
  return {
    type: "oauth2",
    description,
    flows: {
      implicit: {
        authorizationUrl,
        scopes,
        refreshUrl,
      },
    },
  };
}

export function oauth2AuthorizationCodeAuth(
  description: string,
  authorizationUrl: string,
  tokenUrl: string,
  scopes: SecurityOauth2Scopes,
  refreshUrl?: string
): SecurityOauth2Scheme {
  return {
    type: "oauth2",
    description,
    flows: {
      authorizationCode: {
        authorizationUrl,
        tokenUrl,
        scopes,
        refreshUrl,
      },
    },
  };
}

export function oauth2PasswordAuth(
  description: string,
  tokenUrl: string,
  scopes: SecurityOauth2Scopes,
  refreshUrl?: string
): SecurityOauth2Scheme {
  return {
    type: "oauth2",
    description,
    flows: {
      password: {
        tokenUrl,
        scopes,
        refreshUrl,
      },
    },
  };
}

export function oauth2ClientCredentialsAuth(
  description: string,
  tokenUrl: string,
  scopes: SecurityOauth2Scopes,
  refreshUrl?: string
): SecurityOauth2Scheme {
  return {
    type: "oauth2",
    description,
    flows: {
      clientCredentials: {
        tokenUrl,
        scopes,
        refreshUrl,
      },
    },
  };
}
