import { ObjectId } from 'mongodb';
import { DBObject } from './misc.models';

export interface DBStatsDoc extends DBObject {
    collectionId: string | ObjectId,
    userId: string | ObjectId,
    correct: number,
    wrong: number,

    words: {
        wordId: string | ObjectId,
        correct: number,
        wrong: number,
        days: {
            day: number,
            correct: number,
            wrong: number
        }[]
    }[]
}
