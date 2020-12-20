# Numeric types

All numeric types here defined have all parameters defined, as a sample, but in most cases you just need to say it's a number. The definition detail depends on what you need, in some cases like an update it makes sense to allow for null for parameter removal, as an example.

## Type Samples

### Integer

```ts
    Joi.number()
        .integer()
        .description("Integer description")
        .min(5)                               // min value 
        .max(100)                             // max value
        .required()                           // required ?
        .default(99)                          // default value that is used if not present
        .example(5)                           // sample value used to prefill API
        .allow(null);                         // nullable ?
```

### Integer Enum

```ts
    enum EnumValues {
        AAA = 5,
        BBB = 10,
        CCC = 20,
    }

    option: Joi.number()
        .integer()
        .description("Integer options from enum")
        .required()                                 // required ?
        .valid(...Object.values(EnumValues))        // enum values (min and max don't make sense to use in this context)
        .default(5)                                 // default value that is used if not present
        .example(20)                                // sample value used to prefill API
        .allow(null);                               // nullable ?
```

### Number

```ts
    Joi.number()
        .description("Number description")
        .required()                                 // required ?
        .min(0.5)                                   // min value 
        .max(100.66)                                // max value
        .default(1)                                 // default value that is used if not present
        .example(33.333)                            // sample value used to prefill API
        .allow(null);                               // nullable ?
```

### Number Enum

```ts
    enum EnumValues {
        AAA = 10.1,
        BBB = 20.2,
        CCC = 30.3,
    }

    Joi.number()
        .description("Number options from enum")
        .required()                                 // required ?
        .valid(...Object.values(EnumValues))        // enum values (min and max don't make sense to use in this context)
        .default(10.1)                              // default value that is used if not present
        .example(30.3)                              // sample value used to prefill API
        .allow(null);                               // nullable ?
```
