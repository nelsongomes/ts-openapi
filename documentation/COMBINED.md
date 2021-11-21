# Combining Multiple APIs Into a Unique Schema

## Let's Imagine Our Infrastructure

Server: https://owesomeapi.server.com with a load balancer configured to map:

We have 2 services:
authenticate service
/public/ * APIs available to public
/openapi.json schema for the service
/api-docs/ internal UI for the service

so that every public call to https://owesomeapi.server.com/authenticate/* will be routed to authenticate/public/*

user service
/public/ * APIs available to public
/openapi.json schema for the service
/api-docs/ internal UI for the service

so that every public call to https://owesomeapi.server.com/user/* will be routed to user/public/*

So for this example to work we need to fetch 2 openapi schemas and remap them to the path seen outside of the API, but the most important thing is that every single change made to these individual services will be reflected to the public API automatically.

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
        { url: "https://owesomeapi.server.com" }
    ]);
```

### Optionally you can set your license information (the public one)

This is used to document the API license type, url of the license and terms of service.

```ts
    openApi.setLicense(
        "Apache 2.0", // license name
        "http://www.apache.org/licenses/LICENSE-2.0.html", // url for the api license
        "http://swagger.io/terms/" // terms of service
    );
```

https://www.npmjs.com/package/jest-diff