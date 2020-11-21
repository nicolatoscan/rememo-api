import getServicesTests from './services';
import getApiTests from './api';
import dotenv from 'dotenv';
import databaseHelper from '../../source/helpers/database.helper';
dotenv.config({ path: './.env.test' });

describe('Test', function() {

    // CLEAN DB
    before(async function() {
        this.timeout(20000);
        await databaseHelper.connect();
        await databaseHelper.getCollection('collections').drop();
        await databaseHelper.getCollection('users').drop();
        await databaseHelper.getCollection('collection-study-state').drop();
        await databaseHelper.getDb().createCollection('collections');
        await databaseHelper.getDb().createCollection('users');
        await databaseHelper.getDb().createCollection('collection-study-state');
        databaseHelper.closeConnection();
        console.log('DATABASE CLEANED');
    });

    getServicesTests();
    getApiTests();
});