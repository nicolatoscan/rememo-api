import { ObjectId } from 'mongodb';
import { DBObject } from './misc.models';

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
    learned: boolean;
    score: number;
    lastDoneDate: Date;
    lastDoneCorrectDate: Date;
    lastDoneCounter: number;
    lastDoneCorrectCounter: number;
}

export function getEmptyDBCollectionStudyStateDoc(collectionId: string, userId: string, wordsIds: string[] = []): DBCollectionStudyStateDoc {
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
        wordsState: wordsIds.map(id => getEmptyWordStudyState(id))
    };
}

export function getEmptyWordStudyState(wordId: string): WordStudyState {
    return {
        wordId: new ObjectId(wordId),
        learned: false,
        score: 0,
        lastDoneDate: new Date(),
        lastDoneCorrectDate: new Date(),
        lastDoneCounter: 0,
        lastDoneCorrectCounter: 0
    };
}