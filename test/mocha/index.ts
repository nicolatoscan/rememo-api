import getHelpersTests from './helpers';
import getApiTests from './api';
import { cleanDb } from '../../source/utils/misc.utils';

export default function() {
    describe('Mocha Tests', function() {

        before(async function() {
            this.timeout(20000);
            await cleanDb();
        });

        getHelpersTests();
        getApiTests();

    });
}