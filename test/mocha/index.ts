import getHelpersTests from './helpers';
import getApiTests from './api';
import { cleanDb } from '../../source/utils/misc.utils';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.test' });

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