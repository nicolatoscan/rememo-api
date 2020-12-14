import * as express from 'express';
import * as Models from '../models';
import * as classServices from '../services/class.services';
import LANG from '../../../lang';



async function getCreatedOrJoinedClasses(req: express.Request, res: express.Response) {
    const idUser = res.locals._id;
    let ownershipType: Models.EClassOwnershipType = Models.EClassOwnershipType.Both;
    if (req.query.type === 'created')
        ownershipType = Models.EClassOwnershipType.Created;
    else if (req.query.type === 'joined')
        ownershipType = Models.EClassOwnershipType.Joined;
    
    const studyClasses = await classServices.getClasses(idUser, ownershipType);

    if (!studyClasses) {
        return res.status(404).send(LANG.CLASSES_NOT_FOUND);
    } else {
        return res.send(studyClasses);
    }
}

async function createClass(req: express.Request, res: express.Response) {
    const idUser = res.locals._id;
    const classData = Models.validateClass(req.body);
    
    if (classData.error) {
        return res.status(400).send(classData.error);

    } else if (classData.value) {
        const className = classData.value.name;

        const { studyClassId } = await classServices.createClass(idUser, { _id: '', name: className, collections: [] });

        return res.status(201).send({ _id: studyClassId });
    }
}

async function getClassById(req: express.Request, res: express.Response) {
    const idUser = res.locals._id;
    const idClass = req.params.idClass;
    if (!idClass) {
        return res.status(404).send(LANG.CLASS_ID_NOT_FOUND);
    }

    const studyClass = await classServices.getClassById(idUser, idClass);

    if (!studyClass) {
        return res.status(404).send(LANG.CLASS_NOT_FOUND);
    } else {
        return res.send(studyClass);
    }
}

async function updateClassById(req: express.Request, res: express.Response) {
    const idUser = res.locals._id;
    const idClass = req.params.idClass;
    if (!idClass) {
        return res.status(404).send(LANG.CLASS_ID_NOT_FOUND);
    }

    const classData = Models.validateClass(req.body);
    if (classData.error) {
        return res.status(400).send(classData.error);

    } else if (classData.value) {
        const className = classData.value.name;

        await classServices.updateClassById(idUser, idClass, { _id: '', name: className, collections: [] });

        return res.status(204).send({ message: LANG.CLASS_UPDATED });
    }
}

async function deleteClassById(req: express.Request, res: express.Response) {
    const idUser = res.locals._id;
    const idClass = req.params.idClass;
    if (!idClass) {
        return res.status(404).send(LANG.CLASS_ID_NOT_FOUND);
    }

    await classServices.removeClassById(idUser, idClass);

    return res.status(204).send({ message: LANG.CLASS_DELETED });
}

async function getFullClassById(req: express.Request, res: express.Response) {
    const idUser = res.locals._id;
    const idClass = req.params.idClass;
    if (!idClass) {
        return res.status(404).send(LANG.CLASS_ID_NOT_FOUND);
    }

    const classStudents = await classServices.getFullClassById(idUser, idClass);

    if (!classStudents) {
        return res.status(404).send(LANG.CLASS_STUDENTS_NOT_FOUND);
    } else {
        return res.send(classStudents);
    }
}

async function joinClass(req: express.Request, res: express.Response) {
    const idUser = res.locals._id;
    const idClass = req.params.idClass;
    if (!idClass) {
        return res.status(404).send(LANG.CLASS_ID_NOT_FOUND);
    }

    await classServices.joinClass(idUser, idClass);

    return res.status(204).send({ message: LANG.CLASS_JOINED });
}

async function leaveClass(req: express.Request, res: express.Response) {
    const idUser = res.locals._id;
    const idClass = req.params.idClass;
    if (!idClass) {
        return res.status(404).send(LANG.CLASS_ID_NOT_FOUND);
    }

    await classServices.leaveClass(idUser, idClass);

    return res.status(204).send({ message: LANG.CLASS_LEAVED });
}

async function kickStudentFromClass(req: express.Request, res: express.Response) {
    const idUser = res.locals._id;
    const idClass = req.params.idClass;
    const idStudent = req.params.idStudent;

    if (!idClass) {
        return res.status(404).send(LANG.CLASS_ID_NOT_FOUND);
    }
    if (!idStudent) {
        return res.status(404).send(LANG.CLASS_STUDENT_ID_NOT_FOUND);
    }

    await classServices.kickStudentFromClass(idUser, idClass, idStudent);

    return res.status(204).send({ message: LANG.CLASS_LEAVED });
}

async function addCollectionToClass(req: express.Request, res: express.Response) {
    const idUser = res.locals._id;
    const idClass = req.params.idClass;
    const idColl = req.params.idColl;

    if (!idClass) {
        return res.status(404).send(LANG.CLASS_ID_NOT_FOUND);
    }
    if (!idColl) {
        return res.status(404).send(LANG.COLLECTION_ID_NOT_FOUND);
    }

    await classServices.addCollectionToClass(idUser, idClass, idColl);

    return res.status(204).send({ message: LANG.COLLECTION_ADDED });
}

async function removeCollectionFromClass(req: express.Request, res: express.Response) {
    const idUser = res.locals._id;
    const idClass = req.params.idClass;
    const idColl = req.params.idColl;

    if (!idClass) {
        return res.status(404).send(LANG.CLASS_ID_NOT_FOUND);
    }
    if (!idColl) {
        return res.status(404).send(LANG.COLLECTION_ID_NOT_FOUND);
    }

    await classServices.removeCollectionFromClass(idUser, idClass, idColl);

    return res.status(204).send({ message: LANG.COLLECTION_REMOVED });
}

export default function (): express.Router {
    const router = express.Router();

    router.get('/', getCreatedOrJoinedClasses);

    router.post('/', createClass);
    router.get('/:idClass', getClassById);
    router.put('/:idClass', updateClassById);
    router.delete('/:idClass', deleteClassById);

    router.get('/:idClass/full', getFullClassById);
    router.put('/:idClass/join', joinClass);
    router.put('/:idClass/leave', leaveClass);
    router.put('/:idClass/kick/:idStudent', kickStudentFromClass);
    router.put('/:idClass/addCollection/:idColl', addCollectionToClass);
    router.put('/:idClass/removeCollection/:idColl', removeCollectionFromClass);


    return router;
}