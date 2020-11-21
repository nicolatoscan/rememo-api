import * as express from 'express';
import * as Models from '../models';
import * as authHelpers from '../../../helpers/auth.helper';
import databaseHelper from '../../../helpers/database.helper';
import bcrypt from 'bcryptjs';
import LANG from '../../../lang';

async function login(req: express.Request, res: express.Response) {
    const valUser = Models.validateLoginUser(req.body);
    if (valUser.error) {
        return res.status(400).send(valUser.error);

    } else if (valUser.value) {

        const user = await databaseHelper.getCollection('users').findOne({ username: valUser.value?.username });
        if (!user || !(await bcrypt.compare(valUser.value.password, user.password))) {
            return res.status(400).send(LANG.AUTH_WRONG_CREDENTIAL);
        }

        valUser.value.password = '';
        authHelpers.addAuthToResponse(res, { username: valUser.value.username, _id: user._id.toString() });

        return res.status(200).send(Models.getUserFromDBDoc(user));
    }
}

async function signup(req: express.Request, res: express.Response) {
    const valUser = Models.validateSignupUser(req.body);
    if (valUser.error) {
        return res.status(400).send(valUser.error);

    } else if (valUser.value) {

        if (await databaseHelper.getCollection('users').findOne({ username: valUser.value.username })) {
            res.status(403).send(LANG.AUTH_USERNAME_ALREADY_IN_USE);

        } else {

            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(valUser.value.password, salt);
            const insertedId = (await databaseHelper.getCollection('users').insertOne(Models.createDBUserDoc(valUser.value, hashedPassword))).insertedId;
            const user = await databaseHelper.getCollection('users').findOne({ _id: insertedId });

            authHelpers.addAuthToResponse(res, { username: valUser.value.username, _id: user._id.toString() });

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