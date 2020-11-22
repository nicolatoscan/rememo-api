export interface Test {
    createdOn: Date;
    ownerId: string;
    settings: {
        numberOfQuestions: number;
        collectionPollIds: string[]; 
    };
    questions: {
        collectionId: string;
        wordId: string;
        question: string;
    }[];
}

export interface TestQuery {
    numberOfQuestions: number;
    collectionPollIds: string[]; 
}