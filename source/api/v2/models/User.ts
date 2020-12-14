import joi from 'joi';
import { ObjectId } from 'mongodb';
import { DBObject } from './misc.models';
import { CollectionMin } from './Collection';
// --- INTERFACES ---
export interface StudyClass {
    _id: string | ObjectId,
    name: string,
    collections: string[] | ObjectId[],
    mine?: boolean
}

export interface FullStudyClass {
    _id: string | ObjectId,
    name: string,
    students: UserMin[],
    collections: CollectionMin[],
}

export interface UserMin {
    _id?: string | ObjectId,
    username: string;
    displayName: string;
}

export interface User extends UserMin {
    email: string;
    createdClasses: StudyClass[],
    joinedClasses: string[] | ObjectId[],
    settings?: { [id: string]: string };
}

export interface DBUserDoc extends User, DBObject {
    password: string,
    deletedOn: Date | null
}

// --- VAlIDATORS ---
export function validateUser(user: unknown): { value?: User, error?: string } {

    const validationResult = joi.object({
        _id: joi.string(),
        username: joi.string().min(6).required(),
        displayName: joi.string().min(6).required(),
        email: joi.string().email().required(),
        createdClasses: joi.array().items(joi.object({
            _id: joi.string(),
            name: joi.string().required(),
            collections: joi.array().items(joi.string())
        })),
        joinedClasses: joi.array().items(joi.string()),
    }).validate(user);

    if (validationResult.error) {
        return { error: validationResult.error.message };
    }
    
    return { value: (user as User) };
}

export function validateClass(classData: { name: string }): { value?: { name: string }, error?: string } {

    const validationResult = joi.object({
        name: joi.string().required(),
    }).validate(classData);

    if (validationResult.error) {
        return { error: validationResult.error.message };
    }

    return { value: (classData) };
}

// --- DB parsers ---
export function getUserFromDBDoc(doc: DBUserDoc): User {
    return {
        displayName: doc.displayName,
        email: doc.email,
        username: doc.username,
        settings: doc.settings,
        createdClasses: doc.createdClasses ?? [],
        joinedClasses: doc.joinedClasses ?? []
    };
}