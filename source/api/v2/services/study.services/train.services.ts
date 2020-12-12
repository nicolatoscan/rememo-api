import * as Models from '../../models';
import databaseHelper from '../../../../helpers/database.helper';
import { ObjectId } from 'mongodb';
import * as statsServices from '../stats.services';

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
    )) as Models.DBStudyStateDoc;

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
    console.log(result.correct);
    statsServices.saveTrainingResult(studyState.collectionId.toHexString(), word.wordId.toHexString(), result.correct, userId);
    return true;
}

function getSampleRange<T>(source: T[], range: number): T[] {
    const x = Math.random();

    const top = ((x: number) => Math.min(
        (1 + range - Math.pow(Math.max(0, x - range), 2)) * source.length,
        source.length
    ))(x);
    const bottom = ((x: number) => Math.max(
        (1 - (2 * x * range) - Math.pow(Math.max(2 * range, x), 2)) * source.length,
        0
    ))(x);

    return source.slice(Math.floor(bottom), Math.ceil(top));
}

export async function getNextWord(idsPolls: string[], userId: string): Promise<Models.FullWord | undefined> {

    const wordsPoll = (await databaseHelper.getCollection('collection-study-state')
        .find({
            collectionId: { $in: idsPolls.map(id => new ObjectId(id)) },
            userId: new ObjectId(userId)
        })
        .project({ collectionId: 1, counter: 1, score: 1, wordsState: 1 })
        .toArray() as { collectionId: ObjectId, counter: number, score: number, wordsState: Models.WordStudyState[] }[])
        .map(c =>
            c.wordsState.map(w => {
                return {
                    collectionId: c.collectionId,
                    wordId: w.wordId,
                    collectionCounter: c.counter,
                    collectionScore: c.score,
                    score: w.score,
                    lastDoneDate: w.lastDoneDate,
                    lastDoneCorrectDate: w.lastDoneCorrectDate,
                    lastDoneCounter: w.lastDoneCounter,
                    lastDoneCorrectCounter: w.lastDoneCorrectCounter
                };
            })
        ).flat(1).sort((w1, w2) => w1.score - w2.score);

    const RANGE = 0.1;
    const sample = getSampleRange(wordsPoll, RANGE);
    if (sample.length === 0)
        return undefined;

    const wordInfo = sample.reduce((min, w) => w.lastDoneCorrectCounter < min.lastDoneCorrectCounter ? w : min);
    const collection = ((await databaseHelper.getCollection('collections')
        .findOne({ _id: new ObjectId(wordInfo.collectionId), owner: new ObjectId(userId) })) as Models.DBCollectionDoc);
    const word = collection?.words.find(w => (w._id as ObjectId).toHexString() === wordInfo.wordId.toHexString());

    if (collection && word) {
        return {
            ...word,
            collectionId: collection._id?.toString() ?? '',
        };
    } else {
        return undefined;
    }
}