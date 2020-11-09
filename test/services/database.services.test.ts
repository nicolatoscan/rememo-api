import databaseServices from '../../source/services/database.services';

export default function (): void {
    describe('Database services', function () {

        before(async function () {
            this.timeout(10000);
            await databaseServices.connect();
        });

        it('should get the connection', function() {
            databaseServices.getConnection();
        });

        it('should get the rememo DB', function() {
            databaseServices.getDb();
        });
        it('should get the collections', function() {
            databaseServices.getCollection('collections');
            databaseServices.getCollection('users');
        });

        after(function() {
            databaseServices.closeConnection();
        });

    });
}