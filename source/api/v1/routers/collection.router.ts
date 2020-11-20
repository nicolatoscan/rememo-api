import * as express from 'express';
import * as Models from '../models';
import databaseService from '../../../services/database.services';
import { ObjectId } from 'mongodb';


async function getCollections(req: express.Request, res: express.Response) {

    const collections = await databaseService.getCollection('collections').find({ owner: res.locals.username }).toArray();

    return res.send(collections.map(col => Models.getCollectionFromDBDoc(col)));

}


async function createCollection(req: express.Request, res: express.Response) {
    const valCollection = Models.validateCollection(req.body);
    if (valCollection.error) {
        return res.status(400).send(valCollection.error);
    } else if (valCollection.value) {

        const collection = valCollection.value;
        collection.owner = res.locals.username;
        const insertedId = (await databaseService.getCollection('collections').insertOne(Models.createDBCollectionDoc(collection))).insertedId;
        return res.status(201).send({ _id: insertedId });

    }
}

async function getCollectionById(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;
    if (!idColl) {
        return res.status(404).send('No collection id found');
    }

    const collection = await databaseService.getCollection('collections').findOne({ _id: new ObjectId(idColl), owner: res.locals.username });
    if (!collection) {
        return res.status(404).send('No collection found');
    } else {
        return res.send(Models.getCollectionFromDBDoc(collection));
    }
}

async function deleteCollectionById(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;
    if (!idColl) {
        return res.status(404).send('No collection id found');
    }

    const collection = await databaseService.getCollection('collections').deleteOne({ _id: new ObjectId(idColl), owner: res.locals.username });
    if (!collection) {
        return res.status(404).send('No collection found');
    } else {
        return res.status(204).send({ message: 'Collection deleted' });
    }
}

async function createWord(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;
    if (!idColl) {
        return res.status(404).send('No collection id found');
    }

    const valWord = Models.validateWord(req.body);
    if (valWord.error) {
        return res.status(400).send(valWord.error);
    } else if (valWord.value) {
        const word = valWord.value;
        word._id = new ObjectId();
        await databaseService.getCollection('collections').updateOne(
            { _id: new ObjectId(idColl), owner: res.locals.username },
            { $push: { words: word } }
        );

        return res.status(201).send({ _id: word._id });
    }
}

async function updateCollectionById(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;
    if (!idColl) {
        return res.status(404).send('No collection id found');
    }

    const valCollection = Models.validateCollection(req.body);
    if (valCollection.error) {
        return res.status(400).send(valCollection.error);
    } else if (valCollection.value) {
        const collection: any = valCollection.value;
        delete collection._id;
        delete collection.owner;
        delete collection.words;
        await databaseService.getCollection('collections').updateOne({ _id: new ObjectId(idColl), owner: res.locals.username }, { $set: collection });
        return res.status(204).send({ message: 'Collection updated' });
    }

}


async function getWord(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;
    if (!idColl) {
        return res.status(404).send('No collection id found');
    }


    const idWord = req.params.idWord;
    if (!idWord) {
        return res.status(404).send('No word id found');
    }

    const collection = await databaseService.getCollection('collections').findOne({ _id: new ObjectId(idColl), owner: res.locals.username });

    if (!collection) {
        return res.status(404).send('No collection found');
    }


    const word = Models.getCollectionFromDBDoc(collection).words.find(w => w._id === idWord);

    if (!word) {
        return res.status(404).send('No word found');
    } else {
        return res.send(word);
    }

}


async function updateWord(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;
    if (!idColl) {
        return res.status(404).send('No collection id found');
    }

    const idWord = req.params.idWord;
    if (!idWord) {
        return res.status(404).send('No word id found');
    }

    const valWord = Models.validateWord(req.body);
    if (valWord.error) {
        return res.status(400).send(valWord.error);
    } else if (valWord.value) {
        const word = valWord.value;
        word._id = new ObjectId(idWord);
        await databaseService.getCollection('collections').updateOne(
            { _id: new ObjectId(idColl), owner: res.locals.username, 'words._id': word._id },
            { $set: { 'words.$': word } }
        );
        return res.status(204).send({ message: 'Word updated' });
    }

}

async function deleteWord(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;
    if (!idColl) {
        return res.status(404).send('No collection id found');
    }

    const idWord = req.params.idWord;
    if (!idWord) {
        return res.status(404).send('No word id found');
    }
    console.log(idColl);
    console.log(idWord);
    const word = await databaseService.getCollection('collections').updateOne(
        { _id: new ObjectId(idColl), owner: res.locals.username }, 
        {$pull: {words: {_id: new ObjectId(idWord)} } }
    );

    if (!word) {
        return res.status(404).send('No word found');
    } else {
        return res.status(204).send({ message: 'Word deleted' });
    }

}


export default function (): express.Router {
    const router = express.Router();
    router.get('/', getCollections);
    router.post('/', createCollection);
    router.get('/:idColl', getCollectionById);
    router.delete('/:idColl', deleteCollectionById);
    router.post('/:idColl/words', createWord);
    router.put('/:idColl', updateCollectionById);
    router.get('/:idColl/words/:idWord', getWord);
    router.delete('/:idColl/words/:idWord', deleteWord);
    router.put('/:idColl/words/:idWord', updateWord);
    return router;
}