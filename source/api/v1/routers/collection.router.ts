import * as express from 'express';
import * as Models from '../models';
import databaseHelper from '../../../helpers/database.helper';
import LANG from '../../../lang';
import { ObjectId } from 'mongodb';

// --- COLLECTIONS ---
async function getCollections(req: express.Request, res: express.Response) {

    const collections = await databaseHelper.getCollection('collections').find({ owner: res.locals.username }).toArray();

    return res.send(collections.map(col => Models.getCollectionFromDBDoc(col)));

}

async function createCollection(req: express.Request, res: express.Response) {
    const valCollection = Models.validateCollection(req.body);
    if (valCollection.error) {
        return res.status(400).send(valCollection.error);

    } else if (valCollection.value) {
        const collection = valCollection.value;
        collection.owner = res.locals.username;

        const collectionToInsert = Models.createDBCollectionDoc(collection);
        const insertedId = (await databaseHelper.getCollection('collections').insertOne(collectionToInsert)).insertedId;

        await databaseHelper.getCollection('collection-study-state').insertOne(
            Models.getEmptyDBCollectionStudyStateDoc(insertedId, res.locals._id, collectionToInsert.words.map(w => w._id?.toString() ?? ''))
        );

        return res.status(201).send({ _id: insertedId });
    }
}

async function getCollectionById(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;
    if (!idColl) {
        return res.status(404).send(LANG.COLLECTION_ID_NOT_FOUND);
    }

    const collection = await databaseHelper.getCollection('collections').findOne({ _id: new ObjectId(idColl), owner: res.locals.username });
    if (!collection) {
        return res.status(404).send(LANG.COLLECTION_NOT_FOUND);
    } else {
        return res.send(Models.getCollectionFromDBDoc(collection));
    }
}

async function updateCollectionById(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;
    if (!idColl) {
        return res.status(404).send(LANG.COLLECTION_ID_NOT_FOUND);
    }

    const valCollection = Models.validateCollection(req.body);
    if (valCollection.error) {
        return res.status(400).send(valCollection.error);

    } else if (valCollection.value) {
        const collection: any = valCollection.value;
        delete collection._id;
        delete collection.owner;
        delete collection.words;
        collection.lastModified = new Date();
        await databaseHelper.getCollection('collections').updateOne({ _id: new ObjectId(idColl), owner: res.locals.username }, { $set: collection });

        return res.status(204).send({ message: LANG.COLLECTION_UPDATED });
    }

}

async function deleteCollectionById(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;
    if (!idColl) {
        return res.status(404).send(LANG.COLLECTION_ID_NOT_FOUND);
    }

    await databaseHelper.getCollection('collections').deleteOne({ _id: new ObjectId(idColl), owner: res.locals.username });
    await databaseHelper.getCollection('collection-study-state').deleteOne({ collectionId: new ObjectId(idColl), userId: new ObjectId(res.locals._id) });

    return res.status(204).send({ message: LANG.COLLECTION_DELETED });
}

// --- WORDS ---
async function createWord(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;
    if (!idColl) {
        return res.status(404).send(LANG.COLLECTION_ID_NOT_FOUND);
    }

    const valWord = Models.validateWord(req.body);
    if (valWord.error) {
        return res.status(400).send(valWord.error);
    } else if (valWord.value) {
        const word = valWord.value;
        word._id = new ObjectId();

        await databaseHelper.getCollection('collections').updateOne(
            { _id: new ObjectId(idColl), owner: res.locals.username },
            { $push: { words: word } }
        );

        await databaseHelper.getCollection('collection-study-state').updateOne(
            { collectionId: new ObjectId(idColl), userId: new ObjectId(res.locals._id) },
            { $push: { wordsState: Models.getEmptyWordStudyState((word._id as ObjectId).toHexString()) } }
        );

        return res.status(201).send({ _id: word._id });
    }
}

async function getWord(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;
    if (!idColl) {
        return res.status(404).send(LANG.COLLECTION_ID_NOT_FOUND);
    }


    const idWord = req.params.idWord;
    if (!idWord) {
        return res.status(404).send(LANG.WORD_ID_NOT_FOUND);
    }

    const collection = await databaseHelper.getCollection('collections').findOne({ _id: new ObjectId(idColl), owner: res.locals.username });

    if (!collection) {
        return res.status(404).send(LANG.COLLECTION_NOT_FOUND);
    }


    const word = Models.getCollectionFromDBDoc(collection).words.find(w => w._id === idWord);

    if (!word) {
        return res.status(404).send(LANG.WORD_NOT_FOUND);
    } else {
        return res.send(word);
    }

}

async function updateWord(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;
    if (!idColl) {
        return res.status(404).send(LANG.COLLECTION_ID_NOT_FOUND);
    }

    const idWord = req.params.idWord;
    if (!idWord) {
        return res.status(404).send(LANG.WORD_ID_NOT_FOUND);
    }

    const valWord = Models.validateWord(req.body);
    if (valWord.error) {
        return res.status(400).send(valWord.error);

    } else if (valWord.value) {
        const word = valWord.value;
        word._id = new ObjectId(idWord);
        await databaseHelper.getCollection('collections').updateOne(
            { _id: new ObjectId(idColl), owner: res.locals.username, 'words._id': word._id },
            { $set: { 'words.$': word } }
        );

        return res.status(204).send({ message: LANG.WORD_UPDATED });
    }

}

async function deleteWord(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;
    if (!idColl) {
        return res.status(404).send(LANG.COLLECTION_ID_NOT_FOUND);
    }

    const idWord = req.params.idWord;
    if (!idWord) {
        return res.status(404).send(LANG.WORD_ID_NOT_FOUND);
    }

    const word = await databaseHelper.getCollection('collections').updateOne(
        { _id: new ObjectId(idColl), owner: res.locals.username },
        { $pull: { words: { _id: new ObjectId(idWord) } } }
    );

    
    await databaseHelper.getCollection('collection-study-state').updateOne(
        { collectionId: new ObjectId(idColl), userId: new ObjectId(res.locals._id) },
        { $pull: { wordsState: { wordId: new ObjectId(idWord) } } }
    );

    if (!word) {
        return res.status(404).send(LANG.WORD_NOT_FOUND);
    } else {
        return res.status(204).send({ message: LANG.WORD_DELETED });
    }

}


export default function (): express.Router {
    const router = express.Router();

    router.get('/', getCollections);

    router.post('/', createCollection);
    router.get('/:idColl', getCollectionById);
    router.put('/:idColl', updateCollectionById);
    router.delete('/:idColl', deleteCollectionById);

    router.post('/:idColl/words', createWord);
    router.get('/:idColl/words/:idWord', getWord);
    router.put('/:idColl/words/:idWord', updateWord);
    router.delete('/:idColl/words/:idWord', deleteWord);

    return router;
}