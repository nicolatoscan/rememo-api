import * as express from 'express';
import * as learnServices from '../../services/study.services/learn.services';
//import queryString from 'querystring';
import LANG from '../../../../lang';
import * as typesHelper from './../../../../helpers/types.helper';



async function getCollectionLearnState(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;
    const idUser = res.locals._id;
    
    if (!typesHelper.checkId(idColl)) {
        return res.status(404).send(LANG.COLLECTION_ID_NOT_FOUND);
    }

    const collectionLearnState = await learnServices.getCollectionLearnState(idColl, idUser);

    if(!collectionLearnState) {
        return res.status(404).send(LANG.LEARN_STATE_COLLECTION_NOT_FOUND);
    } else {
        return res.send(collectionLearnState);
    }
}

async function updateWordLearnState(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;
    const idUser = res.locals._id;
    
    if (!typesHelper.checkId(idColl)) {
        return res.status(404).send(LANG.COLLECTION_ID_NOT_FOUND);
    }

    const wordId = req.query.wordId as string;
    const status = Number(req.query.status);

    if (!wordId || (status == null) || (status == undefined)) {
        return res.status(404).send(LANG.LEARN_STATE_WORD_QUERY_PARAM_NOT_FOUND);
    }

    await learnServices.updateWordLearnState(idColl, idUser, wordId, status);

    return res.status(204).send(LANG.LEARN_STATE_WORD_UPDATED);
}

async function resetCollectionLearnState(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;
    const idUser = res.locals._id;
    
    if (!typesHelper.checkId(idColl)) {
        return res.status(404).send(LANG.COLLECTION_ID_NOT_FOUND);
    }

    await learnServices.resetCollectionLearnState(idColl, idUser);

    return res.status(204).send(LANG.LEARN_STATE_COLLECTION_RESETED);

}


export default function (): express.Router {
    const router = express.Router();

    router.get('/:idColl/status', getCollectionLearnState);
    router.put('/:idColl/learned', updateWordLearnState);
    router.put('/:idColl/reset', resetCollectionLearnState);

    return router;
}