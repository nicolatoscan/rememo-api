import * as express from 'express';
import * as Models from '../models';
import databaseService from '../../../services/database.services';

async function createCollection(req: express.Request, res: express.Response) {
    const valCollection = Models.validateCollection(req.body);
    if (valCollection.error) {
        return res.status(400).send(valCollection.error);
    } else if (valCollection.value) {

        const collection = valCollection.value;
        const insertedId = (await databaseService.getCollection('collections').insertOne(Models.createDBCollectionDoc(collection))).insertedId;
        return res.status(201).send({ id: insertedId });

    }
}

export default function (): express.Router {
    const router = express.Router();
    router.post('/', createCollection);
    return router;
}