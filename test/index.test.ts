import getPostmanTests from './postman';
import getMochaTests from './mocha';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.test' });

describe('Tests', function() {
    getMochaTests();
    getPostmanTests();
});