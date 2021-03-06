import * as express from 'express';
import { auth } from '../../../helpers/auth.helper';
import getUserRouter from './users.router';
import getAuthRouter from './auth.router';
import getCollectionRouter from './collection.router';
import getStudyRouter from './study.router';
import getStatsRouter from './stats.router';
import getShareRouter from './share.router';
import getClassRouter from './class.router';

export default function(): express.Router {
    const router = express.Router();

    router.use('/auth', getAuthRouter());
    router.use(auth);

    router.use('/users', getUserRouter());
    router.use('/collections', getCollectionRouter());
    router.use('/study', getStudyRouter());
    router.use('/stats', getStatsRouter());
    router.use('/share', getShareRouter());
    router.use('/class', getClassRouter());

    return router;
}