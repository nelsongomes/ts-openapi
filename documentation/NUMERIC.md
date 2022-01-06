# Numeric types

All numeric types here defined have all parameters defined, as a sample, but in most cases you just need to say it's a number. The definition detail depends on what you need, in some cases like an update it makes sense to allow for null for parameter removal, as an example.

## Type Samples

### Integer

```ts
    // a simple example
    Types.Integer()
    
    // a more complete declaration
    Types.Integer({
        description: "Integer description",
        required: true,
        minValue: 5,
        maxValue: 100,
        default: 99,    // default value, if none provided
        example: 5,     // example data
        nullable: true,
        isParameter: true,      // optional, make this a named parameter, check documentation for parameters
    })
```

### Integer Enum

```ts
    enum EnumValues {
        AAA = 5,
        BBB = 10,
        CCC = 20,
    }

    // a simple example
    Types.IntegerEnum({
        values: Object.values((EnumValues as unknown) as number[])
    })          
    
    // a more complete declaration
    Types.IntegerEnum({
        required: true,
        values: Object.values(EnumValues),
        description: "Integer options from enum",
        default: 5,     // default value, if none provided
        example: 20,    // example data
        nullable: true,
        isParameter: true, // optional, make this a named parameter, check documentation for parameters
    })
```

### Number

```ts
    // a simple example
    Types.Number()

    // a more complete declaration
    Types.Number({
        description: "Sensor value.",
        required: true,
        minValue: 0.5,
        maxValue: 100.66,
        default: 1,         // default value, if none provided
        example: 33.333,    // example data
        nullable: true,
        isParameter: true,  // optional, make this a named parameter, check documentation for parameters
    })
```

### Number Enum

```ts
    enum EnumValues {
        AAA = 10.1,
        BBB = 20.2,
        CCC = 30.3,
    }

    // a simple example
    Types.NumberEnum({ values: Object.values(EnumValues) })

    // a more complete declaration
    Types.NumberEnum({
        values: Object.values(EnumValues),
        description: "Sensor value.",
        required: true,
        default: 10.1,
        example: 30.3,
        nullable: true,
        isParameter: true, // optional, make this a named parameter, check documentation for parameters
    })
```
