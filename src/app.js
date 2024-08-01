import { exec } from 'child_process';
import { getDiffFunc}  from './diff.js';
import { global } from './utils/global.js';

function comparePackageVersions(package1, package2) {
    const npmCommand1 = `npm show ${package1} version`;
    const npmCommand2 = `npm show ${package2} version`;

    exec(npmCommand1, (error, stdout1) => {
        if (error) {
            console.error(`Error fetching ${package1} version:`, error);
            return;
        }

        const myVersion = stdout1.trim();

        exec(npmCommand2, (error, stdout2) => {
            if (error) {
                console.error(`Error fetching ${package2} version:`, error);
                return;
            }

            const targetVersion = stdout2.trim();
            global.targetVersion = targetVersion;

            console.log(`${package1} latest version: ${myVersion}`);
            console.log(`${package2} latest version: ${targetVersion}`);

            if (myVersion === targetVersion) {
                console.log(`Both packages (${package1} and ${package2}) have the same version.`);
            } else {
                console.log(`Versions of ${package1} and ${package2} are different.`);
                // getDiffFunc(myVersion, targetVersion);
                getDiffFunc('2.0.5', targetVersion);
            }
        });
    });
}

comparePackageVersions('@townsquarelabs/ui-vue', '@tonconnect/ui-react');