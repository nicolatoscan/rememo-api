import * as express from 'express';
import * as Models from '../models';
import LANG from '../../../lang';
import { updateCollectionById } from '../services/collection.services';



async function shareCollectionById(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;

    if (!idColl) {
        return res.status(404).send(LANG.COLLECTION_ID_NOT_FOUND);
    }
    updateCollectionById(idColl, res.locals.username, {share: true});
    const link:string = 'api/v1/share/import/' + idColl;
    res.send(link);

}

async function importCollection(req: express.Request, res: express.Response) {

    //todo

}

export default function (): express.Router {

    const router = express.Router();

    router.get('/:idColl', shareCollectionById);
    router.get('/import/:idCol', importCollection);

    return router;

}