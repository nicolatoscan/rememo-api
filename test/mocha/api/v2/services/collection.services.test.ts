import { assert } from 'chai';
import databaseHelper from '../../../../../source/helpers/database.helper';
import env from './_services-variables';
import * as collectionServices from '../../../../../source/api/v2/services/collection.services';
import * as userServices from '../../../../../source/api/v2/services/user.services';
import { ObjectId } from 'mongodb';

export default function (): void {
    describe('Collection Services', function () {

        before(async function () {
            const user = await userServices.createUser({
                username: env.userInfo.username,
                displayName: env.userInfo.displayName,
                email: env.userInfo.email,
                password: env.userInfo.password
            });
            env.userInfo.userId = user?.id ?? '';
        });

        it('Should create a collection', async function () {

            const collectionId = (await collectionServices.createCollection({
                name: env.collectionInfo.name,
                description: env.collectionInfo.description,
                languageTo: env.collectionInfo.languageTo,
                languageFrom: env.collectionInfo.languageFrom,
                index: env.collectionInfo.index,
                words: [{
                    index: env.collectionInfo.words[0].index,
                    original: env.collectionInfo.words[0].original,
                    translation: env.collectionInfo.words[0].translation,
                    languageFrom: env.collectionInfo.words[0].languageFrom,
                    languageTo: env.collectionInfo.words[0].languageTo
                }]
            }, env.userInfo.userId)).collectionId;

            const collectionWithoutLangId = (await collectionServices.createCollection({
                name: env.collectionInfo.name,
                description: env.collectionInfo.description,
                index: env.collectionInfo.index,
                words: [{
                    index: env.collectionInfo.words[0].index,
                    original: env.collectionInfo.words[0].original,
                    translation: env.collectionInfo.words[0].translation,
                }]
            }, env.userInfo.userId)).collectionId;

            env.collectionInfo.collectionId = collectionId.toString();
            env.collectionInfo.collectionWithoutLangId = collectionWithoutLangId.toString();

            const collectionInserted = await databaseHelper.getCollection('collections').findOne({
                _id: new ObjectId(collectionId),
            });
            const collectionWithoutLangInserted = await databaseHelper.getCollection('collections').findOne({
                _id: new ObjectId(collectionWithoutLangId),
            });

            assert.equal(collectionInserted._id.toString(), collectionId);
            assert.equal(collectionInserted.name, env.collectionInfo.name);
            assert.equal(collectionInserted.description, env.collectionInfo.description);
            assert.equal(collectionInserted.owner.toString(), env.userInfo.userId);
            assert.equal(collectionInserted.languageTo, env.collectionInfo.languageTo);
            assert.equal(collectionInserted.languageFrom, env.collectionInfo.languageFrom);
            assert.equal(collectionInserted.share, false);
            assert.isDefined(collectionInserted.words[0]._id);
            assert.deepEqual(collectionInserted.words[0].original, env.collectionInfo.words[0].original);
            assert.deepEqual(collectionInserted.words[0].translation, env.collectionInfo.words[0].translation);
            assert.deepEqual(collectionInserted.words[0].languageFrom, env.collectionInfo.words[0].languageFrom);
            assert.deepEqual(collectionInserted.words[0].languageTo, env.collectionInfo.words[0].languageTo);

            assert.equal(collectionWithoutLangInserted._id.toString(), collectionWithoutLangId);
            assert.equal(collectionWithoutLangInserted.name, env.collectionInfo.name);
            assert.equal(collectionWithoutLangInserted.description, env.collectionInfo.description);
            assert.equal(collectionWithoutLangInserted.owner.toString(), env.userInfo.userId);
            assert.isNull(collectionWithoutLangInserted.languageTo);
            assert.isNull(collectionWithoutLangInserted.languageFrom);
            assert.equal(collectionWithoutLangInserted.share, false);
            assert.isDefined(collectionWithoutLangInserted.words[0]._id);
            assert.deepEqual(collectionWithoutLangInserted.words[0].original, env.collectionInfo.words[0].original);
            assert.deepEqual(collectionWithoutLangInserted.words[0].translation, env.collectionInfo.words[0].translation);
            assert.isNull(collectionWithoutLangInserted.words[0].languageFrom);
            assert.isNull(collectionWithoutLangInserted.words[0].languageTo);

            env.collectionInfo.words[0].wordId = collectionInserted.words[0]._id.toString();
        });

        it('Should have created a study document', async function () {
            const studyDoc = await databaseHelper.getCollection('collection-study-state').findOne({
                collectionId: new ObjectId(env.collectionInfo.collectionId),
                userId: new ObjectId(env.userInfo.userId)
            });
            const studyDocWithoutLang = await databaseHelper.getCollection('collection-study-state').findOne({
                collectionId: new ObjectId(env.collectionInfo.collectionWithoutLangId),
                userId: new ObjectId(env.userInfo.userId)
            });

            assert.isNotNull(studyDoc);
            assert.isNotNull(studyDocWithoutLang);

            assert.equal(studyDoc.collectionId.toString(), env.collectionInfo.collectionId);
            assert.equal(studyDoc.userId.toString(), env.userInfo.userId);
            assert.equal(studyDoc.score, 0);
            assert.equal(studyDoc.counter, 0);
            assert.equal(studyDoc.lastDoneCorrectCounter, 0);
            assert.isDefined(studyDoc.createdOn);
            assert.isDefined(studyDoc.lastModified);
            assert.lengthOf(studyDoc.wordsState, 1, 'Lenght of words different in study doc');
            assert.equal(studyDoc.wordsState[0].wordId.toString(), env.collectionInfo.words[0].wordId);
            assert.equal(studyDoc.wordsState[0].learned, 0);
            assert.equal(studyDoc.wordsState[0].score, 0);
            assert.equal(studyDoc.wordsState[0].lastDoneCounter, 0);
            assert.equal(studyDoc.wordsState[0].lastDoneCorrectCounter, 0);
        });

        it('Should have created a stats document', async function () {
            const stats = await databaseHelper.getCollection('stats').findOne({
                collectionId: new ObjectId(env.collectionInfo.collectionId),
                userId: new ObjectId(env.userInfo.userId)
            });
            const statsWithoutLang = await databaseHelper.getCollection('stats').findOne({
                collectionId: new ObjectId(env.collectionInfo.collectionWithoutLangId),
                userId: new ObjectId(env.userInfo.userId)
            });

            assert.isNotNull(stats);
            assert.isNotNull(statsWithoutLang);

            assert.equal(stats.collectionId.toString(), env.collectionInfo.collectionId);
            assert.equal(stats.userId.toString(), env.userInfo.userId);
            assert.equal(stats.correctTrain, 0);
            assert.equal(stats.wrongTrain, 0);
            assert.equal(stats.correctTest, 0);
            assert.equal(stats.wrongTest, 0);
            assert.isDefined(stats.createdOn);
            assert.isDefined(stats.lastModified);
            assert.lengthOf(stats.words, 1);
            assert.equal(stats.words[0].wordId.toString(), env.collectionInfo.words[0].wordId);
            assert.lengthOf(stats.words[0].days, 0);
            assert.equal(stats.words[0].correctTrain, 0);
            assert.equal(stats.words[0].wrongTrain, 0);
            assert.equal(stats.words[0].correctTest, 0);
            assert.equal(stats.words[0].wrongTest, 0);
        });

        it('Should get the collection by id', async function () {
            const coll = await collectionServices.getCollectionById(env.collectionInfo.collectionId, env.userInfo.userId);
            assert.isNotNull(coll, 'No collection returned');

            if (coll) {
                coll._id = coll?._id?.toString();
                coll.owner = coll?.owner?.toString();
            }
            
            assert.deepEqual(coll, {
                _id: env.collectionInfo.collectionId,
                owner: env.userInfo.userId,
                index: env.collectionInfo.index,
                name: env.collectionInfo.name,
                description: env.collectionInfo.description,
                languageFrom: env.collectionInfo.languageFrom,
                languageTo: env.collectionInfo.languageTo,
                share: false,
                words: [
                    {
                        _id: env.collectionInfo.words[0].wordId,
                        index: 0,
                        original: env.collectionInfo.words[0].original,
                        translation: env.collectionInfo.words[0].translation,
                        languageFrom: env.collectionInfo.words[0].languageFrom,
                        languageTo: env.collectionInfo.words[0].languageTo
                    }
                ]
            });
        });

        it('Should update the collection', async function() {

            env.collectionInfo.name = 'new name';
            env.collectionInfo.description = 'new description';
            await collectionServices.updateCollectionById(env.collectionInfo.collectionId, env.userInfo.userId, {
                name: env.collectionInfo.name,
                description: env.collectionInfo.description
            });

            const coll = await collectionServices.getCollectionById(env.collectionInfo.collectionId, env.userInfo.userId);
            assert.isNotNull(coll, 'No collection returned');
            if (coll) {
                assert.equal(coll.name, env.collectionInfo.name);
                assert.equal(coll.description, env.collectionInfo.description);
            }

        });


    });
}
