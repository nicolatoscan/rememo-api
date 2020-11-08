import assert from 'assert';
import getServicesTests from './services';
import getApiTests from './api';
import dotenv from 'dotenv';
dotenv.config();


describe('Test', function() {
    it('First test', function() {
        assert(true);
    });
    getServicesTests();
    getApiTests();
});