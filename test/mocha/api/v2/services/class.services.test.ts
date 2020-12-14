import { ObjectId } from 'mongodb';
import { assert } from 'chai';
import databaseHelper from '../../../../../source/helpers/database.helper';
import env from './_services-variables';
import * as Models from '../../../../../source/api/v2/models';
import * as collectionServices from '../../../../../source/api/v2/services/collection.services';
import * as userServices from '../../../../../source/api/v2/services/user.services';
import * as classServices from '../../../../../source/api/v2/services/class.services';


export default function (): void {
    describe('Class Services', function () {

        before(async function() {
            env.userInfo.username = 'classUsername';
            const user = await userServices.createUser({
                username: env.userInfo.username,
                displayName: env.userInfo.displayName,
                email: env.userInfo.email,
                password: env.userInfo.password
            });
            env.userInfo.userId = user?.id ?? '';

            env.studentInfo.username = 'classStudentUsername';
            const student = await userServices.createUser({
                username: env.studentInfo.username,
                displayName: env.studentInfo.displayName,
                email: env.studentInfo.email,
                password: env.studentInfo.password
            });
            env.studentInfo.userId = student?.id ?? '';

            const coll = {
                description: env.collectionInfo.description,
                name: env.collectionInfo.name,
                index: 1,
                words: []
            };
            const collId = (await collectionServices.createCollection(coll, env.userInfo.userId)).collectionId;
            const studentCollId = (await collectionServices.createCollection(coll, env.userInfo.userId)).collectionId;
            env.collectionInfo.collectionId = collId;
            env.studentInfo.collectionId = studentCollId;
        });

        it('Should create a class', async function() {
            const studyClassId = (await classServices.createClass(env.userInfo.userId, {
                name: env.userInfo.studyClass.name,
                collections: [],
                _id: ''
            })).studyClassId;

            const studentStudyClassId = (await classServices.createClass(env.studentInfo.userId, {
                name: env.studentInfo.studyClass.name,
                collections: [],
                _id: ''
            })).studyClassId;

            const userWithClass = await databaseHelper.getCollection('users').findOne({
                _id: new ObjectId(env.userInfo.userId),
                'createdClasses.name': env.userInfo.studyClass.name,
                'createdClasses._id': new ObjectId(studyClassId)
            }) as Models.DBUserDoc;
            env.userInfo.studyClass.id = userWithClass.createdClasses[0]._id.toString();
            assert.isNotNull(userWithClass, 'Class inserted not found');

            const studentWithClass = await databaseHelper.getCollection('users').findOne({
                _id: new ObjectId(env.studentInfo.userId),
                'createdClasses.name': env.studentInfo.studyClass.name,
                'createdClasses._id': new ObjectId(studentStudyClassId)
            });
            env.studentInfo.studyClass.id = studentWithClass.createdClasses[0]._id.toString();
            assert.isNotNull(studentWithClass, 'Class inserted not found');
        });

        it('Should get classes from ids', async function() {
            const studyClasses = await classServices.getClassesFromIds([new ObjectId(env.userInfo.studyClass.id)]);
            assert.lengthOf(studyClasses, 1, 'Not one class was returned');
            assert.equal(studyClasses[0]._id.toString(), env.userInfo.studyClass.id, 'Class od doesn\'t match');
        });

        it('Should get a class by id', async function() {
            const studyClass = await classServices.getFullClassById(env.userInfo.userId, env.userInfo.studyClass.id);
            assert.isNotNull(studyClass, 'Class not returned');
            assert.equal(studyClass?._id.toString(), env.userInfo.studyClass.id, 'Id is not equal');
            assert.equal(studyClass?.name, env.userInfo.studyClass.name, 'Name is not equal');
        });

        it('Should update a class by id', async function() {
            env.userInfo.studyClass.name = 'new name';
            await classServices.updateClassById(env.userInfo.userId, env.userInfo.studyClass.id, {
                _id: '',
                collections: [],
                name: env.userInfo.studyClass.name
            });
            const studentWithClass = await databaseHelper.getCollection('users').findOne({
                _id: new ObjectId(env.userInfo.userId),
                'createdClasses.name': env.userInfo.studyClass.name,
                'createdClasses._id': new ObjectId(env.userInfo.studyClass.id)
            });
            env.studentInfo.studyClass.id = studentWithClass.createdClasses[0]._id.toString();
            assert.isNotNull(studentWithClass.createdClasses[0].name, env.userInfo.studyClass.name);
        });

        it('Should not update a class by id', async function() {
            await classServices.updateClassById(env.studentInfo.userId, env.userInfo.studyClass.id, {
                _id: '',
                collections: [],
                name: 'new new name'
            });
            const u = await databaseHelper.getCollection('users').findOne({
                _id: new ObjectId(env.userInfo.userId),
                'createdClasses.name': 'new new name',
                'createdClasses._id': new ObjectId(env.userInfo.studyClass.id)
            });
            assert.isNull(u, 'Class modified without authorization');
        });

        it('Should join a class', async function() {
            await classServices.joinClass(env.studentInfo.userId, env.userInfo.studyClass.id);
            await classServices.joinClass(env.studentInfo.userId, env.userInfo.studyClass.id);
            const u = await databaseHelper.getCollection('users').findOne({
                _id: new ObjectId(env.studentInfo.userId),
                'joinedClasses': new ObjectId(env.userInfo.studyClass.id)
            }) as Models.DBUserDoc;
            assert.isNotNull(u, 'User didn\'t join the class');
            assert.lengthOf(u.joinedClasses, 1, 'Joined class possibly duplocate');
        });

        it('Should leave a class', async function() {
            await classServices.leaveClass(env.studentInfo.userId, env.userInfo.studyClass.id);
            await classServices.leaveClass(env.studentInfo.userId, env.userInfo.studyClass.id);
            const u = await databaseHelper.getCollection('users').findOne({
                _id: new ObjectId(env.studentInfo.userId),
                'joinedClasses': new ObjectId(env.userInfo.studyClass.id)
            }) as Models.DBUserDoc;
            assert.isNull(u, 'User didn\'t leave the class');
        });

        it('Should kick from class a class', async function() {
            await classServices.joinClass(env.studentInfo.userId, env.userInfo.studyClass.id);
            await classServices.kickStudentFromClass(env.userInfo.userId, env.userInfo.studyClass.id, env.studentInfo.userId);
            const u = await databaseHelper.getCollection('users').findOne({
                _id: new ObjectId(env.studentInfo.userId),
                'joinedClasses': new ObjectId(env.userInfo.studyClass.id)
            }) as Models.DBUserDoc;
            assert.isNull(u, 'User wasn\'t kicked from the class');
        });

        it('Should add collection to class', async function() {
            await classServices.joinClass(env.studentInfo.userId, env.userInfo.studyClass.id);
            await classServices.addCollectionToClass(env.userInfo.userId, env.userInfo.studyClass.id, env.collectionInfo.collectionId);
            const colls = await collectionServices.getCollections(true, env.studentInfo.userId, Models.EClassOwnershipType.Joined, [env.userInfo.studyClass.id]);
            assert.lengthOf(colls, 1, 'Not one collection returned');
            assert.isUndefined((colls[0] as any).words, 'Collection is not minified');
            assert.equal(colls[0]._id?.toString(), env.collectionInfo.collectionId, 'Collection id doesn\'t match');
            assert.equal(colls[0].inClassName, env.userInfo.studyClass.name, 'Collection inClassName is not correct');
        });

        it('Should remove collection from class', async function() {
            await classServices.joinClass(env.studentInfo.userId, env.userInfo.studyClass.id);
            await classServices.removeCollectionFromClass(env.userInfo.userId, env.userInfo.studyClass.id, env.collectionInfo.collectionId);
            const colls = await collectionServices.getCollections(true, env.studentInfo.userId, Models.EClassOwnershipType.Joined, [env.userInfo.studyClass.id]);
            assert.lengthOf(colls, 0, 'Collection not removed');
        });

        it('Should delete a class by id', async function() {
            await classServices.removeClassById(env.userInfo.userId, env.userInfo.studyClass.id);
            const u = await databaseHelper.getCollection('users').findOne({
                _id: new ObjectId(env.userInfo.userId),
                'createdClasses._id': new ObjectId(env.userInfo.studyClass.id)
            });
            assert.isDefined(u, 'Class not deleted');
        });

        it('Should not delete a class by id', async function() {
            await classServices.removeClassById(env.studentInfo.userId, env.userInfo.studyClass.id);
            const u = await databaseHelper.getCollection('users').findOne({
                _id: new ObjectId(env.userInfo.userId),
                'createdClasses._id': new ObjectId(env.userInfo.studyClass.id)
            });
            assert.isNull(u, 'Class deleted without authorization');
        });



    });
}