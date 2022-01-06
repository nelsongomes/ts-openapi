# Array type

Array type can contain different scalar types, objects and even inner arrays. The most simple types can be used almost everywhere, the more complex types can't.

1. **Query parameters don't support array of arrays or array of objects** but supports arrays of scalar types;
2. **Path parameters don't support arrays of any kind**;
3. **Header parameters don't support arrays of any kind**;
4. **Cookie parameters don't support arrays of any kind**;
5. **Body content does not support arrays at top level (for security reasons), but support it inside objects**;

## Type Samples

### Array of scalar (string, numeric, date-time and binary)

```ts
    // a simple example
    Types.Array({ arrayType: Types.String() })

    // a more complete declaration
    Types.Array({
        arrayType: Types.String(),
        description: "String array",
        minLength: 10,
        maxLength: 20,
        required: true,
        default: ["string"],  // default value, if none provided
        example: ["string"],  // example data
        nullable: true,
        isParameter: true, // optional, make this a named parameter, check documentation for parameters
    })
```

### Array of objects (only usable inside an object, request body per example)

```ts
    // a simple example
    Types.Array({
        arrayType: Types.Object({
            properties: {
                test: Types.String(),
            },
        }),
    })

    // a more complete declaration
    Types.Array({
        arrayType: Types.Object({
            properties: {
                name: Types.String(),
            },
        }),
        description: "Array of objects",
        required: true,
        minLength: 1,
        maxLength: 10,
        default: [{name: "John Doe"}],  // default value, if none provided
        example: [{name: "John Doe"}],  // example data
        nullable: true
    })
    
```

### Array of arrays

```ts
    // a simple example
    Types.Array({
        arrayType: Types.Array({ 
            arrayType: Types.String() 
        }),
    })

    // a more complete declaration
    Types.Array({
        arrayType: Types.Array({ 
            arrayType: Types.String() 
        }),
        description: "Array of strings",
        required: true,
        minLength: 1,
        maxLength: 10,
        default: "some string",  // default value, if none provided
        example: "some string",  // example data
        nullable: true
    })
```
