import { exec } from 'child_process';
import { getDiffFunc}  from './diff.js';

function comparePackageVersions(package1, package2) {
    const npmCommand1 = `npm show ${package1} version`;
    const npmCommand2 = `npm show ${package2} version`;

    exec(npmCommand1, (error, stdout1) => {
        if (error) {
            console.error(`Error fetching ${package1} version:`, error);
            return;
        }

        const version1 = stdout1.trim();

        exec(npmCommand2, (error, stdout2) => {
            if (error) {
                console.error(`Error fetching ${package2} version:`, error);
                return;
            }

            const version2 = stdout2.trim();

            console.log(`${package1} latest version: ${version1}`);
            console.log(`${package2} latest version: ${version2}`);

            if (version1 === version2) {
                console.log(`Both packages (${package1} and ${package2}) have the same version.`);
            } else {
                console.log(`Versions of ${package1} and ${package2} are different.`);
                getDiffFunc(version1, version2);
            }
        });
    });
}

comparePackageVersions('@townsquarelabs/ui-vue', '@tonconnect/ui-react');