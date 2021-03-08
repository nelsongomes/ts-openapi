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

Type                                                                    | Query   | Path (1)(6)  | Header | Cookie  | Body
--------------------------------------------                            | ------- | ---------    | ------ | ------- | ---------
String, String Enum, Email, Password, Uuid, Uri, Hostname, Ipv4, Ipv6   | YES     | YES          | YES    | YES     | NO (5)
Integer, Integer Enum, Number, Number Enum                              | YES     | YES          | YES    | YES     | NO (5)
Date-time, Date                                                         | YES     | YES          | YES    | YES     | NO (5)
Byte(3), Binary (string)                                                | YES     | YES          | YES    | YES     | NO (5)
Array[]                                                                 | YES (4) | NO           | NO     | NO      | NO (2)(5)
Object                                                                  | NO      | NO           | NO     | NO      | YES (7)
<sup>
(1) Values included in url parameters are always required because they're part of the url.<br/>
(2) [Ajax bestpractices](https://cheatsheetseries.owasp.org/cheatsheets/AJAX_Security_Cheat_Sheet.html "OWASP CheatSheet's").<br/>
(3) this type is a Base64 binary encoded string.<br/>
(4) array of scalar values.<br/>
(5) all scalar values, arrays of objects and other objects go inside json object.<br/>
(6) the name of route parameters must be made up of “word characters” ([A-Za-z0-9_]).<br/>
(7) GET requests don't have a body.<br/>
</sup>

## Type Samples

### All samples presented here an in Typescript

[String Types](documentation/STRING.md)<br/>
[Numeric Types](documentation/NUMERIC.md)<br/>
[Date-Time Types](documentation/DATE-TIME.md)<br/>
[Binary Types](documentation/BINARY.md)<br/>
[Array Type](documentation/ARRAY.md)<br/>
[Object Type](documentation/OBJECT.md)<br/>
[Security Schemes](documentation/SECURITY.md)<br/>

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

### Now you need to declare your endpoints

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
