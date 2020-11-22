import joi from 'joi';

export interface Test {
    createdOn: Date;
    ownerId: string;
    settings: {
        numberOfQuestions: number;
        collectionPollIds: string[]; 
    };
    questions: {
        collectionId: string;
        wordId: string;
        question: string;
    }[];
}

export interface TestQuery {
    numberOfQuestions: number;
    collectionPollIds: string[]; 
}

export function validateTestQuery(trainingResult: unknown): { value?: TestQuery, error?: string } {

    const validationResult = joi.object({
        numberOfQuestions: joi.number().integer().required(),
        collectionPollIds: joi.array().items(joi.string()),
    }).validate(trainingResult);

    if (validationResult.error) {
        return { error: validationResult.error.message };
    }

    return { value: (trainingResult as TestQuery) };
}