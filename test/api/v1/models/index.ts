import getAuthTests from './Auth.test';
import getCollectionTests from './Collection.test';

export default function(): void {
    describe('Models', function() {
        getAuthTests();
        getCollectionTests();
    });
}