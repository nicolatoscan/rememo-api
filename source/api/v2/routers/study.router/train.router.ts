import * as express from 'express';
import * as Models from '../../models';
import * as trainServices from '../../services/study.services/train.services';
import LANG from '../../../../lang';

async function saveResult(req: express.Request, res: express.Response) {
    
    const valResult = Models.validateTrainingResult(req.body);
    if (valResult.error) {
        return res.status(400).send(valResult.error);
    } else if (valResult.value) {
        
        await trainServices.saveTrainingResult(valResult.value, res.locals._id);

        return res.status(204).send({message: LANG.OK });
    }
}

async function nextWord(req: express.Request, res: express.Response) {
    const valQuery = Models.validateNextWordQuery(req.body);
    if (valQuery.error) {
        return res.status(400).send(valQuery.error);
    } else if (valQuery.value) {
        const word = await trainServices.getNextWord(valQuery.value.collectionPollIds, res.locals._id);
        return res.send(word);
    }
}


export default function (): express.Router {
    const router = express.Router();

    router.post('/result', saveResult);
    router.post('/next', nextWord);

    return router;
}