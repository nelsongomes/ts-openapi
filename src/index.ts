import Joi, { Schema } from "joi";
import { OpenApi } from "./openapi/openapi";
import { WebRequestSchema, Responses } from "./openapi/openapi.types";
import { bodySchema } from "./openapi/openapi-functions";
import {
  basicAuth,
  apiKeyAuth,
  bearerAuth,
  cookieAuth,
  oauth2ImplicitAuth,
  oauth2AuthorizationCodeAuth,
  oauth2PasswordAuth,
  oauth2ClientCredentialsAuth,
} from "./openapi/helpers/auth";
import { textPlain } from "./openapi/helpers/body-mimetype";

export { Joi, Schema };
export { OpenApi, bodySchema };
export { WebRequestSchema, Responses };

// export security schemes
export {
  basicAuth,
  apiKeyAuth,
  bearerAuth,
  cookieAuth,
  oauth2ImplicitAuth,
  oauth2AuthorizationCodeAuth,
  oauth2PasswordAuth,
  oauth2ClientCredentialsAuth,
};
export { textPlain };
