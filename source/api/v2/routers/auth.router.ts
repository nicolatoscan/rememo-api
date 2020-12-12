import * as express from 'express';
import * as Models from '../models';
import * as authHelpers from '../../../helpers/auth.helper';
import * as userServices from '../services/user.services';
import LANG from '../../../lang';

async function login(req: express.Request, res: express.Response) {
    const valUser = Models.validateLoginUser(req.body);
    if (valUser.error) {
        return res.status(400).send(valUser.error);

    } else if (valUser.value) {
        const userInfo = await userServices.login(valUser.value);

        if (!userInfo) {
            return res.status(301).send(LANG.AUTH_WRONG_CREDENTIAL);
        }

        authHelpers.addAuthToResponse(res, { username: userInfo.user.username, _id: userInfo.id });

        res.status(200).send({
            ...userInfo.user,
            token: res.getHeader('Authentication')
        });
    }
}

async function signup(req: express.Request, res: express.Response) {
    const valUser = Models.validateSignupUser(req.body);
    if (valUser.error) {
        return res.status(400).send(valUser.error);

    } else if (valUser.value) {
        if (await userServices.checkUsernameExists(valUser.value.username)) {
            res.status(403).send(LANG.AUTH_USERNAME_ALREADY_IN_USE);

        } else {

            const userInfo = await userServices.createUser(valUser.value);
            authHelpers.addAuthToResponse(res, { username: userInfo.user.username, _id: userInfo.id });

            res.status(201).send({
                ...userInfo.user,
                token: res.getHeader('Authentication')
            });
        }
    }
}


export default function (): express.Router {
    const router = express.Router();

    router.post('/login', login);
    router.post('/signup', signup);

    return router;
}