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
        user.createdClasses = user.createdClasses.map(c => ({ ...c, mine: true }));

        if (ownershipType === Models.EClassOwnershipType.Created) {
            return user.createdClasses;
        }
        else if (ownershipType === Models.EClassOwnershipType.Joined || ownershipType === Models.EClassOwnershipType.Both) {
            const joinedclasses = (await getClassesFromIds(user.joinedClasses as ObjectId[])).map(c => ({ ...c, mine: false }));
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

export async function getClassById(userId: string, classId: string): Promise<Models.StudyClass | null> {
    const res = (await getClassesFromIds([new ObjectId(classId)])).find(c => c._id.toString() === classId) ?? null;
    return res;

    // const user = await usersServices.getUserDoc(userId);
    // if (!user)
    //     return null;

    // let found: Models.StudyClass | null = null;
    // if (ownershipType !== Models.EClassOwnershipType.Joined) {
    //     found = user.createdClasses.find(c => c._id.toString() === classId) ?? null;
    //     if (found) {
    //         found.mine = true;
    //         return found;
    //     }
    // }
    // if (ownershipType !== Models.EClassOwnershipType.Created) {
    //     //TODO: fix
    //     found = (await getClassesFromIds(user.joinedClasses as ObjectId[])).find(c => c._id.toString() === classId) ?? null;
    //     if (found) {
    //         found.mine = false;
    //         return found;
    //     }
    // }
    // return null;
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

export async function getFullClassById(userId: string, classId: string): Promise<Models.FullStudyClass | null> {
    const studyClass = ((await databaseHelper
        .getCollection('users')
        .findOne({ _id: new ObjectId(userId), 'createdClasses._id': new ObjectId(classId) })) as Models.DBUserDoc)
        ?.createdClasses.find(c => c._id.toString() === classId);

    if (!studyClass)
        return null;

    const students =  (await databaseHelper.getCollection('users')
        .find({ joinedClasses: new ObjectId(classId) })
        .project({
            _id: 1,
            displayName: 1,
            username: 1
        })
        .toArray()) as Models.UserMin[];

    const collections =  (await databaseHelper.getCollection('collections')
        .find({ _id: { $in: studyClass.collections } })
        .project({
            _id: 1,
            name: 1,
            description: 1,
            languageFrom: 1,
            languageTo: 1,
        })
        .toArray()) as Models.CollectionMin[];

    return {
        _id: studyClass._id,
        name: studyClass.name,
        students: students,
        collections: collections,
    } as Models.FullStudyClass;
}

export async function joinClass(userId: string, classId: string): Promise<void> {
    const classOwner = (await databaseHelper.getCollection('users')
        .findOne(
            { 'createdClasses._id': new ObjectId(classId) }
        )) as Models.DBUserDoc | null;

    if (!classOwner)
        return;

    const modifiedCount = (await databaseHelper.getCollection('users')
        .updateOne(
            { _id: new ObjectId(userId) },
            { $addToSet: { joinedClasses: new ObjectId(classId) } }
        )).modifiedCount;

    const collectionsIds = classOwner?.createdClasses.find(c => c._id.toString() === classId)?.collections as ObjectId[];
    if (modifiedCount === 1 && collectionsIds.length > 0) {
        const colelctionsInClass = (await databaseHelper.getCollection('collections').find({ _id: { $in: collectionsIds } }).toArray()) as Models.DBCollectionDoc[];
        const calls: Promise<any>[] = [];
        for (const c of colelctionsInClass) {
            calls.push(insertSafeStudyState(Models.createEmptyDBCollectionStudyStateDoc(c._id?.toString() ?? '', userId, c.words.map(w => w._id?.toString() ?? ''))));
            calls.push(insertStatsState(Models.createDBStatsDoc(c._id?.toString() ?? '', userId, c.words.map(w => w._id?.toString() ?? ''))));
        }
        await Promise.all(calls);
    }
}

async function insertSafeStudyState(val: Models.DBStudyStateDoc): Promise<any> {
    try {
        return await databaseHelper.getCollection('collection-study-state').insertOne(val);
    } catch {
        console.log('Study state already inserted');
    }
}

async function insertStatsState(val: Models.DBStatsDoc): Promise<any> {
    try {
        return await databaseHelper.getCollection('stats').insertOne(val);
    } catch {
        console.log('Stats already inserted');
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
        { _id: new ObjectId(ownerId), 'createdClasses._id': new ObjectId(classId) }
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