# Ts-openapi
#### An openapi json generator based on joi information about APIs that will help you to maintain your API documentation up to date. In node ecosystem, joi is the most used library to validate data schemas, this can be used to generate and maintain API information up to date, without the need to update manually documentation.
## Installation
Using npm:
`npm i --save ts-openapi`
#### Visit the [GitHub Repo](https://github.com/nelsongomes/ts-openapi/) tutorials, documentation, and support.

## Useful resources
- [OpenApi Supported Types](#supported-types)
- [Versions status](https://joi.dev/resources/status/#joi)
- [Changelog](https://joi.dev/resources/changelog/)
- [Project policies](https://joi.dev/policies/)

------------

## [OpenApi Supported Types](#supported-types)

Type                                                                    | Query   | Path (1)(6)  | Header | Cookie  | Body
--------------------------------------------                            | ------- | ---------    | ------ | ------- | ---------
String, String Enum, Email, Password, Uuid, Uri, Hostname, Ipv4, Ipv6   | YES     | YES          | YES    | YES     | NO (5)
Integer, Integer Enum, Number, Number Enum                              | YES     | YES          | YES    | YES     | NO (5)
Date-time, Date                                                         | YES     | YES          | YES    | YES     | NO (5)
Byte(3), Binary (string)                                                | YES     | YES          | YES    | YES     | NO (5)
Array[]                                                                 | YES (4) | NO           | NO     | NO      | NO (2)(5)
Object                                                                  | NO      | NO           | NO     | NO      | YES (7)
<sup>
(1) Values included in url parameters are always required because they're part of the url.<br/>
(2) [Ajax bestpractices](https://cheatsheetseries.owasp.org/cheatsheets/AJAX_Security_Cheat_Sheet.html "OWASP CheatSheet's").<br/>
(3) this type is a Base64 binary encoded string.<br/>
(4) array of scalar values.<br/>
(5) all scalar values, arrays of objects and other objects go inside json object.<br/>
(6) the name of route parameters must be made up of “word characters” ([A-Za-z0-9_]).<br/>
(7) GET requests don't have a body.<br/>
</sup>

## Type Samples

### All samples presented here an in Typescript

[String Types](documentation/STRING.md)<br/>
[Numeric Types](documentation/NUMERIC.md)<br/>
[Date-Time Types](documentation/DATE-TIME.md)<br/>
[Binary Types](documentation/BINARY.md)<br/>
