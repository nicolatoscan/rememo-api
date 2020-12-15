import getUserServiceTests from './user.services.test';
import getCollectionsServiceTests from './collection.services.test';
import getClassesServiceTests from './class.services.test';
import getStudyServiceTests from './study.services.test';
import databaseHelper from '../../../../../source/helpers/database.helper';

export default function(): void {
    describe('Services', function() {
        this.timeout(5000);
        
        before(async function() {
            this.timeout(20000);
            await databaseHelper.connect();
        });

        getUserServiceTests();
        getCollectionsServiceTests();
        getClassesServiceTests();
        getStudyServiceTests();
        
        after(function() {
            databaseHelper.closeConnection();
        });
    });
}