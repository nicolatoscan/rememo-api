import databaseHelper from '../helpers/database.helper';

export async function cleanDb() {
    await databaseHelper.connect();
    (await databaseHelper.getDb().collections()).map(async c => await c.drop());
    await databaseHelper.getDb().createCollection('collections');
    await databaseHelper.getDb().createCollection('users');
    await databaseHelper.getDb().createCollection('collection-study-state');
    await databaseHelper.getDb().createCollection('stats');
    await databaseHelper.getDb().createCollection('tests');
    await databaseHelper.getDb().collection('collection-study-state').createIndex({ userId: 1, collectionId: 1 }, { unique: true });
    await databaseHelper.getDb().collection('stats').createIndex({ userId: 1, collectionId: 1 }, { unique: true });
    databaseHelper.closeConnection();
    console.log('DATABASE CLEANED');
}