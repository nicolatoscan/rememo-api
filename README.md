[![Build Status](https://travis-ci.org/nicolatoscan/rememo-api.svg?branch=main)](https://travis-ci.org/nicolatoscan/rememo-api)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/nicolatoscan/rememo-api/blob/master/LICENSE)
![ts](https://badgen.net/badge/Built%20With/TypeScript/blue)
# Rememo API

Project: Rememo<br>
Group ID: #13<br>
Alessio Gandelli - [alessiogandelli](https://github.com/alessiogandelli)<br>
Mattia Salvador - [MattiaSalvador201506](https://github.com/MattiaSalvador201506)<br>
Nicola Toscan - [nicolatoscan](https://github.com/nicolatoscan)<br>
Taras Rashkevych - [TarasRashkevych99](https://github.com/TarasRashkevych99)

## Overview
This project consists of an [express](https://expressjs.com/) rest API server written in Typescript.

## Web Application
A web application that uses this API is being developed at https://github.com/nicolatoscan/rememo-webapp <br>
A live demo is available at https://rememo.nicolatoscan.dev <br>
You can find there a README and wiki on how it's being developed.

## Live demo
A live demo is available at https://rememo-api.herokuapp.com/

## API documentation
API documentation available at https://rememoapi.docs.apiary.io/

## How to demo on your machine
Make sure you have installed [Node.js](https://nodejs.org/en/).<br>
This project was developed with Node v15 and tested on Ubuntu and Windows.

Clone the repository on your machine.
```bash
git clone https://github.com/nicolatoscan/rememo-api.git
```

Inside the `rememo-api` folder install the necessary dependencies and transpile the typescript .
```bash
npm install
```

Create a file called `.env` using the `.env.example` template file.<br>
You can create a similar file called `.env.test` that will be used during tests.<br>
IMPORTANT! The content of the DEFAULT_DB in the `.env.test` will be wiped every time the tests are run.<br>
Here's an example of a `.env` or `.env.test` file.

```
PORT=3000
DEFAULT_DB=rememo
MONGODB_CONNECTION_STRING=<insert-your-connection-string>
TOKEN_SECRET=<a-token-secret>
CRYPTO_SECRET=<crypto-secret>
```

Run the application:
```bash
npm run start
```

## Run with docker
From the repository a docker image is automatically created using `Dockerfile`.<br>
The project can be run in a docker container using the same `.env` described before with:
```bash
docker run -p 3000:3000 --env-file ./.env nicolatoscan/rememo-api
```

## Tests
IMPORTANT! The test will wipe the database, check you are using the `.env.test` variables.<br>
Tests for the code are made using the [Mocha](https://mochajs.org/) test framework and can be run with:
```bash
npm run test:mocha:start
```

Tests for the running API are made using [Newman](https://www.npmjs.com/package/newman), a command-line collection runner for [Postman](https://www.postman.com/), and can be run with:
```bash
npm run test:postman
```
The postman tests will make an http call to the endpoint specified in `test/postman/Rememo.postman_environment.json`, so the application must be running. We suggest to run the application with the `.env.test` variables, so a test database can be used. Remember that the test will wipe the database.<br>
You can start you application with the `.env.test` variables using:
```bash
npm run start:test
```

Both tests can be run with:
```bash
npm test
```

## npm scripts
The application comes with several npm scripts:
* `npm run serve` - Transpile and run the application in one command
* `npm run start` - Start the application from the transpiled file
* `npm run serve:test` - Transpile and run the application in one command using the `.env.test` variables
* `npm run start:test` - Start the application from the transpiled file using the `.env.test` variables
* `npm run transpile` - Transpile the typescript file to javascript
* `npm run start:test` - Run all the tests
* `npm run test:postman` - Run the Postman tests
* `npm run test:mocha:start` - Run the Mocha tests
* `npm run test:mocha:serve` - Transpile and run the Mocha tests
* `npm run test` - Transpile the application and run all the tests
