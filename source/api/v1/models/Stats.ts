import { ObjectId } from 'mongodb';
import { DBObject } from './misc.models';

export interface DBStatsDoc extends DBObject {
    collectionId: string | ObjectId,
    userId: string | ObjectId,
    correctTrain: number,
    wrongTrain: number,
    correctTest: number,
    wrongTest: number,
    words: WordStats[]
}

export interface WordStats {
    wordId: string,
    days: Day[],
    correctTrain: number,
    wrongTrain: number,
    correctTest: number,
    wrongTest: number
}

export interface Day {
    day: number,
    correctTrain: number,
    wrongTrain: number,
    correctTest: number,
    wrongTest: number
}



export function createDBStatsDoc(collectionId: string, userId: string, wordsIds: string[] = []): DBStatsDoc {
    return {
        createdOn: new Date(),
        lastModified: new Date(),
        collectionId: collectionId,
        userId: new ObjectId(userId),
        correctTrain: 0,
        wrongTrain: 0,
        correctTest: 0,
        wrongTest: 0,

        words: wordsIds.map(w => {
            return {
                wordId: w,
                days: [],
                correctTrain: 0,
                wrongTrain: 0,
                correctTest: 0,
                wrongTest: 0
            };
        })
    };
}
export function createEmptyWordStats(wordId: string): WordStats {
    return {
        wordId: wordId,
        days: [],
        correctTrain: 0,
        wrongTrain: 0,
        correctTest: 0,
        wrongTest: 0
    };
}
