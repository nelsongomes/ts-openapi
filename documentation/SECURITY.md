# Security Schemes

There are 2 ways to declare a security schema, either globally, or in a method. Both ways require you to declare the scheme.

## Declaring a security scheme

### Local security scheme

```ts
    // declare security schemes available (once per security scheme)
    openApi.declareSecurityScheme("basicSecurity", basicAuth());

    // apply the security scheme to this specific method
    openApi.addPath(
        "/health",
        {
            get: {
                description: "Service healthcheck endpoint",
                operationId: "healthcheck",
                responses: {
                200: textPlain("Successful operation.")
                },
                summary: "Server Healthcheck",
                tags: ["Internals"],
                // here we provide the scheme name and it's list of scopes
                security: [{ basicSecurity: [] }]
            }
        },
        true
    );
```

### Global security scheme

```ts
    // declare security schemes available (once per security scheme)
    openApi.declareSecurityScheme("basicSecurity", basicAuth());

    // declare global schemes (applicable to all methods)
    openApi.addGlobalSecurityScheme("basicSecurity");
```

## Available security schemes

### Basic Security

```ts
    // usually user:pass encoded in base64, not very secure, or not secure at all when used with HTTP
    openApi.declareSecurityScheme("basicSecurity", basicAuth());
```

### Api Key Security

```ts
    // to receive a key name X-API-KEY (or other name) in header, cookie or query parameter
    openApi.declareSecurityScheme(
        "apiSecurity",
        apiKeyAuth("X-API-KEY", "header")
    );
```

### Cookie Security

```ts
    // receive a cookie as security
    openApi.declareSecurityScheme(
        "cookieSecurity",
        cookieAuth("JSESSIONID")
    );
```

### Bearer Security

```ts
    // receive an autorization header
    openApi.declareSecurityScheme("bearerSecurity", bearerAuth());

    // receive an autorization header (with format)
    openApi.declareSecurityScheme("bearerJwtSecurity", bearerAuth("JWT"));
```

### Oauth2 Security authorizationCode

```ts
    openApi.declareSecurityScheme(
        "oauth2Security",
        oauth2AuthorizationCodeAuth(
            "This API uses OAuth 2 with the authorizationCode grant flow. [More info](https://api.example.com/docs/auth)",
            "https://api.example.com/oauth2/authorize",
            "https://api.example.com/oauth2/tokenUrl",
            {   // scopes
                read_pets: "Read your pets",
                write_pets: "Modify pets in your account"
            },
            "https://www.domain.com/refreshUrl"
        )
    );
```

### Oauth2 Security implicit

```ts
    openApi.declareSecurityScheme(
        "oauth2Security",
        oauth2ImplicitAuth(
            "This API uses OAuth 2 with the implicit grant flow. [More info](https://api.example.com/docs/auth)",
            "https://api.example.com/oauth2/authorize",
            {
                read_pets: "Read your pets",
                write_pets: "Modify pets in your account"
            },
            "https://www.domain.com/refreshUrl"
        )
    );
```

### Oauth2 Security password

```ts
    openApi.declareSecurityScheme(
        "oauth2Security",
        oauth2PasswordAuth(
            "This API uses OAuth 2 with the implicit grant flow. [More info](https://api.example.com/docs/auth)",
            "https://api.example.com/tokenUrl",
            {
                read_pets: "Read your pets",
                write_pets: "Modify pets in your account"
            },
            "https://www.domain.com/refreshUrl"
        )
    );
```

### Oauth2 Security clientCredentials

```ts
    openApi.declareSecurityScheme(
        "oauth2Security",
        oauth2ClientCredentialsAuth(
            "This API uses OAuth 2 with the implicit grant flow. [More info](https://api.example.com/docs/auth)",
            "https://api.example.com/tokenUrl",
            {
                read_pets: "Read your pets",
                write_pets: "Modify pets in your account"
            },
            "https://www.domain.com/refreshUrl"
        )
    );
```

### More information
[OpenApi Authorization and Authentication](https://swagger.io/docs/specification/authentication/)<br/>
[Swagger UI Documentation](https://www.npmjs.com/package/swagger-ui-express)<br/>
