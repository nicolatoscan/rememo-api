import joi from 'joi';

export interface User {
    username: string;
    displayName: string;
    email: string;
    password: string;
}

export function validateUser(user: unknown): { value?: User, error?: string } {

    const validationResult = joi.object({
        username: joi.string().min(6).required(),
        displayName: joi.string().min(6).required(),
        email: joi.string().email().required(),
        password: joi.string().min(6).required()
    }).validate(user);

    if (validationResult.error) {
        return { error: validationResult.error.message };
    }

    return {
        value: {
            username: (user as User).username,
            displayName: (user as User).displayName,
            email: (user as User).email,
            password: (user as User).password
        }
    };
}