import * as express from 'express';
import databaseService from '../../../services/database.services';
import * as Models from '../models';
import bcrypt from 'bcryptjs';
import * as authServices from '../../../services/auth.services';

async function login(req: express.Request, res: express.Response) {
    const valUser = Models.validateLoginUser(req.body);
    if (valUser.error) {
        return res.status(400).send(valUser.error);

    } else if (valUser.value) {

        const user = await databaseService.getCollection('users').findOne({ username: valUser.value?.username });
        if (!user || !(await bcrypt.compare(valUser.value.password, user.password))) {
            return res.status(400).send('Wrong email or password');
        }

        valUser.value.password = '';
        authServices.addAuthToResponse(res, { username: valUser.value.username });

        return res.status(200).send(Models.getUserFromDBDoc(user));
    }
}

async function signup(req: express.Request, res: express.Response) {
    const valUser = Models.validateSignupUser(req.body);
    if (valUser.error) {
        return res.status(400).send(valUser.error);

    } else if (valUser.value) {

        if (await databaseService.getCollection('users').findOne({ username: valUser.value.username })) {
            res.status(403).send('Username already used');

        } else {

            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(valUser.value.password, salt);
            const insertedId = (await databaseService.getCollection('users').insertOne(Models.createDBUserDoc(valUser.value, hashedPassword))).insertedId;
            const user = await databaseService.getCollection('users').findOne({ _id: insertedId });

            authServices.addAuthToResponse(res, { username: valUser.value.username });

            res.status(201).send(Models.getUserFromDBDoc(user));
        }
    }
}

export default function (): express.Router {
    const router = express.Router();

    router.post('/login', login);
    router.post('/signup', signup);

    return router;
}