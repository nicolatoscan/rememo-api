import * as Models from '../models';
import { ObjectId } from 'mongodb';
import databaseHelper from '../../../helpers/database.helper';
import * as usersServices from '../../../api/v2/services/user.services';

export async function getClassesFromIds(classIds: ObjectId[]): Promise<Models.StudyClass[]> {
    return (await databaseHelper.getCollection('users')
        .aggregate([
            { $project: { createdClasses: 1 } },
            { $unwind: '$createdClasses' },
            { $match: { 'createdClasses._id': { $in: classIds } } }
        ]).toArray()).map(c => c.createdClasses as Models.StudyClass);
}

export async function getClasses(userId: string, ownershipType: Models.EClassOwnershipType): Promise<Models.StudyClass[]> {
    const user = await usersServices.getUserDoc(userId);
    if (user) {
        if (ownershipType === Models.EClassOwnershipType.Mine) {
            return user.createdClasses;
        }
        else if (ownershipType === Models.EClassOwnershipType.Joined || ownershipType === Models.EClassOwnershipType.Both) {
            const joinedclasses = (await getClassesFromIds(user.joinedClasses as ObjectId[]));
            return ownershipType === Models.EClassOwnershipType.Both ? [...user.createdClasses, ...joinedclasses] : joinedclasses;
        }
    }
    return [];
}

export async function createClass(userId: string, studyClass: Models.StudyClass): Promise<{ studyClassId: string }> {
    studyClass._id = new ObjectId();
    studyClass.collections = [];
    await databaseHelper.getCollection('users').updateOne(
        { _id: new ObjectId(userId) },
        { $push: { createdClasses: studyClass } }
    );
    return { studyClassId: studyClass._id.toHexString() };
}

export async function getClassById(userId: string, classId: string, ownershipType: Models.EClassOwnershipType = Models.EClassOwnershipType.Both): Promise<Models.StudyClass | null> {
    const user = await usersServices.getUserDoc(userId);
    if (!user)
        return null;

    let found: Models.StudyClass | null = null;
    if (ownershipType !== Models.EClassOwnershipType.Joined) {
        found = user.createdClasses.find(c => c._id.toString() === classId) ?? null;
        if (found)
            return found;
    }
    if (ownershipType !== Models.EClassOwnershipType.Mine) {
        found = (await getClassesFromIds(user.joinedClasses as ObjectId[])).find(c => c._id.toString() === classId) ?? null;
    }
    return found;
}

export async function updateClassById(userId: string, classId: string, studyClass: Models.StudyClass): Promise<void> {
    await databaseHelper.getCollection('users').updateOne(
        { _id: new ObjectId(userId), 'createdClasses._id': new ObjectId(classId) },
        { $set: { 'createdClasses.$.name': studyClass.name } }
    );
}

export async function removeClassById(userId: string, classId: string): Promise<void> {
    await databaseHelper.getCollection('users').updateOne(
        { _id: new ObjectId(userId), 'createdClasses._id': new ObjectId(classId) },
        { $pull: { createdClasses: { _id: new ObjectId(classId) } } }
    );
}

export async function getClassStudents(userId: string, classId: string): Promise<Models.UserMin[]> {
    return (await databaseHelper.getCollection('users')
        .find({ _id: new ObjectId(userId), joinedClasses: new ObjectId(classId) })
        .project({
            _id: 1,
            displayName: 1,
            username: 1
        })
        .toArray()) as Models.UserMin[];
}

export async function joinClass(userId: string, classId: string): Promise<void> {
    await databaseHelper.getCollection('users')
        .updateOne(
            { _id: new ObjectId(userId) },
            { $addToSet: { joinedClasses: new ObjectId(classId) } }
        );
    
    const updatedUser = (await databaseHelper.getCollection('users')
        .findOneAndUpdate(
            { _id: new ObjectId(userId) },
            { $addToSet: { joinedClasses: new ObjectId(classId) } }
        )).value as Models.User;
 
    const collectionsIds = updatedUser.createdClasses.find(c => c._id === new ObjectId(classId))?.collections as ObjectId[] | null;
    if (collectionsIds) {
        const colelctionsInClass = (await databaseHelper.getCollection('collections').find({ _id: { $in: collectionsIds } }).toArray()) as Models.DBCollectionDoc[];

        const insertStudy = databaseHelper.getCollection('collection-study-state').insertMany(
            colelctionsInClass.map(c => {
                return Models.createEmptyDBCollectionStudyStateDoc(c._id?.toString() ?? '', userId, c.words.map(w => w._id?.toString() ?? ''));
            })
        );
        const insertStats = databaseHelper.getCollection('stats').insertMany(
            colelctionsInClass.map(c => {
                return Models.createDBStatsDoc(c._id?.toString() ?? '', userId, c.words.map(w => w._id?.toString() ?? ''));
            })
        );
        await insertStudy;
        await insertStats;
    }
}

export async function leaveClass(userId: string, classId: string): Promise<void> {
    await databaseHelper.getCollection('users')
        .updateOne(
            { _id: new ObjectId(userId) },
            { $pull: { joinedClasses: new ObjectId(classId) } }
        );
}

export async function kickStudentFromClass(ownerId: string, classId: string, studentId: string): Promise<boolean> {
    const owner = await databaseHelper.getCollection('users').findOne(
        { _id: new ObjectId(studentId), 'createdClasses._id': new ObjectId(classId) }
    );
    if (owner) {
        await databaseHelper.getCollection('users')
            .updateOne(
                { _id: new ObjectId(studentId) },
                { $pull: { joinedClasses: new ObjectId(classId) } }
            );
        return true;
    }
    return false;
}

export async function addCollectionToClass(userId: string, classId: string, collectionId: string): Promise<void> {
    await databaseHelper.getCollection('users')
        .updateOne(
            { _id: new ObjectId(userId), 'createdClasses._id': new ObjectId(classId) },
            { $addToSet: { 'createdClasses.$.collections' : new ObjectId(collectionId) } }
        );
}

export async function removeCollectionFromClass(userId: string, classId: string, collectionId: string): Promise<void> {
    await databaseHelper.getCollection('users')
        .updateOne(
            { _id: new ObjectId(userId), 'createdClasses._id': new ObjectId(classId) },
            { $pull: { 'createdClasses.$.collections' : new ObjectId(collectionId) } }
        );
}