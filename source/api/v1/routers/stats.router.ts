import * as express from 'express';
import * as Models from '../models';
import * as statsServices from '../services/stats.services';
import LANG from '../../../lang';




async function getTestStats(req: express.Request, res: express.Response) {
    const idTest = req.params.idTest;
    
    if (!idTest) {
        return res.status(404).send(LANG.TEST_NOT_FOUND);
    }


    
}



export default function (): express.Router {
    const router = express.Router();
    router.get('/stats/test/:idTest', getTestStats);
    router.get('/stats/word/:idWord');
    return router;
}