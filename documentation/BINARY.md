# Binary types

All binary types here defined have all parameters defined, as a sample, but in most cases you just need to say it's binary. The definition detail depends on what you need, in some cases like an update it makes sense to allow for null for parameter removal, as an example.

## Type Samples

### Binary

```ts
    // a simple example
    Types.Binary()

    // a more complete declaration
    Types.Binary({
        description: "some binary string",
        required: true,
        minLength: 512,
        maxLength: 1024,
        default: "12345", // default value, if none provided
        example: "12345", // example data
        nullable: true,
        isParameter: true, // optional, make this a named parameter, check documentation for parameters
    })
```

### Byte

```ts
    // a simple example
    Types.Byte()

    // a more complete declaration
    Types.Byte({
        description: "a base64 encoded string",
        required: true,
        minLength: 512,
        maxLength: 1024,
        default: "c2FtcGxlMQ==", // default value, if none provided
        example: "c2FtcGxlMQ==", // example data
        nullable: true,
        isParameter: true, // optional, make this a named parameter, check documentation for parameters
    })
```
