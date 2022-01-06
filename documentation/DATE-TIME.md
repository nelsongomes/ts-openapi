# Date-Time types

All date-time types here defined have all parameters defined, as a sample, but in most cases you just need to say it's a date. The definition detail depends on what you need, in some cases like an update it makes sense to allow for null for parameter removal, as an example.

## Type Samples

### Date-Time

```ts
    // a simple example
    Types.DateTime()

    // a more complete declaration
    Types.DateTime({
        description: "When did it happened.",
        required: true,
        nullable: true,
        default: "2020-10-14T22:12:53.065Z",    // default value, if none provided
        example: "2020-10-14T22:12:53.065Z"     // example data
        isParameter: true, // optional, make this a named parameter, check documentation for parameters
    })
```

### Date

```ts
    // a simple example
    Types.Date()

    // a more complete declaration
    Types.Date({
        description: "When did it happened.",
        required: true,
        nullable: true,
        default: "2020-10-14",    // default value, if none provided
        example: "2020-10-14"     // example data
        isParameter: true, // optional, make this a named parameter, check documentation for parameters
    })
```
