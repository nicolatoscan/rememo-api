import * as express from 'express';
import * as learnServices from '../../services/study.services/learn.services';
//import queryString from 'querystring';
import LANG from '../../../../lang';


async function getCollectionLearnState(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;
    const idUser = res.locals._id;
    
    if (!idColl) {
        return res.status(404).send(LANG.COLLECTION_ID_NOT_FOUND);
    }

    const learnState = await learnServices.getCollectionLearnStatus(idColl, idUser);

    if(!learnState) {
        return res.status(404).send(LANG.LEARN_STATE_COLLECTION_NOT_FOUND);
    } else {
        return res.send(learnState);
    }
}

async function updateWordLearnState(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;
    const idUser = res.locals._id;
    
    if (!idColl) {
        return res.status(404).send(LANG.COLLECTION_ID_NOT_FOUND);
    }

    const wordId = req.query.wordId as string;
    const status = Number(req.query.status);

    if (!wordId || !status) {
        return res.status(404).send(LANG.LEARN_STATE_WORD_QUERY_PARAM_NOT_FOUND);
    }

    await learnServices.updateWordLearnState(idColl, idUser, wordId, status);

    return res.status(204).send(LANG.LEARN_STATE_WORD_UPDATED);
}


export default function (): express.Router {
    const router = express.Router();

    router.get('/:idColl/status', getCollectionLearnState);
    router.put('/:idColl/learned', updateWordLearnState);

    return router;
}