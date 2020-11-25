import * as express from 'express';
import * as Models from '../models';
import LANG from '../../../lang';
import * as collectionServices from '../services/collection.services';

async function shareCollectionById(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;

    if (!idColl) {
        return res.status(404).send(LANG.COLLECTION_ID_NOT_FOUND);
    }
    collectionServices.updateCollectionById(idColl, res.locals.username, { share: true });
    const link = `api/v1/share/import/${idColl}`;
    
    res.send({ url: link });

}

async function importCollection(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;

    if (!idColl) {
        return res.status(404).send(LANG.COLLECTION_ID_NOT_FOUND);
    }

    const collection = await collectionServices.getCollectionById(idColl, res.locals.username);

    if (!collection?.share) {
        return res.status(404).send(LANG.COLLECTION_NOT_SHARED);
    }


    await collectionServices.createCollection(collection, res.locals._id, res.locals.username);
    return res.status(204).send();

}

export default function (): express.Router {

    const router = express.Router();

    router.get('/:idColl', shareCollectionById);
    router.get('/import/:idColl', importCollection);

    return router;

}