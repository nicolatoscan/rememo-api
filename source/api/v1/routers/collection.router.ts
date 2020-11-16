import * as express from 'express';
import * as Models from '../models';
import databaseService from '../../../services/database.services';
import { ObjectId } from 'mongodb';


async function getCollections(req: express.Request, res: express.Response) {

    const collections = await databaseService.getCollection('collections').find({owner: res.locals.username}).toArray();

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

async function getCollectionById(req: express.Request, res: express.Response){
    const idColl = req.params.idColl;
    if (!idColl) {
        return res.status(404).send('No collection id found');
    }

    const collection = await databaseService.getCollection('collections').findOne({_id: new ObjectId(idColl), owner: res.locals.username });
    if (!collection) {
        return res.status(404).send('No collection found');
    } else {
        return res.send(Models.getCollectionFromDBDoc(collection));
    }
}

async function deleteCollectionById(req: express.Request, res: express.Response){
    const idColl = req.params.idColl;
    if (!idColl) {
        return res.status(404).send('No collection id found');
    }

    const collection = await databaseService.getCollection('collections').deleteOne({_id: new ObjectId(idColl), owner: res.locals.username });
    if (!collection) {
        return res.status(404).send('No collection found');
    } else {
        return res.send({message:'Collection deleted'});
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


export default function (): express.Router {
    const router = express.Router();
    router.get('/', getCollections);
    router.post('/', createCollection);
    router.get('/:idColl', getCollectionById);
    router.delete('/:idColl', deleteCollectionById);
    router.post('/:idColl/words', createWord);
    return router;
}