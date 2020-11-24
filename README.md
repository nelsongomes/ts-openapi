# Ts-openapi

An openapi json generator based on joi information about APIs that will help you to maintain your API documentation up to date.
In node ecosystem, joi is the most used library to validate data schemas, this can be used to generate and maintain API information up to date, without the need to update manually documentation.

## Installation

Using npm:

```shell
npm i --save ts-openapi
```

## OpenApi Supported Types and Samples per method

| Type                                         | Query   | Path (1)(6)  | Header | Cookie  | Body      |
| -------------------------------------------- | ------- | ---------    | ------ | ------- | --------- |
| String, String Enum, Email, Password         | YES     | YES          | YES    | YES     | NO (5)    |
| Integer, Integer Enum, Number, Number Enum   | YES     | YES          | YES    | YES     | NO (5)    |
| Date-time, Date                              | YES     | YES          | YES    | YES     | NO (5)    |
| Byte(3), Binary (string)                     | YES     | YES          | YES    | YES     | NO (5)    |
| Array[]                                      | YES (4) | NO           | NO     | NO      | NO (2)(5) |
| Object                                       | NO      | NO           | NO     | NO      | YES (7)(8)||
(1) Values included in url parameters are always required because they're part of the url.<br/>
(2) [Ajax bestpractices](https://cheatsheetseries.owasp.org/cheatsheets/AJAX_Security_Cheat_Sheet.html "OWASP CheatSheet's").<br/>
 (3) this type is a Base64 binary encoded string.<br/>
 (4) array of scalar values.<br/>
 (5) all scalar values, arrays of objects and other objects go inside json object.<br/>
 (6) the name of route parameters must be made up of “word characters” ([A-Za-z0-9_]).<br/>
 (7) GET requests don't have a body.<br/>
 (8) bodyRequest object must be always required.<br/>

Simple usage example in typescript (constructor default is ms, 3 decimals):

```ts
console.log('');
```

Sample output:

```text
Database too slow: details {"server":"host1","table":"customers","query":"select abc"} took more than 10µs
```
