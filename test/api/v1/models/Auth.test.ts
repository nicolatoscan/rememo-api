import { assert } from 'chai';
import * as AuthModels from '../../../../source/api/v1/models/Auth';

export default function (): void {
    describe('Auth', function () {
        it('should validate Login user', function() {
            const users: AuthModels.LoginUser[] = [{
                username: 'correctUsername',
                password: 'LongPassword'
            }];

            for (const u of users) {
                const res = AuthModels.validateLoginUser(u);
                assert.isUndefined(res.error, res.error);
                assert.deepEqual(u, res.value, 'Object not equal to source object');
            }
        });

        it('should not validate Login user', function() {
            const users: unknown[] = [{
                username: 'correctUsername',
                password: 'sh pw'
            }, {
                username: 'sh pw',
                password: 'LongPassword'
            }, {
                username: 'sh pw',
                password: 'LongPassword',
                invalidProp: true
            },{
                username: 'missingprop'
            }];

            for (const u of users) {
                const res = AuthModels.validateLoginUser(u);
                assert.isString(res.error, `No error string returned on ${JSON.stringify(u)}`);
                assert.isUndefined(res.value, 'Returned incorrect value');
            }
        });

        it('should validate Signup user', function() {
            const users: AuthModels.SignupUser[] = [{
                username: 'correctUsername',
                password: 'LongPassword',
                displayName: 'correct display name',
                email: 'correct@email.com'
            }];

            for (const u of users) {
                const res = AuthModels.validateSignupUser(u);
                assert.isUndefined(res.error, res.error);
                assert.deepEqual(u, res.value, 'Object not equal to source object');
            }
        });

        it('should not validate Signup user', function() {
            const users: unknown[] = [{
                username: 'correctUsername',
                password: 'sh ps',
                displayName: 'correct display name',
                email: 'correct@email.com'
            }, {
                username: 'correctUsername',
                password: 'LongPassword',
                displayName: 'sh dn',
                email: 'correct@email.com'
            },{
                username: 'correctUsername',
                password: 'LongPassword',
                displayName: 'correct display name',
                email: 'notanemail'
            },{
                username: 'missing prop',
            },{
                username: 'correctUsername',
                password: 'LongPassword',
                displayName: 'correct display name',
                email: 'correct@email.com',
                additional: true
            }];

            for (const u of users) {
                const res = AuthModels.validateSignupUser(u);
                assert.isString(res.error, `No error string returned on ${JSON.stringify(u)}`);
                assert.isUndefined(res.value, 'Returned incorrect value');
            }
        });

        it('should create a db user document', function() {
            const users: AuthModels.SignupUser[] = [{
                username: 'correctUsername',
                password: 'LongPassword',
                displayName: 'correct display name',
                email: 'correct@email.com'
            }];

            for (const u of users) {
                const res = AuthModels.createDBUserDoc(u, 'hashed');
                assert.isNull(res.deletedOn);
                assert.equal(res.displayName, u.displayName);
                assert.equal(res.email, u.email);
                assert.equal(res.username, u.username);
                assert.equal(res.password,  'hashed');
                assert.notEqual(res.password, u.password);
            }

        });
    });
}