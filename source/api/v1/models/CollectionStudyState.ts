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

export function getEmptyDBCollectionStudyStateDoc(collectionId: string, userId: string, wordsIds: string[] = []) : DBCollectionStudyStateDoc {
    return {
        createdOn: new Date(),
        lastModified: new Date(),
        collectionId: new ObjectId(collectionId),
        userId: new ObjectId(userId),
        score: 0,
        counter: 0,
        lastDoneDate: new Date(),
        lastCorrectCounter: 0,

        wordsState: wordsIds.map(id => {
            return {
                wordId: new ObjectId(id),
                learned: 0,
                score: 0,
                lastCorrectCounter: 0,
                lastDoneCounter: 0,
                lastDoneDate: new Date()
            };
        })
    };
}