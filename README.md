# Ts-openapi

An openapi json generator based on joi information about APIs that will help you to maintain your API documentation up to date.
In node ecosystem, joi is the most used library to validate data schemas, this can be used to generate and maintain API information up to date, without the need to update manually documentation.

## Installation

Using npm:

```shell
npm i --save @nelsongomes/ts-openapi
```

## OpenApi Supported Types and Samples per method

| Type                                         | Get | Params(1) | Header | Body   |
| -------------------------------------------- | --- | --------- | ------ | ------ |
| String, String Enum, Email, Password         | YES | YES       | YES    | YES    |
| Integer, Integer Enum, Number, Number Enum   | YES | YES       | YES    | YES    |
| Date-time, Date                              | YES | YES       | YES    | YES    |
| Byte(3), Binary (string)                     | YES | YES       | YES    | YES    |
| Array[]                                      | YES | YES       | YES    | NO (2) |
| Object                                       | YES | YES       | YES    | YES    |
(1) Values included in url parameters are always required because they're part of the url.<br/>
(2) [Ajax bestpractices](https://cheatsheetseries.owasp.org/cheatsheets/AJAX_Security_Cheat_Sheet.html "OWASP CheatSheet's").<br/>
 (3) this type is a Base64 binary encoded string.

Simple usage example in typescript (constructor default is ms, 3 decimals):

```ts
console.log('');
```

Sample output:

```text
Database too slow: details {"server":"host1","table":"customers","query":"select abc"} took more than 10µs
```
