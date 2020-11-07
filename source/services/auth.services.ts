import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function auth(req: Request, res: Response, next: NextFunction): void {
    const token = req.header('Authorization');
    if (token) {
        try {
            res.locals = jwt.verify(token, process.env.TOKEN_SECRET as string) as Record<string, unknown>;
            next();
        } catch (err) {
            res.status(301).send('Access denied.\nInvalid Token');
        }
    } else {
        res.status(301).send('Access denied.\nNo token found');
    }
}

export function addAuthToResponse(res: Response, userInfo: { username: string }): Response {
    const token = jwt.sign(userInfo, process.env.TOKEN_SECRET as string);
    return res.header('Authentication', token);
}

