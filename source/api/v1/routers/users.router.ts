import * as express from 'express';
import databaseService from '../../../services/database.services';
import * as Models from '../models';

async function getUserById(req: express.Request, res: express.Response) {
    const user = await databaseService.getCollection('users').findOne({ username: req.params.username });
    if (user) { 
        res.send(user);
    }else{
        res.status(404).send('User not found');
    }
}

async function postUser(req: express.Request, res: express.Response) {
    const valUser = Models.validateUser(req.body);
    if (valUser.error) {
        res.status(400).send(valUser.error);
    } else if (valUser.value) {
        if (await databaseService.getCollection('users').findOne({ email: valUser.value.email })) {
            res.status(403).send('Email already used');
        } else {
            const insertedId = (await databaseService.getCollection('users').insertOne(valUser.value)).insertedId;
            res.status(201).send(insertedId);
        }
    }
}

export default function (): express.Router {
    const router = express.Router();
    router.get('/:username', getUserById);
    router.post('/', postUser);
    return router;
}