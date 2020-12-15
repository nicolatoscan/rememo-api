import { ObjectId } from 'mongodb';
import { DBObject } from './misc.models';

export interface DBStatsDoc extends DBObject {
    collectionId: ObjectId,
    userId: ObjectId,
    correctTrain: number,
    wrongTrain: number,
    correctTest: number,
    wrongTest: number,
    words: WordStats[]
}

export interface WordStats {
    wordId:  ObjectId ,
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

export interface ClassStats {
    
    classId: string,
    correct: number,
    wrong: number,
    users: { [id: string]: string },    
    collections: {
        [id: string]: {
            collectionId: string,
            name: string,
            correct: number,
            wrong: number,
            usernames: string[],
            words: {
                [id: string]: {
                    wordId:  string ,
                    name:  string ,
                    correct: number,
                    wrong: number
                }
            }
        }
    }
}


export function createDBStatsDoc(collectionId: string, userId: string, wordsIds: string[] = []): DBStatsDoc {
    return {
        createdOn: new Date(),
        lastModified: new Date(),
        collectionId: new ObjectId(collectionId),
        userId: new ObjectId(userId),
        correctTrain: 0,
        wrongTrain: 0,
        correctTest: 0,
        wrongTest: 0,

        words: wordsIds.map(w => {
            return {
                wordId: new ObjectId(w),
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
        wordId: new ObjectId(wordId) ,
        days: [],
        correctTrain: 0,
        wrongTrain: 0,
        correctTest: 0,
        wrongTest: 0
    };
}

export function getStatsFromDBDoc(doc:DBStatsDoc) : DBStatsDoc {
    return {
        _id: doc._id?.toString(),
        createdOn: doc.createdOn,
        lastModified: doc.lastModified,
        collectionId: doc.collectionId,
        userId: doc.userId,
        correctTrain: doc.correctTrain,
        wrongTrain: doc.wrongTrain,
        correctTest: doc.correctTest,
        wrongTest: doc.wrongTest,
        words: doc.words.map(w => {
            return {
                wordId: w.wordId,
                days: w.days.map(d => {
                    return {
                        day: d.day,
                        correctTrain: d.correctTrain,
                        wrongTrain: d.wrongTrain,
                        correctTest: d.correctTest,
                        wrongTest: d.wrongTest
                    };
                }),
                correctTrain: w.correctTrain,
                wrongTrain: w.wrongTrain,
                correctTest: w.correctTest,
                wrongTest: w.wrongTest
            };
        })
    };
}
