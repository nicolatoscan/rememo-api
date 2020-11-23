import * as Models from '../models';
import databaseHelper from '../../../helpers/database.helper';
import { ObjectId } from 'mongodb';

enum ResultType {
    Test, Train
}

export async function saveTestResult(test: Models.Test) {
    const results = test.questions.map(q => {
        return {
            collectionId: q.collectionId,
            wordId: q.wordId,
            result: q.result ? true : false,
            type: ResultType.Test
        };
    });
    await saveResult(results);
}

export async function saveTraining(collId: string, wordId: string, result: boolean) {
    await saveResult([{
        collectionId: collId,
        wordId: wordId,
        result: result ? true : false,
        type: ResultType.Train
    }]);
}


async function saveResult(result: { collectionId: string, wordId: string, result: boolean, type: ResultType }[] ) {
    //salva nel db
    return;
}