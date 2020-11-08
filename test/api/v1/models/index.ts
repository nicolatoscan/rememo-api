import getAuthTests from './Auth.test';

export default function(): void {
    describe('Models', function() {
        getAuthTests();
    });
}