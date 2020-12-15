import { Collection, Db, MongoClient } from 'mongodb';

let connection: MongoClient | null = null;
async function connect(): Promise<MongoClient> {
    connection = await (new MongoClient(process.env.MONGODB_CONNECTION_STRING as string, { useUnifiedTopology: true }).connect());
    return connection;
}

function getConnection(): MongoClient {
    if (connection === null) {
        throw new Error('Connection not found');
    }
    return connection;
}

function closeConnection(): void {
    connection?.close();
    connection = null;
}

function getDb(db: string = process.env.DEFAULT_DB as string): Db {
    if (connection === null) {
        throw new Error('Connection not found');
    }
    return connection?.db(db);
}

function getCollection(
    collection: 'users' | 'collections' | 'collection-study-state' | 'tests' | 'stats'
): Collection {
    return getDb().collection(collection);
}

export default {
    connect: connect,
    getConnection: getConnection,
    closeConnection: closeConnection,
    getDb: getDb,
    getCollection: getCollection,
};

