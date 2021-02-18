# Object type

Object type can contain different scalar types, objects and even inner arrays. The most simple types can be used almost everywhere, the more complex types can't.

1. **Object types can only be used has a part of a body**;

## Type Samples

### Object with scalar parameter

```ts
    // a simple example
    Types.Object({
        properties: {
            name: Types.String() // at least one property should be provided
        }
    })

    // a more complete declaration
    Types.Object({
        properties: {
          username: Types.String(),
        },
        description: "My object description",
        required: true,
        nullable: true,
        default: { username: "John Doe" }, // notice that the default is an object
        example: { username: "John Doe" },
      });
```

### Object with an array of objects

```ts
    Types.Object({
        properties: {
            objectList: Types.Array({
                arrayType: Types.Object({
                    properties: {
                        customer: Types.String({ description: "Customer Name" }),
                    },
                    description: "This is an array of customers",
                }),
            }),
        },
        description: "This is an example of an object with an array of objects",
        required: false, 
        nullable: true, // you can send this object as a null (to unset it in a PUT request)
        // default value, if none provided
        default: { objectList: [{ customer: "John" }, { customer: "Alice" }] },
        // example data
        example: { objectList: [{ customer: "John" }, { customer: "Alice" }] },
    });                         
```

### Object with an inner object

```ts
    Types.Object({
        properties: {
            innerObject: Types.Object({
                properties: {
                    customer: Types.String({ description: "Customer Name" }),
                },
                description: "This is an inner object",
            }),
        },
        description: "This is an example of an object with an inner object",
        required: false,
        nullable: true, // you can send this object as a null (to unset it in a PUT request)
        // default value, if none provided
        default: { innerObject: { customer: "John" } },
        // example data
        example: { innerObject: { customer: "John" } },
    });     
```
