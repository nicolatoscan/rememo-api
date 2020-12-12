import joi from 'joi';
import { ObjectId } from 'mongodb';

export interface TestQuery {
    numberOfQuestions: number;
    collectionPollIds: string[];
}

export interface Test {
    _id?: string | ObjectId;
    ownerId?: string | ObjectId;
    createdOn?: Date;
    numberOfQuestions: number;
    collectionPollIds: string[];
    corrected?: boolean;
    questions: {
        collectionId: string;
        wordId: string;
        question: string;
        correct?: string;
        answer?: string;
        result?: boolean;
    }[];
}

export function validateTestQuery(testQuery: unknown): { value?: TestQuery, error?: string } {

    const validationResult = joi.object({
        numberOfQuestions: joi.number().integer().required(),
        collectionPollIds: joi.array().items(joi.string()),
    }).validate(testQuery);

    if (validationResult.error) {
        return { error: validationResult.error.message };
    }

    return { value: (testQuery as TestQuery) };
}

export function validateTestResult(testResult: unknown): { value?: Test, error?: string } {
    const validationResult = joi.object({
        _id: joi.string().required(),
        ownerId: joi.string(),
        createdOn: joi.date(),
        numberOfQuestions: joi.number().integer().required(),
        collectionPollIds: joi.array().items(joi.string()),
        corrected: joi.boolean(),
        questions: joi.array().items(joi.object({
            collectionId: joi.string().required(),
            wordId: joi.string().required(),
            question: joi.string().required(),
            correct: joi.string(),
            result: joi.string(),
            answer: joi.string().required(),
        })).required()
    }).validate(testResult);

    if (validationResult.error) {
        return { error: validationResult.error.message };
    }

    return { value: (testResult as Test) };
}