import * as express from 'express';
import getUserRouter from './users.router';

export default function(): express.Router {
    const router = express.Router();
    router.use('/users', getUserRouter());
    return router;
}