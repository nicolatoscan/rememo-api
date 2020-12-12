import getV1Tests from './v1';
import getV2Tests from './v2';

export default function(): void {
    describe('API', function() {
        getV1Tests();
        getV2Tests();
    });
}