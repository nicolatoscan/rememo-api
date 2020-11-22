import * as Models from '../../models';
import databaseHelper from '../../../../helpers/database.helper';
import { ObjectId } from 'mongodb';


export async function createTest(testQuery: Models.TestQuery, owner: string): Promise<Models.Test> {
    const ids = testQuery.collectionPollIds.map(id => new ObjectId(id));
    console.log(ids);

    const wordsPoll = (await databaseHelper.getCollection('collections')
        .find({
            owner: owner,
            _id: { $in: ids }
        })
        .project({ _id: 1, words: 1 })
        .toArray() as Models.DBCollectionDoc[])
        .map(c =>
            c.words.map(w => {
                return {
                    collectionId: c._id?.toString() ?? '',
                    wordId: w._id?.toString() ?? '',
                    question: w.original
                };
            })
        ).flat(1)
        .sort(() => 0.5 - Math.random())
        .slice(0, testQuery.numberOfQuestions);

    return {
        createdOn: new Date(),
        ownerId: owner,
        settings: {
            collectionPollIds: testQuery.collectionPollIds,
            numberOfQuestions: testQuery.numberOfQuestions
        },
        questions: wordsPoll
    };
}