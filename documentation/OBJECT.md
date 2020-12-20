# Object type

Object type can contain different scalar types, objects and even inner arrays. The most simple types can be used almost everywhere, the more complex types can't.

1. **Object types can only be used has a part of a body**;

## Type Samples

### Object with scalar parameter

```ts
    // this is an object with a string parameter
    Joi.object()
        .keys({
            // add other parameters here (objects, arrays, scalars)
            parameter: Joi.string().description("String parameter"),
        })
        .description("My body description")
        .required()                         // required ?
        .default({ parameter: "default" })  // default value that is used if not present
        .example({ parameter: "default" })  // sample value used to prefill API, notice it's an object
        .allow(null);                       // object nullable ?
```

### Object with an array of objects

```ts
    // this is an object
    Joi.object()
        .keys({
            // here we declare a parameter of array type
            objectList: Joi.array()
                .items(
                    // here we declare that the array contains objects
                    Joi.object()
                        .keys({
                            // with a parameter of type string (or more)
                            customer: Joi.string().description('Customer Name'),
                        }),
                )
                .description("Array description");
        })
        .description("My body description")
        .required()                             // required ?
        .default([{ parameter: "default" }])    // default value that is used if not present
        .example([{ parameter: "default" }])    // sample value used to prefill API, notice it's an object array
        .allow(null);                           // object nullable ?
```

### Object with an inner object

```ts
    // this is an object
    Joi.object()
        .keys({
            // here we declare a parameter of object type
            myObject: Joi.object()
                .keys({
                    // with a parameter of type string (or more)
                    customer: Joi.string().description('Customer Name'),
                }),
        })
        .description("My body description")
        .required()                         // required ?
        .default({ customer: "John Doe" })  // default value that is used if not present
        .example({ customer: "John Doe" })  // sample value used to prefill API, notice it's an object
        .allow(null);                       // object nullable ?
```
