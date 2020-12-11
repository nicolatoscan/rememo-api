import * as express from 'express';
import * as learnServices from '../../services/study.services/learn.services';
import LANG from '../../../../lang';


async function getCollectionLearnStatus(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;
    const idUser = res.locals._id;
    
    if (!idColl) {
        return res.status(404).send(LANG.COLLECTION_ID_NOT_FOUND);
    }

    const learnState = await learnServices.getCollectionLearnStatus(idColl, idUser);

    if(!learnState) {
        return res.status(404).send(LANG.COLLECTION_NOT_FOUND);
    } else {
        return res.send(learnState);
    }
}


export default function (): express.Router {
    const router = express.Router();

    router.get('/:idColl/status', getCollectionLearnStatus);

    return router;
}