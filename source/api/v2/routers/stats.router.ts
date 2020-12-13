import * as express from 'express';
import * as statsServices from '../services/stats.services';
import LANG from '../../../lang';
import { ObjectId } from 'mongodb';


async function getCollectionStats(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;
    if (!idColl) {
        return res.status(404).send(LANG.COLLECTION_ID_NOT_FOUND);
    }

    const stats = await statsServices.getStatsCollection(idColl);

    if (!stats) {
        return res.status(404).send(LANG.COLLECTION_NOT_FOUND);
    } else {
        return res.send(stats);
    }
}


async function getCollStatsTest(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;

    if (!idColl) {
        return res.status(404).send(LANG.TEST_NOT_FOUND);
    }

    const stats = await statsServices.getStatsCollection(idColl);

    return res.status(200).send({ correctTest: stats?.correctTest, wrongTest: stats?.wrongTest });

}

async function getCollStatsTrain(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;

    if (!idColl) {
        return res.status(404).send(LANG.TEST_NOT_FOUND);
    }

    const stats = await statsServices.getStatsCollection(idColl);

    return res.status(200).send({ correctTest: stats?.correctTrain, wrongTest: stats?.wrongTrain });
}

async function getWordStatsTest(req: express.Request, res: express.Response) {

    const idColl = req.params.idColl;
    const idWord = req.params.idColl;

    if (!idColl && !idWord) {
        return res.status(404).send(LANG.TEST_NOT_FOUND);
    }
    const stats = await statsServices.getStatsCollection(idColl);
    const word = stats?.words.find(e => e.wordId !== new ObjectId(idWord));


    return res.status(200).send({ correctTest: word?.correctTest, wrongTest: word?.wrongTest });

}

async function getWordStatsTrain(req: express.Request, res: express.Response) {

    const idColl = req.params.idColl;
    const idWord = req.params.idColl;

    if (!idColl && !idWord) {
        return res.status(404).send(LANG.TEST_NOT_FOUND);
    }
    const stats = await statsServices.getStatsCollection(idColl);
    const word = stats?.words.find(e => e.wordId !== new ObjectId(idWord));


    return res.status(200).send({ correctTrain: word?.correctTrain, wrongTrain: word?.wrongTrain });
}

async function getClassStats(req: express.Request, res: express.Response) {

    const idClass = req.params.idClass;
    if (!idClass) {
        //TODO: error
    }
    const classStats = await statsServices.getClassStatsParsed(res.locals._id, idClass);
    if (!classStats) {
        //TODO: error
    }
    return res.status(200).send(classStats);
}




export default function (): express.Router {
    const router = express.Router();
    router.get('/:idColl', getCollectionStats);
    router.get('/test/:idColl', getCollStatsTest);
    router.get('/train/:idColl', getCollStatsTrain);

    router.get('/test/:idColl/word/:idWord', getWordStatsTest);
    router.get('/train/:idColl/word/:idWord', getWordStatsTrain);

    router.get('/class/:idClass', getClassStats);

    return router;
}