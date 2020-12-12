import * as Models from '../models';
import databaseHelper from '../../../helpers/database.helper';
import { ObjectId } from 'mongodb';

export async function getClassesFromIds(classIds: ObjectId[]): Promise<Models.StudyClass[]> {
    return (await databaseHelper.getCollection('users')
        .aggregate([
            { $project: { createdClasses: 1 } },
            { $unwind: '$createdClasses' },
            { $match: { 'createdClasses._id': { $in: classIds }  } }
        ]).toArray()).map(c => c.createdClasses as Models.StudyClass);
}

export async function getClasses(userId: string, ownershipType: Models.EClassOwnershipType): Promise<Models.StudyClass[]> {
    const user = (await databaseHelper.getCollection('users').findOne({ _id: new ObjectId(userId) })) as Models.DBUserDoc;

    if (ownershipType === Models.EClassOwnershipType.Mine) {
        return user.createdClasses;
    }
    else if (ownershipType === Models.EClassOwnershipType.Joined || ownershipType === Models.EClassOwnershipType.Both) {
        const joinedclasses = (await getClassesFromIds(user.joinedClasses as ObjectId[]));
        return ownershipType === Models.EClassOwnershipType.Both ? [...user.createdClasses, ...joinedclasses] : joinedclasses;
    }
    return [];
}

export async function createClass(userId: string, studyClass: Models.StudyClass): Promise<{ studyClassId: string }> {

    studyClass._id = new ObjectId();
    await databaseHelper.getCollection('users').updateOne(
        { _id: new ObjectId(userId) },
        {  $push: { createdClasses: studyClass } }
    );
    return { studyClassId: studyClass._id.toHexString() };
}

export async function getClassById(userId: string, classId: string): Promise<Models.StudyClass | null> {

    return null;
}

export async function updateClassById(userId: string, classId: string, studyClass: Models.StudyClass): Promise<void> {

    return;
}

export async function removeClassById(userId: string, classId: string): Promise<void> {

    return;
}

export async function getClassStudents(userId: string, classId: string): Promise<Models.User[]> {

    return [];
}

export async function joinClass(userId: string, classId: string): Promise<void> {

    return;
}

export async function leaveClass(userId: string, classId: string): Promise<void> {

    return;
}

export async function kickStudentFromClass(ownerId: string, classId: string, studentId: string): Promise<void> {

    return;
}

export async function addCollectionToClass(userId: string, classId: string, collectionId: string): Promise<void> {

    return;
}

export async function removeCollectionToClass(userId: string, classId: string, collectionId: string): Promise<void> {

    return;
}