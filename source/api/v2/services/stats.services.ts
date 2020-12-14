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

export async function saveTrainingResult(collId: string, wordId: string, result: boolean, userId: string) {
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

async function saveResult(result: Result[], userId: string): Promise<void> {

    const resultMappedByGroupId = result.reduce((entryMap, e) => entryMap.set(e.collectionId, [...entryMap.get(e.collectionId) || [], e]), new Map());
    for (const collectionId of resultMappedByGroupId.keys()) {
        const subResult = resultMappedByGroupId.get(collectionId) as Result[];
        console.log(subResult);
        const correctCollTest = subResult.filter(r => r.result && r.type === ResultType.Test).length;
        const correctCollTrain = subResult.filter(r => r.result && r.type === ResultType.Train).length;
        const wrongCollTest = subResult.filter(r => !r.result && r.type === ResultType.Test).length;
        const wrongCollTrain = subResult.filter(r => !r.result && r.type === ResultType.Train).length;
        const stat = await databaseHelper.getCollection('stats').findOne(
            { collectionId: new ObjectId(collectionId), userId: new ObjectId(userId) }
        ) as Models.DBStatsDoc | null;

        if (stat) {
            stat.wrongTest += wrongCollTest;
            stat.correctTest += correctCollTest;
            stat.wrongTrain += wrongCollTrain;
            stat.correctTrain += correctCollTrain;
            for (const wordState of subResult) {
                const word = stat.words.find(r => r.wordId.toHexString() === wordState.wordId);
                if (word) {
                    word.correctTest += ((wordState.result && wordState.type == ResultType.Test) ? 1 : 0);
                    word.wrongTest += ((!wordState.result && wordState.type == ResultType.Test) ? 1 : 0);
                    word.correctTrain += ((wordState.result && wordState.type == ResultType.Train) ? 1 : 0);
                    word.wrongTrain += ((!wordState.result && wordState.type == ResultType.Train) ? 1 : 0);
                }
            }

            await databaseHelper.getCollection('stats').replaceOne(
                { collectionId: new ObjectId(collectionId), userId: new ObjectId(userId) },
                stat
            );
        }
    }
}




async function getCollectionsFromIds(collectionsIds: ObjectId[]): Promise<{ _id : ObjectId, name: string }[]> {
    return (await databaseHelper
        .getCollection('collections')
        .find( { _id : { $in : collectionsIds } } )
        .project({ _id: 1, name: 1 })
        .toArray()) as { _id : ObjectId, name: string }[];
}

async function getClassUsers(classId: ObjectId): Promise<{ _id : ObjectId, username: string }[]> {
    return (await databaseHelper
        .getCollection('users')
        .find({ joinedClasses: classId})
        .project({_id: 1, username: 1})
        .toArray()) as { _id : ObjectId, username: string}[]; 
}

async function getClassStats(usersId: ObjectId[], collectionsId: ObjectId[] ): Promise<Models.DBStatsDoc[] > {
    return (await  databaseHelper
        .getCollection('stats')
        .find({ userId: { $in : usersId }, collectionId: { $in : collectionsId }})
        .toArray()) as Models.DBStatsDoc[];
}


export async function getClassStatsParsed(userId: string, classId: string): Promise<Models.ClassStats | null> {

    const studyClass = (await databaseHelper
        .getCollection('users')
        .findOne({ _id: new ObjectId(userId), 'createdClasses._id': new ObjectId(classId)}) as Models.DBUserDoc)
        ?.createdClasses
        .find((c => c._id === new ObjectId(classId)));

    if (!studyClass)
        return null;

    const classUsersCall = getClassUsers(studyClass._id as ObjectId);
    const classCollectionsCall = getCollectionsFromIds(studyClass.collections as ObjectId[]);
    const classUsers = await classUsersCall;

    const classCollections = await classCollectionsCall;

    const classStats = await getClassStats(classUsers.map(u => u._id as ObjectId), classCollections.map(u => u._id as ObjectId));

    const res: Models.ClassStats = {
        classId: studyClass._id.toString(),
        correct: classStats.map(s => s.correctTest).reduce((a,b) => a + b, 0),
        wrong: classStats.map(s => s.wrongTest).reduce((a,b) => a + b, 0),
        users: Object.assign({}, ...classUsers.map(u => ({ [u._id.toHexString()]: u.username }))),
        collections: Object.assign({}, ...classCollections.map(c => ({ [c._id.toHexString()]: {
            collectionId: c._id.toHexString(),
            name: c.name,
            correct: 0,
            wrong: 0,
            usernames: [],
            words: { }
        }})))
    };

    const usernamesSet: { [collId: string]: Set<string> } = {};
    for (const collStats of classStats) {
        const collId = collStats.collectionId.toHexString();
        res.collections[collId].correct += collStats.correctTest;
        res.collections[collId].wrong += collStats.wrongTest;
        if (!usernamesSet[collId]) {
            usernamesSet[collId] = new Set();
        }
        usernamesSet[collId].add(collStats.userId.toHexString());

        for (const wStats of collStats.words) {
            const wordId = wStats.wordId.toHexString();
            if (!res.collections[collId].words[wordId]) {
                res.collections[collId].words[wordId] = {
                    wordId: wordId,
                    correct: wStats.correctTest,
                    wrong: wStats.wrongTest
                };
            } else {
                res.collections[collId].words[wordId].correct += wStats.correctTest;
                res.collections[collId].words[wordId].wrong += wStats.wrongTest;
            }
        }
    }

    for (const k in res) {
        res.collections[k].usernames = usernamesSet[k] ? Array.from(usernamesSet[k]) : [];
    }

    return res;
}


export async function getStatsCollection(userId: string, idColl: string): Promise<Models.DBStatsDoc | null> {
    const stats = await databaseHelper.getCollection('stats').findOne({ userId: new ObjectId(userId) , collectionId: new ObjectId( idColl)}) as (Models.DBStatsDoc | null);

    if (!stats)
        return null;
    return Models.getStatsFromDBDoc(stats);
}