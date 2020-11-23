import * as express from 'express';
import * as Models from '../../models';
import * as testServices from '../../services/study.services/test.services';

async function generateTest(req: express.Request, res: express.Response) {
    const valTestQuery = Models.validateTestQuery(req.body);
    if (valTestQuery.error) {
        return res.status(400).send(valTestQuery.error);
    } else if (valTestQuery.value) {
        const test = await testServices.createTest(valTestQuery.value, res.locals.username, res.locals._id);
        return res.status(201).send(test);
    }
}

async function checkTest(req: express.Request, res: express.Response) {
    const valTestQuery = Models.validateTestResult(req.body);
    if (valTestQuery.error) {
        return res.status(400).send(valTestQuery.error);
    } else if (valTestQuery.value) {
        const { error, testResult } = await testServices.checkTest(valTestQuery.value, res.locals._id);
        if (error)
            return res.status(400).send(error);
        else
            return res.send(testResult);
    }
}


export default function (): express.Router {
    const router = express.Router();

    router.post('/generate', generateTest);
    router.post('/check', checkTest);

    return router;
}