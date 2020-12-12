import joi from 'joi';
import { DBObject } from './misc.models';

// --- INTERFACES ---
export interface User {
    username: string;
    displayName: string;
    email: string;
    settings?: { [id: string]: string };
}

export interface DBUserDoc extends User, DBObject {
    password: string,
    deletedOn: Date | null
}

// --- VAlIDATORS ---
export function validateUser(user: unknown): { value?: User, error?: string } {

    const validationResult = joi.object({
        username: joi.string().min(6).required(),
        displayName: joi.string().min(6).required(),
        email: joi.string().email().required(),
    }).validate(user);

    if (validationResult.error) {
        return { error: validationResult.error.message };
    }

    return { value: (user as User) };
}

// --- DB parsers ---
export function getUserFromDBDoc(doc: DBUserDoc): User {
    return {
        displayName: doc.displayName,
        email: doc.email,
        username: doc.username,
        settings: doc.settings
    };
}