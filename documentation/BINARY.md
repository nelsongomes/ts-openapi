# Binary types

#### All binary types here defined have all parameters defined, as a sample, but in most cases you just need to say it's binary. The definition detail depends on what you need, in some cases like an update it makes sense to allow for null for parameter removal, as an example.

## Type Samples

### Binary

```ts
    Joi.binary()
        .description("Binary string")
        .required()                                 // required ?
        .min(512)                                   // min length
        .max(1024)                                  // max length
        .default("binary string")                   // default value that is used if not present
        .example("binary string")                   // sample value used to prefill API
        .allow(null);                               // nullable ?
```

### Byte

```ts
    Joi.binary()
        .encoding("base64")
        .description("Base-64 encoded string")
        .required()                                 // required ?
        .min(512)                                   // min length
        .max(1024)                                  // max length
        .default("c2FtcGxlMQ==")                    // default value that is used if not present
        .example("c2FtcGxlMQ==")                    // sample value used to prefill API
        .allow(null);                               // nullable ?
```
