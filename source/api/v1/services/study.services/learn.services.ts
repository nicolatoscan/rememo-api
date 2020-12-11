import databaseHelper from '../../../../helpers/database.helper';
import { ObjectId } from 'mongodb';
import * as Models from '../../models';


export async function getCollectionLearnStatus(idColl: string, id: string,): Promise<{ wordId: ObjectId, learned: number }[] | undefined> {
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