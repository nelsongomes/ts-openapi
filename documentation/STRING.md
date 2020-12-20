# String types

All string types here defined have all parameters defined, as a sample, but in most cases you just need to say it's a string, if it's required and add some meta information to pass along. The definition detail depends on what you need, in some cases like an update it makes sense to allow for null for parameter removal, as an example.

## Type Samples

### String

```ts
    Joi.string()
        .description("Parameter description.")
        .min(5)                 // min length 
        .max(100)               // max length
        .required()             // required ?
        .default("name")        // default value that is used if not present
        .example("John Doe")    // sample value used to prefill API
        .allow(null);           // nullable ?
```

### String Enum

```ts
    enum EnumValues {
        AAA = "cars",
        BBB = "boats",
        CCC = "planes",
    }

    Joi.string()
        .valid(...Object.values(EnumValues))
        .description("Select vehicle type")
        .required()             // required ?
        .default("cars")        // default value that is used if not present
        .example("planes")      // sample value used to prefill API
        .allow(null);           // nullable ?
```

### Email

```ts
    Joi.string()
        .description("User email.")
        .email()
        .required()                     // required ?
        .min(50)                        // min length 
        .max(255)                       // max length 
        .default("john.doe@domain.com") // default value that is used if not present
        .example("john.doe@domain.com") // sample value used to prefill API
        .allow(null);                   // nullable ?
```

### Password

```ts
    Joi.string()
        .description("User password.")
        .meta({ format: "password" })
        .required()                     // required ?
        .min(50)                        // min length 
        .max(255)                       // max length
        .example("****")                // sample value used to prefill API
        .allow(null);                   // nullable ?
```

### Uuid

```ts
    Joi.string()
        .meta({ format: "uuid" })
        .description("Some uuid.")
        .required()                                         // required ?
        .min(50)                                            // min length
        .max(255)                                           // max length
        .default("ac7744d6-eefb-4437-9fe3-617abda4b659")    // default value that is used if not present
        .example("ac7744d6-eefb-4437-9fe3-617abda4b659")    // sample value used to prefill API
        .allow(null);                                       // nullable ?
```

### Uri

```ts
    Joi.string()
        .description("Uri to something")
        .meta({ format: "uri" })
        .required()                         // required ?
        .min(50)                            // min length
        .max(255)                           // max length
        .default("https://www.domain.com")  // default value that is used if not present
        .example("https://www.domain.com")  // sample value used to prefill API
        .allow(null);                       // nullable ?
```

### Hostname

```ts
    Joi.string()
        .description("Hostname")
        .meta({ format: "hostname" })
        .required()                         // required ?
        .min(50)                            // min length
        .max(255)                           // max length
        .default("www.domain.com")          // default value that is used if not present
        .example("www.domain.com")          // sample value used to prefill API
        .allow(null);                       // nullable ?
```

### IpV4

```ts
    Joi.string()
        .description("Ipv4")
        .meta({ format: "ipv4" })
        .required()                         // required ?
        .min(50)                            // min length
        .max(255)                           // max length
        .default("192.168.1.1")             // default value that is used if not present
        .example("192.168.1.1")             // sample value used to prefill API
        .allow(null);                       // nullable ?
```

### IpV6

```ts
    Joi.string()
        .description("Ipv6")
        .meta({ format: "ipv6" })
        .required()                         // required ?
        .min(50)                            // min length
        .max(255)                           // max length
        .default("::1")                     // default value that is used if not present
        .example("::1")                     // sample value used to prefill API
        .allow(null);                       // nullable ?
```
