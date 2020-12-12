import { assert } from 'chai';
import * as UserModels from '../../../../../source/api/v1/models/User';

export default function (): void {
    describe('User', function () {


        it('should validate get logged user', function() {
            const users: unknown[] = [{
                username: 'TestUsername',
                displayName : 'carlo pippo',
                email: 'mail@mail.com',
            }];

            for (const u of users) {
                const res = UserModels.validateUser(u);
                assert.isUndefined(res.error, res.error);
                assert.deepEqual(u, res.value, 'Object not equal to source object');
            } 
        });

        it('should not validate get logged user', function() {
            const users: unknown[] = [{
                username: 't',
                displayName : 'carlo pippo',
                email: 'mail@mail.com',
                password: 'password'
            },{
                username: 'TestUsername',
                displayName : 'ca',
                email: 'mail@mail.com',
                password: 'password'
            },{
                username: 'TestUsername',
                displayName : 'carlo pippo',
                email: 'mail@mail.com',
                password: 'pippo'
            },{
                username: 'TestUsername',
                displayName : 'carlo pippo',
                email: 'mail@mail.com',
                password: 'pippo'
            }];

            for (const u of users) {
                const res = UserModels.validateUser(u);
                assert.isString(res.error, `No error string returned on ${JSON.stringify(u)}`);
                assert.isUndefined(res.value, 'Returned incorrect value');
            } 
        });


    });
}