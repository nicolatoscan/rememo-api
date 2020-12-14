import { assert } from 'chai';
import databaseHelper from '../../../../../source/helpers/database.helper';
import env from './_services-variables';
import * as userServices from '../../../../../source/api/v2/services/user.services';

export default function (): void {
    describe('User Services', function() {

        it('Should create a new user', async function() {
            this.timeout(20000);

            const res = await userServices.createUser({
                displayName: env.userInfo.displayName,
                email: env.userInfo.email,
                password: env.userInfo.password,
                username: env.userInfo.username
            });
            assert.isString(res?.id, 'Id not returned');
            assert.deepEqual(res?.user, {
                displayName: env.userInfo.displayName,
                email: env.userInfo.email,
                username: env.userInfo.username,
                settings: undefined,
                createdClasses: [],
                joinedClasses: []
            }, 'User not equal to the one inserted');


            const userFound = await databaseHelper.getCollection('users').findOne({
                displayName: env.userInfo.displayName,
                email: env.userInfo.email,
                username: env.userInfo.username
            });
            assert.isDefined(userFound, 'User not inserted');
            
            const userNotFound = await databaseHelper.getCollection('users').findOne({
                displayName: env.userInfo.displayName,
                email: env.userInfo.email,
                password: env.userInfo.password,
                username: env.userInfo.username
            });
            assert.isNull(userNotFound, 'Password not hashed');

            env.userInfo.userId = res?.id ?? '';
        });

        it('Should not create a new user with same username', async function() {
            this.timeout(20000);

            const res = await userServices.createUser({
                displayName: 'DisplayName',
                email: 'email@example.com',
                password: 'longpassword',
                username: 'uniqueUsername123'
            });
            assert.isNull(res, 'User returned is not null');

            const userFound = await databaseHelper.getCollection('users').find({
                displayName: 'DisplayName',
                email: 'email@example.com',
                username: 'uniqueUsername123'
            }).toArray();
            assert.equal(userFound.length, 1, 'User created with same username');
        });

        it('Should get a user by id', async function() {
            const res = await userServices.getUserById(env.userInfo.userId);
            assert.isDefined(res, 'User not returned');
            assert.deepEqual(res, {
                displayName: env.userInfo.displayName,
                email: env.userInfo.email,
                username: env.userInfo.username,
                settings: undefined,
                createdClasses: [],
                joinedClasses: []
            }, 'Some user properties are not correct');
        });

        it('Should get a user by username', async function() {
            const res = await userServices.getUserByUsername(env.userInfo.username);
            assert.isDefined(res, 'User not returned');
            assert.deepEqual(res, {
                displayName: env.userInfo.displayName,
                email: env.userInfo.email,
                username: env.userInfo.username,
                settings: undefined,
                createdClasses: [],
                joinedClasses: []
            }, 'Some user properties are not correct');
        });

        it('Should get a user document by id', async function() {
            const res = await userServices.getUserDoc(env.userInfo.userId);
            assert.equal(res?._id?.toString(), env.userInfo.userId);
            assert.equal(res?.email, env.userInfo.email);
            assert.equal(res?.username, env.userInfo.username);
            assert.equal(res?.createdClasses.length, 0);
            assert.equal(res?.joinedClasses.length, 0);
            assert.isNull(res?.deletedOn);
            assert.isDefined(res?.createdOn);
            assert.isDefined(res?.lastModified);
        });

        it('Should check password', async function() {
            assert.isTrue(
                await userServices.checkUserPasswordById(env.userInfo.userId, env.userInfo.password),
                'Correct password not accepted'
            );
            assert.isFalse(
                await userServices.checkUserPasswordById(env.userInfo.userId, 'wrong password'),
                'Wrong password accepted'
            );
        });

        it('Should login', async function() {
            const res = await userServices.login({
                username: env.userInfo.username,
                password: env.userInfo.password
            });
            assert.isNotNull(res, 'No user returned');
            assert.deepEqual(res, {
                id: env.userInfo.userId,
                user: {
                    email: env.userInfo.email,
                    displayName: env.userInfo.displayName,
                    username: env.userInfo.username,
                    createdClasses: [],
                    joinedClasses: [],
                    settings: undefined,
                }
            }, 'Some user properties of logged in user are wrong');
        });

        it('Should update user', async function() {

            const newUser = {
                password: env.userInfo.password,
                newPassword: 'newlongpassword',
                username: 'NewUsername',
                displayName: 'New DisplayName Wrong',
                email: 'newemail@example.com'
            };
            const wrongRes = await userServices.updateUserById(
                env.userInfo.userId,
                'Wrong password',
                newUser);
            assert.isFalse(wrongRes, 'User updated with wrong passwrod');

            newUser.displayName = 'New DisplayName';
            const res = await userServices.updateUserById(
                env.userInfo.userId,
                env.userInfo.password,
                newUser);
                
            assert.isTrue(res, 'User not updated with correct passwrod');
            env.userInfo.password = newUser.newPassword;
            env.userInfo.displayName = newUser.displayName;
            env.userInfo.email = newUser.email;
            
            const userFound = await databaseHelper.getCollection('users').find({
                displayName: env.userInfo.displayName,
                email: env.userInfo.email,
                username: env.userInfo.username
            }).toArray();
            assert.lengthOf(userFound, 1, 'Found 0 or more than 1 user matching the request');
            
            const checkPassword = await userServices.checkUserPasswordById(env.userInfo.userId, 'newlongpassword');
            assert.isTrue(checkPassword, 'New password not accepted');
        });

        it('Should delete the user', async function() {
            await userServices.deleteUserById(env.userInfo.userId, env.userInfo.password);
            const userFound = await databaseHelper.getCollection('users').find({
                username: env.userInfo.username
            }).toArray();
            assert.lengthOf(userFound, 0, 'Some user with same username found');
        });

    });
}
