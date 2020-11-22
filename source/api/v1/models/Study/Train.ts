import joi from 'joi';

export interface TrainingResult {
    collectionId: string;
    wordId: string;
    correct: boolean;
}

export function validateTrainingResult(trainingResult: unknown): { value?: TrainingResult, error?: string } {

    const validationResult = joi.object({
        collectionId: joi.string().required(),
        wordId: joi.string().required(),
        correct: joi.boolean().required(),
    }).validate(trainingResult);

    if (validationResult.error) {
        return { error: validationResult.error.message };
    }

    return { value: (trainingResult as TrainingResult) };
}