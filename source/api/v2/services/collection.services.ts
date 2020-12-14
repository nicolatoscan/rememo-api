import * as Models from '../models';
import databaseHelper from '../../../helpers/database.helper';
import { FilterQuery, ObjectId } from 'mongodb';
import * as classServices from '../services/class.services';


export async function getCollections(minified: boolean, userId: string, ownershipType: Models.EClassOwnershipType, classIdsFilter: string[] | null): Promise<Models.Collection[] | Models.CollectionMin[]> {
    let query: FilterQuery<any> = { owner: new ObjectId(userId) };
    const collectionIdsToNameDic: { [id: string]: string } = {};

    if (ownershipType !== Models.EClassOwnershipType.Created) {

        let classIds = (((await databaseHelper
            .getCollection('users')
            .findOne({ _id: new ObjectId(userId) })) as Models.DBUserDoc)
            ?.joinedClasses ?? []) as ObjectId[];
        if (classIdsFilter)
            classIds = classIds.filter(cId => classIdsFilter.includes(cId.toString()));

        const classes = (await classServices.getClassesFromIds(classIds));
        const collsToGet: ObjectId[] = [];
        for (const studyClass of classes) {
            for (const collId of studyClass.collections as ObjectId[]) {
                collectionIdsToNameDic[collId.toHexString()] = studyClass.name;
                collsToGet.push(collId);
            }
        }

        if (ownershipType === Models.EClassOwnershipType.Both) {
            if (collsToGet.length > 0)
                query = { $or: [{ _id: { $in: collsToGet } }, { owner: new ObjectId(userId) }] };
        } else if (ownershipType === Models.EClassOwnershipType.Joined) {
            if (collsToGet.length === 0)
                return [];
            query = { _id: { $in: collsToGet } };
        }
    }

    const mongoPointer = databaseHelper
        .getCollection('collections')
        .find(query);

    if (minified) {
        return ((await mongoPointer.project({
            _id: 1,
            name: 1,
            description: 1,
            languageFrom: 1,
            languageTo: 1
        }).toArray()) as Models.CollectionMin[]).map(col => ({ ...col, inClassName: collectionIdsToNameDic[col._id?.toString() ?? ''] ?? undefined }));
    } else {
        return ((await mongoPointer.toArray()) as Models.DBCollectionDoc[])
            .map(col =>
                Models.getCollectionFromDBDoc(col, collectionIdsToNameDic[col._id?.toString() ?? ''] ?? null)
            ) as Models.Collection[];
    }
}

/**
 * @deprecated
 */
export async function getAllCollections(userId: string): Promise<Models.Collection[]> {
    const user = (await databaseHelper.getCollection('users').findOne({ _id: new ObjectId(userId) })) as Models.DBUserDoc | null;
    if (!user)
        return [];
    const collectionIDs = (await classServices.getClassesFromIds(user.joinedClasses as ObjectId[])).map(c => c.collections).flat(1);
    const collections = await databaseHelper.getCollection('collections').find({ $or: [{ _id: { $in: collectionIDs } }, { owner: new ObjectId(userId) }] }).toArray();
    return collections.map(col => Models.getCollectionFromDBDoc(col));
}

/**
 * @deprecated
 */
export async function getCollectionsOld(userId: string): Promise<Models.Collection[]> {
    const collections = await databaseHelper.getCollection('collections').find({ owner: new ObjectId(userId) }).toArray();
    return collections.map(col => Models.getCollectionFromDBDoc(col));
}

/**
 * @deprecated
 */
export async function getJoinedClassCollections(userId: string): Promise<Models.Collection[]> {
    const user = (await databaseHelper.getCollection('users').findOne({ _id: new ObjectId(userId) })) as Models.DBUserDoc | null;
    if (!user)
        return [];
    const collectionIDs = (await classServices.getClassesFromIds(user.joinedClasses as ObjectId[])).map(c => c.collections).flat(1);
    const collections = await databaseHelper.getCollection('collections').find({ _id: { $in: collectionIDs } }).toArray();
    return collections.map(col => Models.getCollectionFromDBDoc(col));
}

/**
 * @deprecated
 */
export async function getClassCollection(classIds: ObjectId[]): Promise<Models.Collection[]> {
    const collectionIDs = (await classServices.getClassesFromIds(classIds as ObjectId[])).map(c => c.collections).flat(1);
    const collections = await databaseHelper.getCollection('collections').find({ _id: { $in: collectionIDs } }).toArray();
    return collections.map(col => Models.getCollectionFromDBDoc(col));
}


export async function createCollection(collection: Models.Collection, userId: string): Promise<{ collectionId: string }> {

    delete collection._id;
    collection.owner = new ObjectId(userId);
    const collectionToInsert = Models.createDBCollectionDoc(collection);

    const insertedId = (await databaseHelper.getCollection('collections').insertOne(collectionToInsert)).insertedId;

    const insertStudy = databaseHelper.getCollection('collection-study-state').insertOne(
        Models.createEmptyDBCollectionStudyStateDoc(insertedId, userId, collectionToInsert.words.map(w => w._id?.toString() ?? ''))
    );

    const insertStats = databaseHelper.getCollection('stats').insertOne(
        Models.createDBStatsDoc(insertedId, userId, collectionToInsert.words.map(w => w._id?.toString() ?? ''))
    );

    await insertStudy;
    await insertStats;
    return { collectionId: insertedId };

}

export async function getCollectionById(id: string, userId: string): Promise<Models.Collection | null> {
    const collection = await databaseHelper.getCollection('collections').findOne({ _id: new ObjectId(id) }) as Models.DBCollectionDoc | null;
    if (!collection)
        return null;

    if (collection.owner?.toString() !== userId && !collection.share) {
        const user = (await databaseHelper.getCollection('users').findOne({ _id: new ObjectId(userId) })) as Models.DBUserDoc | null;
        if (!user)
            return null;
        const classFound = databaseHelper.getCollection('users').find({ 'createdClasses.collections': new ObjectId(id), 'createdClasses._id': { $in: user.joinedClasses } });
        if (!classFound)
            return null;
    }

    return Models.getCollectionFromDBDoc(collection);
}

export async function updateCollectionById(id: string, userId: string, updateProps: any): Promise<void> {
    if (updateProps._id)
        delete updateProps._id;
    updateProps.lastModified = new Date();
    await databaseHelper.getCollection('collections').updateOne({ _id: new ObjectId(id), owner: new ObjectId(userId) }, { $set: updateProps });
}

export async function deleteCollectionById(id: string, userId: string): Promise<void> {
    const deleted = (await databaseHelper
        .getCollection('collections')
        .deleteOne({ _id: new ObjectId(id), owner: new ObjectId(userId) }))
        .deletedCount;
    if (deleted && deleted > 1) {
        databaseHelper.getCollection('collection-study-state').deleteMany({ collectionId: new ObjectId(id) });
        databaseHelper.getCollection('stats').deleteMany({ collectionId: new ObjectId(id) });
    }

}

export async function createWord(word: Models.Word, collectionId: string, userId: string): Promise<{ wordId: string }> {
    word._id = new ObjectId();

    const modified = (await databaseHelper.getCollection('collections').updateOne(
        { _id: new ObjectId(collectionId), owner: new ObjectId(userId) },
        { $push: { words: word } }
    )).modifiedCount;

    if (modified) {

        const callStudy = databaseHelper.getCollection('collection-study-state').updateMany(
            { collectionId: new ObjectId(collectionId) },
            { $push: { wordsState: Models.createEmptyWordStudyState((word._id as ObjectId).toHexString()) } }
        );

        const callStats = await databaseHelper.getCollection('stats').updateMany(
            { collectionId: new ObjectId(collectionId) },
            { $push: { words: Models.createEmptyWordStats((word._id as ObjectId).toHexString()) } }
        );
        await callStudy;
        await callStats;
    }

    return { wordId: word._id.toHexString() };

}

export async function getWordById(collectionId: string, wordId: string, userId: string): Promise<Models.Word | null> {
    const collection = await databaseHelper.getCollection('collections').findOne({ _id: new ObjectId(collectionId), owner: new ObjectId(userId) });
    if (!collection) {
        return null;
    }

    const word = Models.getCollectionFromDBDoc(collection).words.find(w => w._id === wordId);
    if (!word)
        return null;

    return word;
}

export async function updateWordById(collectionId: string, wordId: string, userId: string, updateProps: any): Promise<void> {
    if (updateProps._id)
        delete updateProps._id;
    await databaseHelper.getCollection('collections').updateOne(
        { _id: new ObjectId(collectionId), owner: new ObjectId(userId), 'words._id': wordId },
        { $set: { 'words.$': updateProps } }
    );
}

export async function deleteWordById(collectionId: string, wordId: string, userId: string): Promise<void> {
    const modified = (await databaseHelper.getCollection('collections').updateOne(
        { _id: new ObjectId(collectionId), owner: new ObjectId(userId) },
        { $pull: { words: { _id: new ObjectId(wordId) } } }
    )).modifiedCount;

    if (modified > 0) {
        databaseHelper.getCollection('collection-study-state').updateMany(
            { collectionId: new ObjectId(collectionId) },
            { $pull: { wordsState: { wordId: new ObjectId(wordId) } } }
        );

        databaseHelper.getCollection('stats').updateMany(
            { collectionId: new ObjectId(collectionId) },
            { $pull: { words: { wordId: new ObjectId(wordId) } } }
        );
    }
}


