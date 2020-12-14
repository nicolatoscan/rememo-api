import getServicesTests from './helpers';
import getApiTests from './api';
import dotenv from 'dotenv';
import databaseHelper from '../../source/helpers/database.helper';
dotenv.config({ path: './.env.test' });

describe('Test', function() {

    async function cleanDb() {
        await databaseHelper.connect();
        (await databaseHelper.getDb().collections()).map(async c => await c.drop());
        await databaseHelper.getDb().createCollection('collections');
        await databaseHelper.getDb().createCollection('users');
        await databaseHelper.getDb().createCollection('collection-study-state');
        await databaseHelper.getDb().createCollection('stats');
        await databaseHelper.getDb().createCollection('tests');
        databaseHelper.closeConnection();
        console.log('DATABASE CLEANED');
    }

    before(async function() {
        this.timeout(20000);
        await cleanDb();
    });

    after(async function() {
        this.timeout(20000);
        await cleanDb();
    });

    getServicesTests();
    getApiTests();
});