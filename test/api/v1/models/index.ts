import getAuthTests from './Auth.test';
import getUserTests from './Users.test';

export default function(): void {
    describe('Models', function() {
        getAuthTests();
        getUserTests();
    });
}