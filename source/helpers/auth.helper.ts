import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import LANG from '../lang';

export function auth(req: Request, res: Response, next: NextFunction): void {
    if (req.method === 'OPTIONS') {
        next();
        return;
    }
    const token = req.header('Authorization');
    if (token) {
        try {
            res.locals = jwt.verify(token, process.env.TOKEN_SECRET as string) as Record<string, unknown>;
            next();
        } catch (err) {
            res.status(301).send(LANG.AUTH_INVALID_TOKEN);
        }
    } else {
        res.status(301).send(LANG.AUTH_NO_TOKEN);
    }
}

export function addAuthToResponse(res: Response, userInfo: { username: string, _id: string}): Response {
    const token = jwt.sign(userInfo, process.env.TOKEN_SECRET as string);
    return res.header('Authentication', token);
}

