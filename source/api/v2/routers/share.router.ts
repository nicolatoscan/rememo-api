import * as express from 'express';
import LANG from '../../../lang';
import * as collectionServices from '../services/collection.services';
import * as typesHelper from '../../../helpers/types.helper';

async function shareCollectionById(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;

    if (!typesHelper.checkId(idColl)) {
        return res.status(404).send(LANG.COLLECTION_ID_NOT_FOUND);
    }
    collectionServices.updateCollectionById(idColl, res.locals._id, { share: true });
    const link = `share/import/${idColl}`;
    
    res.send({ url: link });

}

async function importCollection(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;

    if (!typesHelper.checkId(idColl)) {
        return res.status(404).send(LANG.COLLECTION_ID_NOT_FOUND);
    }

    const collection = await collectionServices.getCollectionById(idColl, res.locals._id);

    if (!collection?.share) {
        return res.status(404).send(LANG.COLLECTION_NOT_SHARED);
    }


    await collectionServices.createCollection(collection, res.locals._id);
    return res.status(204).send();

}

export default function (): express.Router {

    const router = express.Router();

    router.get('/:idColl', shareCollectionById);
    router.get('/import/:idColl', importCollection);

    return router;

}