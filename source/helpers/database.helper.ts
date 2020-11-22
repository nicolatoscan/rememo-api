import { Collection, Db, MongoClient } from 'mongodb';

class DatabaseHelper {
    private static instance: DatabaseHelper;
    private connection: MongoClient | null = null;
    constructor() {
        if (DatabaseHelper.instance) {
            return DatabaseHelper.instance;
        }
        DatabaseHelper.instance = this;
    }

    public async connect(): Promise<MongoClient> {
        this.connection = await (new MongoClient(process.env.MONGODB_CONNECTION_STRING as string, { useUnifiedTopology: true }).connect());
        return this.connection;
    }

    public getConnection(): MongoClient {
        if (this.connection === null) {
            throw new Error('Connection not found');
        }
        return this.connection;
    }

    public closeConnection(): void {
        this.connection?.close();
        this.connection = null;
    }

    public getDb(db: string = process.env.DEFAULT_DB as string): Db {
        if (this.connection === null) {
            throw new Error('Connection not found');
        }
        return this.connection?.db(db);
    }

    public getCollection(
        collection: 'users' | 'collections' | 'collection-study-state'
    ): Collection {
        return this.getDb().collection(collection);
    }

}

export default new DatabaseHelper();
