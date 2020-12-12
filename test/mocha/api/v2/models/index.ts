import getAuthTests from './Auth.test';
import getUserTests from './Users.test';
import getCollectionTests from './Collection.test';

export default function(): void {
    describe('Models', function() {
        getAuthTests();
        getUserTests();
        getCollectionTests();
    });
}