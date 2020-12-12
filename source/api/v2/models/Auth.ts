import joi from 'joi';
import { DBUserDoc } from './User';


// --- INTERFACES ---
export interface LoginUser {
    username: string;
    password: string;
}

export interface SignupUser extends LoginUser {
    displayName: string;
    email: string;
}

export interface UpdateUser extends LoginUser{
    displayName?: string;
    email?: string;
    newPassword?: string;
}

// --- VAlIDATORS ---
export function validateUpdateUser(updateUser: unknown): { value?: UpdateUser, error?: string } {

    const validationResult = joi.object({
        username: joi.string().min(6).required(),
        password: joi.string().min(6).required(),
        email: joi.string().email(),
        displayName: joi.string().min(6),
        newPassword: joi.string().min(6)
    }).validate(updateUser);

    if (validationResult.error) {
        return { error: validationResult.error.message };
    }

    return {value: (updateUser as UpdateUser)};
    
}

export function validateLoginUser(loginUser: unknown): { value?: LoginUser, error?: string } {

    const validationResult = joi.object({
        username: joi.string().min(6).required(),
        password: joi.string().min(6).required()
    }).validate(loginUser);

    if (validationResult.error) {
        return { error: validationResult.error.message };
    }

    return { value: (loginUser as LoginUser) };
}

export function validateSignupUser(loginUser: unknown): { value?: SignupUser, error?: string } {

    const validationResult = joi.object({
        username: joi.string().min(6).required(),
        displayName: joi.string().min(6).required(),
        password: joi.string().min(6).required(),
        email: joi.string().email().required()
    }).validate(loginUser);

    if (validationResult.error) {
        return { error: validationResult.error.message };
    }

    return { value: (loginUser as SignupUser) };
}


// --- DB parsers ---
export function createDBUserDoc(user: SignupUser, hashedPassword: string): DBUserDoc {
    return {
        createdOn: new Date(),
        lastModified: new Date(),
        deletedOn: null,
        displayName: user.displayName,
        email: user.email,
        password: hashedPassword,
        username: user.username
    };
}