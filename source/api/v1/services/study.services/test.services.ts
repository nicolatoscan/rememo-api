import * as Models from '../../models';
import databaseHelper from '../../../../helpers/database.helper';
import { ObjectId } from 'mongodb';


export async function createTest(testQuery: Models.TestQuery, owner: string, userId: string): Promise<Models.Test> {
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
                    question: w.original,
                    correct: w.translation
                };
            })
        ).flat(1)
        .sort(() => 0.5 - Math.random())
        .slice(0, testQuery.numberOfQuestions);

    const test: Models.Test = {
        createdOn: new Date(),
        ownerId: userId,
        corrected: false,
        collectionPollIds: testQuery.collectionPollIds,
        numberOfQuestions: testQuery.numberOfQuestions,
        questions: wordsPoll
    };
    test._id = (await databaseHelper.getCollection('tests').insertOne(test)).insertedId;

    test.questions.map(q => {
        delete q.correct;
        return q;
    });
    return test;
}

export async function checkTest(queryTest: Models.Test, userId: string): Promise<{ testResult?: Models.Test, error?: string }> {

    const docTest = (await databaseHelper.getCollection('tests').findOne(
        { _id: new ObjectId(queryTest._id), ownerId: new ObjectId(userId), corrected: false }
    )) as Models.Test;
    if (!docTest)
        return { error: 'Test not found' };

    if (docTest.questions.length !== queryTest.questions.length)
        return { error: 'Question ids do not match' };
    const dbIds = docTest.questions.map(q => q.wordId.toString());
    const queryIds = queryTest.questions.map(q => q.wordId.toString());
    for (let i = 0; i < dbIds.length; i++)
        if (dbIds[i] !== queryIds[i])
            return { error: 'Question ids do not match' };

    for (let i = 0; i < dbIds.length; i++) {
        const qDoc = docTest.questions[i];
        const qQuery = queryTest.questions[i];
        qDoc.result = (qDoc.correct === qQuery.answer) ? true : false;
        qDoc.answer = qQuery.answer;
    }

    docTest.corrected = true;
    await databaseHelper.getCollection('tests').replaceOne(
        { _id: docTest._id },
        docTest
    );

    return { testResult: docTest };
}