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

interface Result {
    collectionId: string;
    wordId: string;
    result: boolean;
    type: ResultType;
}

async function saveResult(result: Result[], userId: string) {
    const resultMappedByGroupId = result.reduce((entryMap, e) => entryMap.set(e.collectionId, [...entryMap.get(e.collectionId) || [], e]), new Map());
    for (const collectionId of resultMappedByGroupId.keys()) {
        const subResult = resultMappedByGroupId.get(collectionId) as Result[];
        console.log(subResult);
        const correctCollTest = subResult.filter(r => r.result && r.type === ResultType.Test).length;
        const correctCollTrain = subResult.filter(r => r.result && r.type === ResultType.Train).length;
        const wrongCollTest = subResult.filter(r => !r.result && r.type === ResultType.Test).length;
        const wrongCollTrain = subResult.filter(r => !r.result && r.type === ResultType.Train).length;
        const stat = await databaseHelper.getCollection('stats').findOne(
            { collectionId: new ObjectId(collectionId), userId: userId },
            //{ correctTrain: correctCollTrain.length, correctTest: correctCollTest.length, wrongTrain: wrongCollTrain.length, wrongTest: wrongCollTest.length}
        ) as Models.DBStatsDoc | null;
        if (stat) {
            stat.wrongTest += wrongCollTest;
            stat.correctTest += correctCollTest;
            stat.wrongTrain += wrongCollTrain;
            stat.correctTrain += correctCollTrain;
            for(const wordState of subResult){
                const word = stat.words.find(r => r.wordId.toHexString() === wordState.wordId); 
                if (word){
                    word.correctTest += ((wordState.result && wordState.type == ResultType.Test)? 1 : 0);
                    word.wrongTest += ((!wordState.result && wordState.type == ResultType.Test)? 1 : 0);
                    word.correctTrain += ((wordState.result && wordState.type == ResultType.Test)? 1 : 0);
                    word.wrongTrain += ((!wordState.result && wordState.type == ResultType.Test)? 1 : 0);
                }
            }
        }
        await databaseHelper.getCollection('stats').replaceOne(
            { collectionId: new ObjectId(collectionId), userId: userId },
            stat
        );
    }
    return;
}