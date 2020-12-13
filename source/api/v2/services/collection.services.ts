import * as Models from '../models';
import databaseHelper from '../../../helpers/database.helper';
import { FilterQuery, ObjectId } from 'mongodb';
import * as classServices from '../services/class.services';


export async function getCollections(userId: string, ownershipType: Models.EClassOwnershipType, classIdsFilter: string[] | null): Promise<Models.Collection[]> {
    let query: FilterQuery<any> = { owner: new ObjectId(userId) };
    
    if (ownershipType !== Models.EClassOwnershipType.Mine) {

        const user = (await databaseHelper.getCollection('users').findOne({ _id: new ObjectId(userId) })) as Models.DBUserDoc;
        let collectionIDs = (await classServices.getClassesFromIds(user.joinedClasses as ObjectId[])).map(c => c.collections).flat(1);

        if (classIdsFilter)
            collectionIDs = collectionIDs.filter(cId => classIdsFilter.includes(cId.toString()));

        if (ownershipType === Models.EClassOwnershipType.Both) {
            if (collectionIDs.length > 0)
                query = { $or: [{ _id: { $in: collectionIDs } }, { owner: new ObjectId(userId) }] };
        } else if (ownershipType === Models.EClassOwnershipType.Joined) {
            if (collectionIDs.length === 0)
                return [];
            query = { _id: { $in: collectionIDs } };
        }
    }

    return (await databaseHelper
        .getCollection('collections')
        .find(query)
        .toArray())
        .map(col => Models.getCollectionFromDBDoc(col)) as Models.Collection[];
}

/**
 * @deprecated
 */
export async function getAllCollections(userId: string): Promise<Models.Collection[]> {
    const user = (await databaseHelper.getCollection('users').findOne({ _id: new ObjectId(userId) })) as Models.DBUserDoc;
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
    const user = (await databaseHelper.getCollection('users').findOne({ _id: new ObjectId(userId) })) as Models.DBUserDoc;
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

    await databaseHelper.getCollection('collection-study-state').insertOne(
        Models.createEmptyDBCollectionStudyStateDoc(insertedId, userId, collectionToInsert.words.map(w => w._id?.toString() ?? ''))
    );

    await databaseHelper.getCollection('stats').insertOne(
        Models.createDBStatsDoc(insertedId, userId, collectionToInsert.words.map(w => w._id?.toString() ?? ''))
    );

    return { collectionId: insertedId };

}

export async function getCollectionById(id: string, userId: string): Promise<Models.Collection | null> {
    const collection = await databaseHelper.getCollection('collections').findOne({ _id: new ObjectId(id) }) as Models.DBCollectionDoc;
    if (!collection)
        return null;
    if (collection.owner?.toString() === userId || collection.share)
        return Models.getCollectionFromDBDoc(collection);
    else
        return null;
}

export async function updateCollectionById(id: string, userId: string, updateProps: any): Promise<void> {
    if (updateProps._id)
        delete updateProps._id;
    updateProps.lastModified = new Date();
    await databaseHelper.getCollection('collections').updateOne({ _id: new ObjectId(id), owner: new ObjectId(userId) }, { $set: updateProps });
}

export async function deleteCollectionById(id: string, userId: string): Promise<void> {
    await databaseHelper.getCollection('collections').deleteOne({ _id: new ObjectId(id), owner: new ObjectId(userId) });
    await databaseHelper.getCollection('collection-study-state').deleteOne({ collectionId: new ObjectId(id), userId: new ObjectId(userId) });
    await databaseHelper.getCollection('stats').deleteOne({ collectionId: new ObjectId(id), userId: new ObjectId(userId) });

}

export async function createWord(word: Models.Word, collectionId: string, userId: string): Promise<{ wordId: string }> {
    word._id = new ObjectId();

    await databaseHelper.getCollection('collections').updateOne(
        { _id: new ObjectId(collectionId), owner: new ObjectId(userId) },
        { $push: { words: word } }
    );

    await databaseHelper.getCollection('collection-study-state').updateOne(
        { collectionId: new ObjectId(collectionId), userId: new ObjectId(userId) },
        { $push: { wordsState: Models.createEmptyWordStudyState((word._id as ObjectId).toHexString()) } }
    );

    await databaseHelper.getCollection('stats').updateOne(
        { collectionId: new ObjectId(collectionId), userId: new ObjectId(userId) },
        { $push: { words: Models.createEmptyWordStats((word._id as ObjectId).toHexString()) } }
    );

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
    await databaseHelper.getCollection('collections').updateOne(
        { _id: new ObjectId(collectionId), owner: new ObjectId(userId) },
        { $pull: { words: { _id: new ObjectId(wordId) } } }
    );

    await databaseHelper.getCollection('collection-study-state').updateOne(
        { collectionId: new ObjectId(collectionId), userId: new ObjectId(userId) },
        { $pull: { wordsState: { wordId: new ObjectId(wordId) } } }
    );

    await databaseHelper.getCollection('stats').updateOne(
        { collectionId: new ObjectId(collectionId), userId: new ObjectId(userId) },
        { $pull: { words: { wordId: new ObjectId(wordId) } } }
    );
}


