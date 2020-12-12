import * as express from 'express';
import getV1Router from './v1/routers';
import getV2Router from './v2/routers';

export default function(): express.Router {
    const router = express.Router();
    router.use('/v1', getV1Router());
    router.use('/v2', getV2Router());
    router.use('/', getV2Router());
    return router;
}
