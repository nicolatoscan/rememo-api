import { assert } from 'chai';
import env from './_services-variables';
import * as Models from '../../../../../source/api/v2/models';
import * as collectionServices from '../../../../../source/api/v2/services/collection.services';
import * as userServices from '../../../../../source/api/v2/services/user.services';
import * as classServices from '../../../../../source/api/v2/services/class.services';
import * as learnServices from '../../../../../source/api/v2/services/study.services/learn.services';

export default function (): void {


    enum EOrderClass {
        JoinClassBeforeAddCollection = 'JoinClassBeforeAddCollection', AddCollectionBeforeJoinClass = 'AddCollectionBeforeJoinClass'
    }

    describe('Stats Services', function () {

        let counterUsername = 0;
        async function setUpUserWithCollectionWithWord(order: EOrderClass) {
            env.userInfo.username = `statUsername${counterUsername++}`;
            const user = await userServices.createUser({
                username: env.userInfo.username,
                displayName: env.userInfo.displayName,
                email: env.userInfo.email,
                password: env.userInfo.password
            });
            assert.isString(user?.id, 'User not created');
            env.userInfo.userId = user?.id ?? '';


            env.studentInfo.username = `statUsername${counterUsername++}`;
            const student = await userServices.createUser({
                username: env.studentInfo.username,
                displayName: env.studentInfo.displayName,
                email: env.studentInfo.email,
                password: env.studentInfo.password
            });
            assert.isString(student?.id, 'Student not created');
            env.studentInfo.userId = student?.id ?? '';

            const coll: Models.Collection = {
                description: env.collectionInfo.description,
                name: env.collectionInfo.name,
                index: 1,
                words: [{
                    index: 1,
                    original: env.collectionInfo.words[0].original,
                    translation: env.collectionInfo.words[0].translation
                }]
            };
            const collId = (await collectionServices.createCollection(coll, env.userInfo.userId)).collectionId;
            assert.isString(collId, 'Collection not created');
            const collIdSt = (await collectionServices.createCollection(coll, env.studentInfo.userId)).collectionId;
            assert.isString(collIdSt, 'Student collection not created');
            env.collectionInfo.collectionId = collId;
            env.studentInfo.collectionId = collId;
            const wordId = (await collectionServices.getCollectionById(collId, env.userInfo.userId))?.words[0]._id;
            assert.isString(wordId?.toString(), 'Word not created');
            env.collectionInfo.words[0].wordId = wordId?.toString() ?? '';

            const classId = (await classServices.createClass(env.userInfo.userId, {
                _id: '', collections: [], name: env.userInfo.studyClass.name
            })).studyClassId;
            assert.isString(classId, 'Class not created');
            env.userInfo.studyClass.id = classId;

            if (order === EOrderClass.JoinClassBeforeAddCollection) {
                await classServices.joinClass(env.studentInfo.userId, env.userInfo.studyClass.id);
                await classServices.addCollectionToClass(env.userInfo.userId, env.userInfo.studyClass.id, env.collectionInfo.collectionId);
            } else {
                await classServices.addCollectionToClass(env.userInfo.userId, env.userInfo.studyClass.id, env.collectionInfo.collectionId);
                await classServices.joinClass(env.studentInfo.userId, env.userInfo.studyClass.id);
            }
        }

        it('Should learn a word', async function () {
            this.timeout(10000);
            for (const order of [EOrderClass.JoinClassBeforeAddCollection, EOrderClass.AddCollectionBeforeJoinClass]) {
                const value = Math.random();
                await setUpUserWithCollectionWithWord(order);

                for (const userId of [env.userInfo.userId, env.studentInfo.userId]) {
                    await learnServices.updateWordLearnState(
                        env.collectionInfo.collectionId,
                        userId,
                        env.collectionInfo.words[0].wordId,
                        value
                    );

                    const resValue = (await learnServices.getCollectionLearnState(
                        env.collectionInfo.collectionId,
                        userId
                    ))?.find(w => w.wordId.toHexString() === env.collectionInfo.words[0].wordId)?.learned;

                    assert.equal(resValue, value, `Value found different from original when ${order} on ${env.userInfo.userId === userId ? 'user': 'student'}`);
                }
            }
        });

        it('Should learn a word', async function () {
            this.timeout(10000);
            for (const order of [EOrderClass.JoinClassBeforeAddCollection, EOrderClass.AddCollectionBeforeJoinClass]) {
                const value = Math.random();
                await setUpUserWithCollectionWithWord(order);

                for (const userId of [env.userInfo.userId, env.studentInfo.userId]) {
                    await learnServices.updateWordLearnState(
                        env.collectionInfo.collectionId,
                        userId,
                        env.collectionInfo.words[0].wordId,
                        value
                    );

                    (await learnServices.resetCollectionLearnState(
                        env.collectionInfo.collectionId,
                        userId
                    ));

                    const resValue = (await learnServices.getCollectionLearnState(
                        env.collectionInfo.collectionId,
                        userId
                    ))?.find(w => w.wordId.toHexString() === env.collectionInfo.words[0].wordId)?.learned;

                    assert.equal(resValue, 0, `Value not 0 when ${order} on ${env.userInfo.userId === userId ? 'user': 'student'}`);
                }
            }

        });

    });

}