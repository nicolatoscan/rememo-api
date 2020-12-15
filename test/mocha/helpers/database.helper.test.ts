import databaseHelper from '../../../source/helpers/database.helper';

export default function (): void {
    describe('Database helpers', function () {

        before(async function () {
            this.timeout(10000);
            await databaseHelper.connect();
        });

        it('should get the connection', function() {
            databaseHelper.getConnection();
        });

        it('should get the rememo DB', function() {
            databaseHelper.getDb();
        });
        it('should get the collections', function() {
            databaseHelper.getCollection('collections');
            databaseHelper.getCollection('users');
        });

        after(function() {
            databaseHelper.closeConnection();
        });

    });
}