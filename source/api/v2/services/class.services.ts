import * as Models from '../models';
import databaseHelper from '../../../helpers/database.helper';

export async function getClasses(userId: string, ownershipType: Models.EClassOwnershipType): Promise<Models.StudyClass[]> {

    return [];
}

export async function createClass(userId: string, studyClass: Models.StudyClass): Promise<{ studyClassId: string }> {
    
    return { studyClassId: '' };
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