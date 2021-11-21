# Parameters and Models

**Version 1.0.0 added support for parameters and models.**<br/>
A parameter can be defined in parameters section of an operation or path and can be used to declare path, query, header and even cookie parameters. [Describing Parameters](https://swagger.io/docs/specification/describing-parameters/)<br/>

Models can describe data structures with the intention of reusing them in different operations and make it easier to create classes in code generators. [Data Models (Schemas)](https://swagger.io/docs/specification/data-models/).

## Parameters
Parameters are simple types that are frequently used like a page number in a query parameter or a pagesize, and it's very simple to declare them. Just pass a property isParameter with true value. They can be used within query, path, header and cookie declarations. Note that a parameter is always connected to a source, so a page number in query is different from a page number in a header.

## Models
Models are data structures that allow you to reuse complex types, like a list of customers, a customer or more complex structures.

A model cannot change between declarations, so if you declare a customer model, it MUST be exactly equal in all declarations, otherwise it will throw an error.

Also keep in mind that if you use microservices, you should have only ONE customer declaration in only ONE service. This makes sure that only a service knows what a customer is, and makes it simple for all services to understand from which service to retrieve a customer. This domain-driven design separates different business processes and avoids having several definitions of the same model.