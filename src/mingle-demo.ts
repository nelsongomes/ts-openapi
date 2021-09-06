import { OpenApiMingle, ServiceList } from "./openapi/openapi-mingle";
import { OpenApiSchema } from "./openapi/openapi.types";

// tslint:disable:no-console
function log(message: string, e?: Error) {
  if (e) {
    console.log(message, e);
  } else {
    console.log(message);
  }
}
// tslint:enable:no-console

async function demo() {
  const serviceMingle = new OpenApiMingle(
    "1.0.0",
    "Server API",
    "Some test api",
    "nelson.ricardo.gomes@gmail.com",
    log
  );

  serviceMingle.setLicense("license", "http://license", "http://terms");

  const services: ServiceList = {
    users: {
      schemaUrl: "file://test/unit/openapi-mingle/samples/sample1.json",
      publicPrefix: "/users/",
      privatePrefix: "/public/",
      type: "consul"
    },
    demo: {
      schemaUrl: "https://generator3.swagger.io/openapi.json",
      publicPrefix: "/openapi/",
      privatePrefix: "/",
      type: "consul"
    }
  };

  serviceMingle.setServers([
    { url: "https://explorer-eu.awesome-api.com" },
    { url: "https://explorer-us.awesome-api.com" }
  ]);

  await serviceMingle.combineServices(services);

  return serviceMingle.generateJson() as OpenApiSchema;
}

demo();
