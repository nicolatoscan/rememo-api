import { ObjectId } from 'mongodb';
import { DBObject } from './misc.models';
import joi from 'joi';

export interface DBCollectionStudyStateDoc extends DBObject {
    collectionId: ObjectId;
    userId: ObjectId;
    score: number;
    counter: number;
    lastDoneDate: Date;
    lastDoneCorrectDate: Date;
    lastDoneCorrectCounter: number;

    wordsState: WordStudyState[];
}

export interface WordStudyState {
    wordId: ObjectId;
    learned: number;
    score: number;
    lastDoneDate: Date;
    lastDoneCorrectDate: Date;
    lastDoneCounter: number;
    lastDoneCorrectCounter: number;
}


export interface TrainingResult {
    collectionId: string;
    wordId: string;
    result: boolean;
}

export function createEmptyDBCollectionStudyStateDoc(collectionId: string, userId: string, wordsIds: string[] = []): DBCollectionStudyStateDoc {
    return {
        createdOn: new Date(),
        lastModified: new Date(),
        collectionId: new ObjectId(collectionId),
        userId: new ObjectId(userId),
        score: 0,
        counter: 0,
        lastDoneDate: new Date(),
        lastDoneCorrectDate: new Date(),
        lastDoneCorrectCounter: 0,
        wordsState: wordsIds.map(id => createEmptyWordStudyState(id))
    };
}

export function createEmptyWordStudyState(wordId: string): WordStudyState {
    return {
        wordId: new ObjectId(wordId),
        learned: 0,
        score: 0,
        lastDoneDate: new Date(),
        lastDoneCorrectDate: new Date(),
        lastDoneCounter: 0,
        lastDoneCorrectCounter: 0
    };
}

export function validateTrainingResult(trainingResult: unknown): { value?: TrainingResult, error?: string } {

    const validationResult = joi.object({
        collectionId: joi.string().required(),
        wordId: joi.string().required(),
        result: joi.boolean().required(),
    }).validate(trainingResult);

    if (validationResult.error) {
        return { error: validationResult.error.message };
    }

    return { value: (trainingResult as TrainingResult) };
}