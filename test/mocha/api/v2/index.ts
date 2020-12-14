import getModelsTests from './models';
import getServicesTests from './services';

export default function(): void {
    describe('V2', function() {
        getModelsTests();
        getServicesTests();
    });
}