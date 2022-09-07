# Ts-openapi

[![npm](https://img.shields.io/npm/v/ts-openapi.svg)](https://www.npmjs.com/package/ts-openapi)

An openapi json generator using joi API schemas that will help you to maintain your API documentation up to date. Joi is the is one of the most used components to validate data schemas, this can be used to generate and maintain API information up to date, without the need to update manually documentation.

This software has some code extracted from [joi-to-swagger](https://www.npmjs.com/package/joi-to-swagger) to interface with Joi schemas.

## Installation

Using npm:
`npm i --save ts-openapi`

### Visit the [GitHub Repo](https://github.com/nelsongomes/ts-openapi/) tutorials, documentation, and support

------------

## OpenApi Supported Types

Type                                                                    | Query   | Path (1)(5)  | Header | Cookie  | Body
--------------------------------------------                            | ------- | ---------    | ------ | ------- | ---------
String, String Enum, Email, Password, Uuid, Uri, Hostname, Ipv4, Ipv6   | YES     | YES          | YES    | YES     | NO (4)
Integer, Integer Enum, Number, Number Enum                              | YES     | YES          | YES    | YES     | NO (4)
Date-time, Date                                                         | YES     | YES          | YES    | YES     | NO (4)
Byte(3), Binary (string)                                                | YES     | YES          | YES    | YES     | NO (4)
Array[]                                                                 | YES (3) | NO           | NO     | NO      | YES (4)
Object                                                                  | NO      | NO           | NO     | NO      | YES (6)
<sup>
(1) Values included in url parameters are always required because they're part of the url.<br/>
(2) this type is a Base64 binary encoded string.<br/>
(3) array of scalar values.<br/>
(4) for body we support objects and arrays.<br/>
(5) the name of route parameters must be made up of “word characters” ([A-Za-z0-9_]).<br/>
(6) GET requests don't have a body.<br/>
</sup>

## Type Samples

### All samples presented here an in Typescript

[String Types](documentation/STRING.md)<br/>
[Numeric Types](documentation/NUMERIC.md)<br/>
[Date-Time Types](documentation/DATE-TIME.md)<br/>
[Binary Types](documentation/BINARY.md)<br/>
[Array Type](documentation/ARRAY.md)<br/>
[Object Type](documentation/OBJECT.md)<br/>

## Advanced Topics

### Security

[Security Schemes](documentation/SECURITY.md)<br/>

### Parameters and Models

[Parameters and Models](documentation/PARAMETERS-AND-MODELS.md)<br/>

### Mingle multiple services

[Mingle multiple services](documentation/COMBINED.md)<br/>

## Declaring an API

### First we need to create an OpenApi object to store information

```ts
    const openApi = new OpenApi(
        "1.0.0",                // API version
        "Server API",           // API title
        "Some test api",        // API description
        "maintainer@domain.com" // API maintainer email
    );
```

### Then you need to declare an array with the API servers

In the event your API is based on docker instances you should call setServers when OpenApi class is called to get the json, to update the IPs and port numbers. You can even specify different servers depending if the call is internal or external. Up to you.

```ts
    openApi.setServers([
        { url: "https://api.domain.com:443" },
        { url: "https://192.168.1.23:80" }
    ]);
```

### Optionally you can set your license information

This is used to document the API license type, url of the license and terms of service.

```ts
    openApi.setLicense(
        "Apache 2.0", // license name
        "http://www.apache.org/licenses/LICENSE-2.0.html", // url for the api license
        "http://swagger.io/terms/" // terms of service
    );
```

### Now you need to declare your endpoints (once per http verb)

```ts
    openApi.addPath(
        "/hello",
        {
            get: {
                summary: "Server Healthcheck",          // Method title
                description: "Hello world endpoint",    // Method description
                operationId: "hello-op",                // unique operation id
                responses: {                            // response codes and description
                    200: textPlain("Successful operation."),
/*                  // or if you prefer:
                    200: {
                        description: "Successful operation.",
                        content: { "text-plain": {} },  // mimetype with empty schema
                    },*/
                },
                tags: ["Test Operations"],              // One or more tags, this will allow API grouping
            },
        },
        true                                            // visible ? If not it gets skipped from declaration
    );
```

### Finally we export the JSON schema

Note that the paths just need to be added one time, during server init, after this the openApi is basically static.

```ts
    openApi.generateJson();
```

## Declaring a GET request

```ts

    const errorSchema = Types.Object({
        description: "Error description",
        properties: {
            message: Types.String({ description: "Error message" }),
            code: Types.Integer({ description: "Error code" }),
        },
        example: { message: "Bad request": code: 400 }
    });

    // body response schema
    const responseSchema = Types.Object({
        description: "Customer details",
        properties: {
            id: Types.Uuid({ description: "Customer ID" }),
            name: Types.String({
                description: "Customer name",
                maxLength: 100,
                required: true,
            }),
            type: Types.StringEnum({
                values: Object.values(CustomerType),
                description: "Customer Type",
            }),
            birthdate: Types.Date({ description: "Birthdate" }),
        },
        example: { id: "96efe677-f752-426f-a9b8-b9f33b286cc9", name: "customer model", type: "gold", birthdate: "11-11-1911" },
    });

    openApi.addPath(
        "/customer/:id", // path parameter
        {
            get: {
                summary: "Get a customer data",
                description: "This operation retrieves customer information",
                operationId: "get-customer-op",
                requestSchema: {
                    params: { // path parameter
                        id: Types.Uuid({
                            description: "Customer ID",
                            required: true, // param values MUST be required
                            example: "37237d6a-bb7e-459a-b75d-d1733210ad5c",
                        }),
                    },
                },
                tags: ["Customer Operations"],
                responses: {
                    200: openApi.declareSchema("Get customer success", responseSchema),
                    400: openApi.declareSchema("Bad Request", errorSchema),
                },
            },
        },
        true
  );
```

## Declaring other HTTP methods

You can declare:

* delete requests
* get requests
* patch requests
* post requests
* put methods

## Declaring the inputs of your request

When you declare your request you can use as inputs:

* query parameters '?a=1&b=2'
* param parameter '/:userid/list'
* cookie parameter (a cookie)
* header parameters
* body content

## Sample server

[GitHub Repo for a demo server](https://github.com/nelsongomes/server)
