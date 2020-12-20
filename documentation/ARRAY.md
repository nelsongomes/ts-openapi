# Array type

Array type can contain different scalar types, objects and even inner arrays. The most simple types can be used almost everywhere, the more complex types can't.

1. **Query parameters don't support array of arrays or array of objects** but supports arrays of scalar types;
2. **Path parameters don't support arrays of any kind**;
3. **Header parameters don't support arrays of any kind**;
4. **Cookie parameters don't support arrays of any kind**;
5. **Body content does not support arrays at top level, but support it inside objects, for security reasons**;

## Type Samples

### Array of scalar (string, numeric, date-time and binary)

```ts
    // this is an array of string
    Joi.array()
        .items(
            // replace this to have arrays of other scalar type with all details needed
            Joi.string()
        )
        .min(1)                             // min items in array
        .max(100)                           // max items in array
        .required()                         // required ?
        .description("Array description")   
        .default(["array of", "strings"])   // default value that is used if not present
        .example(["a string inside array"]) // sample value used to prefill API, notice it's an array
        .allow(null);                       // array nullable ?
```

### Array of objects (only usable inside an object, request body per example)

```ts
    // this is an array of objects with name and age
    Joi.array()
        .items(
            // replace this to have arrays of other scalar type with all details needed
            Joi.object().keys({
                name: Joi.string()
                    .description("Customer Name"),
                age: Joi.number()
                    .integer()
                    .description("Customer Age")
                    .min(0)
                    .max(120),
            })
        )
        .min(1)                                     // min items in array
        .max(100)                                   // max items in array
        .required()                                 // required ?
        .description("Array description")   
        .default([{ name: "John Doe", age: 25 }])   // default value that is used if not present
        .example([{ name: "John Doe", age: 25 }])   // sample value used to prefill API, notice it's an array
        .allow(null);                               // array nullable ?
```

### Array of arrays

```ts
    // this is an array of array of string
    Joi.array()
        .items(
            Joi.array()
                .items(
                    Joi.string(),
                })
        )
        .min(1)                                     // min items in array
        .max(100)                                   // max items in array
        .required()                                 // required ?
        .description("Array description")   
        .default([{ name: "John Doe", age: 25 }])   // default value that is used if not present
        .example([{ name: "John Doe", age: 25 }])   // sample value used to prefill API, notice it's an array
        .allow(null);                               // array nullable ?
```
