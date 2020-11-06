import * as express from 'express';
import getV1Router from './v1/router';

export default function(): express.Router {
    const router = express.Router();
    router.use('/v1', getV1Router());
    return router;
}
