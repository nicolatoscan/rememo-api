import * as Models from '../models';
import databaseHelper from '../../../helpers/database.helper';
import { ObjectId } from 'mongodb';


export async function getCollections(userId: string): Promise<Models.Collection[]> {
    const collections = await databaseHelper.getCollection('collections').find({ owner: new ObjectId(userId) }).toArray();
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
    await databaseHelper.getCollection('stats').deleteOne({ collectionId: new ObjectId(id), userId: new ObjectId(userId)});

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


