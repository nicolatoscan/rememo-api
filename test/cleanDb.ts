import databaseHelper from '../source/helpers/database.helper';

export default async function cleanDb() {
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