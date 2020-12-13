import { ObjectId } from 'mongodb';

export interface DBObject {
    _id?: string | ObjectId;
    createdOn: Date;
    lastModified: Date;
}