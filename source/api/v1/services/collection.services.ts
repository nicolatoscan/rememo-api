import * as Models from '../models';
import databaseHelper from '../../../helpers/database.helper';
import { ObjectId } from 'mongodb';


export async function getCollections(username: string): Promise<Models.Collection[]> {
    const collections = await databaseHelper.getCollection('collections').find({ owner: username }).toArray();
    return collections.map(col => Models.getCollectionFromDBDoc(col));
}

export async function createCollection(collection: Models.Collection, userId: string, owner: string): Promise<{ collectionId: string }> {

    collection.owner = owner;
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

export async function getCollectionById(id: string, owner: string): Promise<Models.Collection | null> {
    const collection = await databaseHelper.getCollection('collections').findOne({ _id: new ObjectId(id), owner: owner });
    if (!collection)
        return null;
    return Models.getCollectionFromDBDoc(collection);
}

export async function updateCollectionById(id: string, owner: string, updateProps: any): Promise<void> {
    if (updateProps._id)
        delete updateProps._id;
    updateProps.lastModified = new Date();
    await databaseHelper.getCollection('collections').updateOne({ _id: new ObjectId(id), owner: owner }, { $set: updateProps });
}

export async function deleteCollectionById(id: string, userId: string, owner: string): Promise<void> {
    await databaseHelper.getCollection('collections').deleteOne({ _id: new ObjectId(id), owner: owner });
    await databaseHelper.getCollection('collection-study-state').deleteOne({ collectionId: new ObjectId(id), userId: new ObjectId(userId) });
    await databaseHelper.getCollection('stats').deleteOne({ collectionId: new ObjectId(id), userId: new ObjectId(userId)});

}

export async function createWord(word: Models.Word, collectionId: string, userId: string, owner: string): Promise<{ wordId: string }> {
    word._id = new ObjectId();

    await databaseHelper.getCollection('collections').updateOne(
        { _id: new ObjectId(collectionId), owner: owner },
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

export async function getWordById(collectionId: string, wordId: string, owner: string): Promise<Models.Word | null> {
    const collection = await databaseHelper.getCollection('collections').findOne({ _id: new ObjectId(collectionId), owner: owner });
    if (!collection) {
        return null;
    }

    const word = Models.getCollectionFromDBDoc(collection).words.find(w => w._id === wordId);
    if (!word)
        return null;

    return word;
}

export async function updateWordById(collectionId: string, wordId: string, owner: string, updateProps: any): Promise<void> {
    if (updateProps._id)
        delete updateProps._id;
    await databaseHelper.getCollection('collections').updateOne(
        { _id: new ObjectId(collectionId), owner: owner, 'words._id': wordId },
        { $set: { 'words.$': updateProps } }
    );
}

export async function deleteWordById(collectionId: string, wordId: string, userId: string, owner: string): Promise<void> {
    await databaseHelper.getCollection('collections').updateOne(
        { _id: new ObjectId(collectionId), owner: owner },
        { $pull: { words: { _id: new ObjectId(wordId) } } }
    );

    await databaseHelper.getCollection('collection-study-state').updateOne(
        { collectionId: new ObjectId(collectionId), userId: new ObjectId(userId) },
        { $pull: { wordsState: { wordId: new ObjectId(wordId) } } }
    );
}


