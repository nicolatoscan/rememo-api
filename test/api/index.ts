import getV1Tests from './v1';

export default function(): void {
    describe('API', function() {
        getV1Tests();
    });
}