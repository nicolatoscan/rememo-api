import * as express from 'express';
import { auth } from '../../../services/auth.services';
import getUserRouter from './users.router';

export default function(): express.Router {
    const router = express.Router();
    router.use(auth);
    router.use('/users', getUserRouter());
    return router;
}