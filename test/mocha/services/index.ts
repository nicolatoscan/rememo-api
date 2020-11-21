import databaseHelper from './database.services.test';

export default function(): void {
    describe('Services', function() {
        databaseHelper();
    });
}