import databaseHelper from '../../../../helpers/database.helper';
import { ObjectId } from 'mongodb';
import * as Models from '../../models';


export async function getCollectionLearnState(idColl: string, id: string,): Promise<{ wordId: ObjectId, learned: number }[] | undefined> {
    const learnState = ((await databaseHelper.getCollection('collection-study-state').findOne(
        { collectionId: new ObjectId(idColl), userId: new ObjectId(id) },
    )) as ( Models.DBCollectionStudyStateDoc | null))
        ?.wordsState
        .map(w => {
            return {
                wordId: w.wordId, 
                learned: w.learned
            };
        });

    return learnState;
}

export async function updateWordLearnState(idColl: string, id: string, wordId: string, status: number): Promise<void> {
    await databaseHelper.getCollection('collection-study-state').updateOne(
        { collectionId: new ObjectId(idColl), userId: new ObjectId(id), 'wordsState.wordId': new ObjectId(wordId) }, 
        { $set: { 'wordsState.$.learned': status } }
    );
}

export async function resetCollectionLearnState(idColl: string, idUser: string): Promise<void> {
    await databaseHelper.getCollection('collection-study-state').updateMany(
        {collectionId: new ObjectId(idColl), userId: new ObjectId(idUser)},
        {$set: { 'wordsState.$[].learned': 0 } }
    );
}

