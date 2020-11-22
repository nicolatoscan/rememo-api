import * as Models from '../../models';
import databaseHelper from '../../../../helpers/database.helper';
import { ObjectId } from 'mongodb';

function expAverage(correct: boolean, oldN: number, ALPHA: number): number {
    const res = (oldN * (1 - ALPHA)) + ((correct ? 1 : 0) * ALPHA);
    if (res > 1)
        return 1;
    else if (res < 0)
        return 0;
    else
        return res;
}

export async function saveTrainingResult(result: Models.TrainingResult, userId: string): Promise<boolean> {

    //TODO: implement transaction
    const studyState = (await databaseHelper.getCollection('collection-study-state').findOne(
        { collectionId: new ObjectId(result.collectionId), userId: new ObjectId(userId) },
    )) as Models.DBCollectionStudyStateDoc;

    if (!studyState)
        return false;

    const word = studyState.wordsState.find(w => w.wordId.toHexString() === result.wordId);
    if (!word)
        return false;

    const dateNow = new Date();
    studyState.counter++;
    studyState.lastModified = dateNow;
    studyState.lastDoneDate = dateNow;
    if (result.correct) {
        studyState.lastDoneCorrectDate = dateNow;
        studyState.lastDoneCorrectCounter = studyState.counter;
    }

    word.lastDoneCounter = studyState.counter;
    word.lastDoneDate = dateNow;
    if (result.correct) {
        word.lastDoneCorrectCounter = studyState.counter;
        word.lastDoneCorrectDate = dateNow;
    }

    const ALPHA_WORD = 0.5;
    word.score = expAverage(result.correct, word.score, ALPHA_WORD);
    studyState.score = studyState.wordsState.map(w => w.score).reduce((a, b) => a + b) / studyState.wordsState.length;

    await databaseHelper.getCollection('collection-study-state').replaceOne(
        { _id: studyState._id },
        studyState
    );
    return true;
}
