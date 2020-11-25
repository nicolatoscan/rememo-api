import * as Models from '../models';
import databaseHelper from '../../../helpers/database.helper';
import { ObjectId } from 'mongodb';

enum ResultType {
    Test, Train
}

export async function saveTestResult(test: Models.Test, userId: string) {
    const results = test.questions.map(q => {
        return {
            collectionId: q.collectionId,
            wordId: q.wordId,
            result: q.result ? true : false,
            type: ResultType.Test
        };
    });
    await saveResult(results, userId);
}

export async function saveTraining(collId: string, wordId: string, result: boolean, userId: string) {
    await saveResult([{
        collectionId: collId,
        wordId: wordId,
        result: result ? true : false,
        type: ResultType.Train
    }], userId);
}


async function saveResult(result: { collectionId: string, wordId: string, result: boolean, type: ResultType }[], userId: string ) {
    const resultMappedByGroupId = result.reduce((entryMap, e) => entryMap.set(e.collectionId, [...entryMap.get(e.collectionId) || [], e]), new Map());
    for (const collectionId of resultMappedByGroupId.keys()) {
        const subResult = resultMappedByGroupId.get(collectionId);
        console.log(subResult);
        // const correctCollCounter = subResult.filter;
        /*await databaseHelper.getCollection('stats').updateOne(
            { collectionId: new ObjectId(collectionId), userId: userId },
            {}
        );*/
    }

}