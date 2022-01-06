# Combining Multiple APIs Into a Unique Schema

**In release 1.0.0 we have introduced the concept of mingling (combining) multiple API's into a single one.**
This allows us to read schemas from different services and produce a new schema from those bits and pieces collected from different service schemas.

You can find a demo server available at <https://github.com/nelsongomes/server/blob/main/src/mingle-demo.ts>

So what do we need to do to combine all our services into a single schema?

1. List all services to combine, either dynamically or statically, up to you;
2. Know the path for each service schema (/private/openapi.json for example);
3. Declare global security schemes and add it to schema, check documentation;
4. Local security schemes need extra attention because they are referenced on methods directly, so you need to make sure any local security scheme is declared on mingling server prior to depletion. If you're using scopes with it, those scopes MUST be also declared before depletion, this happens because code checks for schema integrity before accepting it.
5. Each method, across all service must have a unique operation id, a good option is to give it names like service_verb_operation to avoid conflicts.

## Creating a mingling server

At each iteration of the server need to:

### Create an OpenApi object to store information

```ts
const serviceMingle = new OpenApiMingle(
    "1.0.0",
    "Awesome API Explorer",
    "Demo for combining multiple service definitions into a public API",
    "nelson.ricardo.gomes@gmail.com",
    log // logging callback function
  );
```

### Optionally you can set your license information (the public one)

This is used to document the API license type, url of the license and terms of service.

```ts
    serviceMingle.setLicense(
        "Apache 2.0", // license name
        "http://www.apache.org/licenses/LICENSE-2.0.html", // url for the api license
        "http://swagger.io/terms/" // terms of service
    );
```

### Then you need to declare an array with the API servers

```ts
    serviceMingle.setServers([
        { url: "https://owesomeapi.server.com" },
        { url: "https://europe.server.com" }
    ]);
```

### Obtain a list of services from where to obtain schemas

This lists all services and the schemaUrl from where to fetch that service schema. Note that only routes under privatePrefix/* will be converted to public prefix, the rest will be ignored, because they are not accessible. This method returns a list of ServiceList objects to be used for mingling, it can be either static or dynamic if you use a service discovery system.

This service expects that internal service path http://service:port/privatePrefix will be setup by you in the load balancer so that all requests incoming to publicPrefix will be converted to inner service.

Let's check an example: incoming request to https://yourapi.com/users/* will be converted by the load balancer to a request to an instance of your users service and remaped to http://service:port/public/* according to the configuration below:

```ts
async function getServices(): Promise<ServiceList> {
  return {
    serviceA: {
      // we only expose /public/* path so /private/* will not even be accessible from outside, only from this mingling service
      schemaUrl: "http://192.168.1.199:2399/private/openapi.json",
      publicPrefix: "/users/", // public path, accessible from load balancer
      privatePrefix: "/public/", // path after loadbalancer routed to serviceA
      type: "consul",
    },
    (...)
  };
}
```

### Declare security schemes

Global security schemes are easy to use and declare:

```ts
serviceMingle.declareSecurityScheme("petstore_auth", basicAuth());
serviceMingle.addGlobalSecurityScheme("petstore_auth");
```

Local security schemes (per method) are more tricky, because they are referenced by specific methods, so **their ID must exist prior being referenced by method** schemas and scopes must also match and exist:

```ts
    serviceMingle.declareSecurityScheme(
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

So all services must use the same id ('oauth2Security') and **scopes must be added before** deploying a method that uses the scope.

### Use your service definition to obtain all schemas

Once all these are complete it's just a question of getting all schemas and combine them.

```ts
    await serviceMingle.combineServices(await getServices());
```

Although this combining appears to be simple, it's not! Besides fetching multiple schemas from different services we also need to:

* Filter private routes (not accessible from outside);
* Verify if operation ids are unique across all of your services;
* Remap private paths to public paths;
* Check if schemas are being referenced (in body and each of the possible response codes) and copy them;
* Check if a schema declared by multiple services has the same value (and we should avoid shared schemas when possible);
* Check if a schema reference is referencing internally other schemas and copy those too;
* Check if parameters are being referenced and copy them;
* Check if security schemes match the declaration;
* Local security schemes (method level) need to be checked against declared ones and scopes verified;
