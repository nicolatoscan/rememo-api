import * as Models from '../models';
import databaseHelper from '../../../helpers/database.helper';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

export async function checkUserPasswordById(userId: string, password: string): Promise<boolean> {
    const user = (await databaseHelper.getCollection('users').findOne({ _id: new ObjectId(userId) })) as Models.DBUserDoc;
    return (user && (await bcrypt.compare(password, user.password)));
}

// --- AUTH ---
export async function login(loginUser: Models.LoginUser): Promise<{ user: Models.User, id: string } | null> {
    const user = (await databaseHelper.getCollection('users').findOne({ username: loginUser.username })) as Models.DBUserDoc;
    if (!user || !user._id || !(await bcrypt.compare(loginUser.password, user.password)))
        return null;
    return  { user: Models.getUserFromDBDoc(user), id: user._id.toString() };
}

export async function checkUsernameExists(username: string): Promise<boolean> {
    const user = await databaseHelper.getCollection('users').findOne({ username: username });
    return user ? true : false;
}

export async function createUser(loginUser: Models.SignupUser): Promise<{ user: Models.User, id: string }> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(loginUser.password, salt);
    const insertedId = (await databaseHelper.getCollection('users').insertOne(
        Models.createDBUserDoc(loginUser, hashedPassword))
    ).insertedId;

    const user = await databaseHelper.getCollection('users').findOne({ _id: insertedId });
    return  { user: Models.getUserFromDBDoc(user), id: user._id.toString() };
}

// --- USERS ---
export async function getUserById(userId: string): Promise<Models.User | null> {
    const user = await databaseHelper.getCollection('users').findOne({ _id: new ObjectId(userId) });
    if (!user)
        return null;
    return Models.getUserFromDBDoc(user);
}

export async function getUserByUsername(username: string): Promise<Models.User | null> {
    const user = await databaseHelper.getCollection('users').findOne({ username: username });
    if (!user)
        return null;
    return Models.getUserFromDBDoc(user);
}


export async function deleteUserById(userId: string, password: string): Promise<boolean> {
    if (!(await checkUserPasswordById(userId, password)))
        return false;

    await databaseHelper.getCollection('users').deleteOne({ _id: new ObjectId(userId) });
    return true;
}

export async function updateUserById(userId: string, password: string, user: Models.UpdateUser): Promise<boolean> {
    if (!(await checkUserPasswordById(userId, password)))
        return false;

    if (user.displayName) {
        await databaseHelper.getCollection('users').updateOne({ _id: new ObjectId(userId) }, { $set: { displayName: user.displayName } });
    }
    if (user.email) {
        await databaseHelper.getCollection('users').updateOne({ _id: new ObjectId(userId) }, { $set: { email: user.email } });
    }
    if (user.newPassword) {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(user.newPassword, salt);
        await databaseHelper.getCollection('users').updateOne({ _id: new ObjectId(userId) }, { $set: { password: hashedPassword } });
    }
    return true;

}

