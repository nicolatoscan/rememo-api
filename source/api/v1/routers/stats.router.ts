import * as express from 'express';
import * as Models from '../models';
import * as statsServices from '../services/stats.services';
import LANG from '../../../lang';




async function getCollStatsTest(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;
    
    if (!idColl) {
        return res.status(404).send(LANG.TEST_NOT_FOUND);
    }
    
}

async function getCollStatsTrain(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;
    
    if (!idColl) {
        return res.status(404).send(LANG.TEST_NOT_FOUND);
    }
}

async function getWordStatsTest(req: express.Request, res: express.Response) {

    //   
}

async function getWordStatsTrain(req: express.Request, res: express.Response) {
 
    //
}



export default function (): express.Router {
    const router = express.Router();
    router.get('/stats/test/:idColl', getCollStatsTest);
    router.get('/stats/train/:idColl', getCollStatsTrain);

    router.get('/stats/test/:idColl/word/:idWord', getWordStatsTest);
    router.get('/stats/train/:idColl/word/:idWord', getWordStatsTrain);

    return router;
}