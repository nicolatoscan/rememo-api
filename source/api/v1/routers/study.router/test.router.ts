import * as express from 'express';
import * as Models from '../../models';
import * as testServices from '../../services/study.services/test.services';
import LANG from '../../../../lang';

async function generateTest(req: express.Request, res: express.Response) {
    const valTestQuery = Models.validateTestQuery(req.body);
    if (valTestQuery.error) {
        return res.status(400).send(valTestQuery.error);
    } else if (valTestQuery.value) {
        const test = await testServices.createTest(valTestQuery.value, res.locals.username);
        return res.status(201).send(test);
    }
}


export default function (): express.Router {
    const router = express.Router();

    router.post('/generate', generateTest);

    return router;
}