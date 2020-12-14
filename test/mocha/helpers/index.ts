import databaseHelper from './database.helper.test';

export default function(): void {
    describe('Services', function() {
        databaseHelper();
    });
}