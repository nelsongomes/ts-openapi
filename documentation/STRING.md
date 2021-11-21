# String types

All string types here defined have all parameters defined, as a sample, but in most cases you just need to say it's a string, if it's required and add some meta information to pass along. The definition detail depends on what you need, in some cases like an update it makes sense to allow for null for parameter removal, as an example.

## Type Samples

### String

```ts
    // a simple example
    Types.String()

    // a more complete declaration
    Types.String({
        description: "Customer name",  
        minLength: 5,
        maxLength: 100,
        required: true,
        default: "name",        // default value, if none provided
        example: "John Doe",    // example data
        nullable: true,
        isParameter: true,      // optional, make this a named parameter, check documentation for parameters
    })
```

### String Enum

```ts
    enum EnumValues {
        AAA = "cars",
        BBB = "boats",
        CCC = "planes",
    }

    // a simple example
    Types.StringEnum({ values: Object.values(EnumValues) }

    // a more complete declaration, note that length does not apply because it's already an enum
    Types.StringEnum({
        description: "Select vehicle type",
        values: Object.values(EnumValues),
        required: true,
        default: EnumValues.AAA,    // default value, if none provided
        example: EnumValues.CCC,    // example data
        nullable: true,
        isParameter: true,          // optional, make this a named parameter, check documentation for parameters
    })
```

### Email

```ts
    // a simple example
    Types.Email()

    // a more complete declaration
    Types.Email({
        description: "User email.",
        required: true,
        minLength: 50,
        maxLength: 255,
        default: "john.doe@domain.com", // default value, if none provided
        example: "john.doe@domain.com", // example data
        nullable: true,
        isParameter: true,              // optional, make this a named parameter, check documentation for parameters
    })
```

### Password

```ts
    // a simple example
    Types.Password()

    // a more complete declaration (no default or example for password types)
    Types.Password({
        description: "User password.",
        required: true,
        minLength: 50,
        maxLength: 255,
        nullable: true,
        isParameter: true,      // optional, make this a named parameter, check documentation for parameters
    })
```

### Uuid

```ts
    // a simple example
    Types.Uuid()

    // a more complete declaration, always 36 chars long, with no default
    Types.Uuid({
        description: "An unique identifier",  
        required: true,
        example: "3d22b5e2-b786-47e5-acfc-e4b7a959c114",
        nullable: true,
        isParameter: true,      // optional, make this a named parameter, check documentation for parameters
    })
```

### Uri

```ts
    // a simple example
    Types.Uri()

    // a more complete declaration
    Types.Uri({
        description: "valid RFC 3986 URI",  
        minLength: 5,
        maxLength: 100,
        required: true,
        default: "https://domain",    // default value, if none provided
        example: "https://domain",    // example data
        nullable: true,
        isParameter: true,      // optional, make this a named parameter, check documentation for parameters
    })
```

### Hostname

```ts
    // a simple example
    Types.Hostname()

    // a more complete declaration
    Types.Hostname({
        description: "valid RFC1123 hostname",  
        minLength: 5,
        maxLength: 100,
        required: true,
        default: "https://domain",    // default value, if none provided
        example: "https://domain",    // example data
        nullable: true,
        isParameter: true,            // optional, make this a named parameter, check documentation for parameters
    })
```

### IpV4

```ts
    // a simple example
    Types.Ipv4()

    // a more complete declaration
    Types.Ipv4({
        description: "Ipv4 address",
        required: true,
        default: "8.8.8.8",     // default value, if none provided
        example: "127.0.0.1",   // example data
        nullable: true,
        isParameter: true,      // optional, make this a named parameter, check documentation for parameters
    })
```

### IpV6

```ts
    // a simple example
    Types.Ipv6()

    // a more complete declaration
    Types.Ipv6({
        description: "Ipv6 address",
        required: true,
        default: "::1",                                     // default value, if none provided
        example: "0000:0000:0000:0000:0000:ffff:c0a8:64e4", // example data
        nullable: true,
        isParameter: true,      // optional, make this a named parameter, check documentation for parameters
    })
```

### Hex (or how to adapt types)
Under the hood these types are wrappers for Joi schema types, so we can use Joi functions to extend functionality to create in this case an Hex string type:

```ts
    // a simple example
    Types.String().hex()

    // a more complete declaration
    Types.String({
        description: "Customer name",  
        minLength: 5,
        maxLength: 100,
        required: true,
        default: "name",        // default value, if none provided
        example: "John Doe",    // example data
        nullable: true
    }).hex()
```
