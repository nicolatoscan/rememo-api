import getServicesTests from './services';
import getApiTests from './api';
import dotenv from 'dotenv';
import databaseServices from '../../source/services/database.services';
dotenv.config({ path: './.env.test' });

describe('Test', function() {

    // CLEAN DB
    before(async function() {
        this.timeout(20000);
        await databaseServices.connect();
        await databaseServices.getCollection('collections').drop();
        await databaseServices.getCollection('users').drop();
        await databaseServices.getCollection('collection-study-state').drop();
        await databaseServices.getDb().createCollection('collections');
        await databaseServices.getDb().createCollection('users');
        await databaseServices.getDb().createCollection('collection-study-state');
        databaseServices.closeConnection();
        console.log('DATABASE CLEANED');
    });

    getServicesTests();
    getApiTests();
});