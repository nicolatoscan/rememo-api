import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function auth(req: Request, res: Response, next: NextFunction): void {
    const token = req.header('Authorization')?.split(' ');
    if (!token || token.length !== 2) {
        res.status(301).send('Access denied.\nNo token found');
        return;
    }

    try {
        res.locals = jwt.verify(token[1], process.env.TOKEN_SECRET as string) as Record<string, unknown>;
        next();
    } catch (err) {
        res.status(301).send('Access denied.\nInvalid Token');
    }
}

