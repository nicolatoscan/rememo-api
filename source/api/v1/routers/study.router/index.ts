import * as express from 'express';
import getLearRouter from './learn.router';
import getTestRouter from './test.router';
import getTrainRouter from './train.router';

export default function(): express.Router {
    const router = express.Router();

    router.use('/learn', getLearRouter());
    router.use('/test', getTestRouter());
    router.use('/train', getTrainRouter());

    return router;
}