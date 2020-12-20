# Date-Time types

All date-time types here defined have all parameters defined, as a sample, but in most cases you just need to say it's a date. The definition detail depends on what you need, in some cases like an update it makes sense to allow for null for parameter removal, as an example.

## Type Samples

### Date-Time

```ts
    Joi.string()
        .isoDate()
        .required()                                 // required ?
        .description("When did it happen.")
        .default("2020-10-14T22:12:53.065Z")        // default value that is used if not present
        .example("2020-10-14T22:12:53.065Z")        // sample value used to prefill API
        .allow(null);                               // nullable ?
```

### Date

```ts
    Joi.string()
        .isoDate()
        .meta({ format: "date" })
        .required()                                 // required ?
        .description("When did it happen.")
        .default("2020-10-14")                      // default value that is used if not present
        .example("2020-10-14")                      // sample value used to prefill API
        .allow(null);                               // nullable ?
```
