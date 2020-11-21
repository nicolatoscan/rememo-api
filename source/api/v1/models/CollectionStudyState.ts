import { ObjectId } from 'mongodb';
import { DBObject } from './misc.models';

export interface DBCollectionStudyStateDoc extends DBObject {
    collectionId: ObjectId;
    userId: ObjectId;
    score: number;
    counter: number;
    lastDoneDate: Date;
    lastCorrectCounter: number;

    wordsState: {
        wordId: ObjectId;
        learned: number;
        score: number;
        lastDoneDate: Date;
        lastDoneCounter: number;
        lastCorrectCounter: number;
    }[];
}