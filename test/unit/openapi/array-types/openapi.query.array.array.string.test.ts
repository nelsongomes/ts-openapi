import { OpenApi } from "../../../../src/openapi/openapi";
import { Types } from "../../../../src/openapi/helpers/types";


describe("src/openapi/openapi", () => {
    let openApi: OpenApi;

    describe("Array of Array of string", () => {
        beforeEach(() => {
            openApi = new OpenApi(
                "1.0.0",
                "Server API",
                "Some test api",
                "nelson.ricardo.gomes@gmail.com"
            );

            openApi.setServers([{ url: "https://server.com" }]);
        });

        test("array of array of string simple", async () => {
            const responseSchema = Types.Object({
                properties: {
                    testProp: Types.Array({
                        arrayType: Types.Array({
                            arrayType: Types.String()
                        })
                    })
                }
            });

            openApi.addPath(
                "/test",
                {
                    get: {
                        description: "Test endpoint",
                        operationId: "id",
                        responses: {
                            200: openApi.declareSchema("Create job success", responseSchema)
                        },
                        summary: "Server Test",
                        tags: ["Internals"]
                    }
                },
                true
            );
            expect(openApi.generateJson()).toMatchSnapshot();
        });
    });
});