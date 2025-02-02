import { global } from './utils/global.js';
import { applyPatch } from './updateVersion.js';
import { services } from './services/index.js';

// const baseTag = 'ui-2.0.5';  // Previous version tag
// const headTag = 'ui-2.0.6';  // Current version tag

export async function getDiffFunc(myVersion, targetVersion) {
    const { baseTag, headTag } = await getAllTags(myVersion, targetVersion);
    console.log(targetVersion);

    try {
        const { data } = await services.tag.fetchComparison(global.targetOwner, global.targetRepo, baseTag, `${headTag}`);
        const baseJson = data;
        // console.log(baseJson);
        if (!baseJson.files) {
            console.log('No files found.');
            return;
        }

        // TODO: check for changes
        const targetFiles = [
            'packages/ui-react/CHANGELOG.md',
            'packages/ui-react/package.json'
        ];
        const reactFiles = baseJson.files.filter((item) => item.filename.includes('ui-react'));

        const onlyTargetFiles = reactFiles.length === targetFiles.length &&
            reactFiles.every(file => targetFiles.includes(file.filename));

        if (onlyTargetFiles) {
            console.log('diff--->符合预期')
            // Output file diffs
            reactFiles.forEach(file => {
                console.log(`File: ${file.filename}`);
                console.log(`Additions: ${file.additions}`);
                console.log(`Deletions: ${file.deletions}`);
                console.log(`Changes: ${file.changes}`);
                console.log(`patch: ${file.patch}`);
                console.log('------------------------');
                // checkForChanges(file.patch);
                if (file.filename === 'packages/ui-react/package.json') {
                    applyPatch(file.patch);
                }
            });

        } else {
            console.log('diff--->不符合预期')
            // createIssue();
        }


    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function getAllTags(myVersion, targetVersion) {
    const { data } = await services.tag.fetchTags(global.targetOwner, global.targetRepo);
    // console.log(data);
    const baseTag = data.find(tag => tag.name.includes(myVersion));
    const headTag = data.find(tag => tag.name.includes(targetVersion));
    console.log(baseTag, headTag);
    return { baseTag: baseTag.name, headTag: headTag.name }
}

// Function to compare two PRs
export async function comparePRs(owner, repo, prNumber1, prNumber2) {
    try {
        const files1 = await services.pr.getPRFiles(owner, repo, prNumber1);
        const files2 = await services.pr.getPRFiles(owner, repo, prNumber2);

        // Convert files list to a dictionary for easier comparison
        const filesDict1 = files1.reduce((dict, file) => {
            dict[file.filename] = file;
            return dict;
        }, {});

        const filesDict2 = files2.reduce((dict, file) => {
            dict[file.filename] = file;
            return dict;
        }, {});

        // Compare files between PRs
        const allFiles = new Set([...Object.keys(filesDict1), ...Object.keys(filesDict2)]);

        allFiles.forEach(file => {
            const file1 = filesDict1[file] || { status: 'not found' };
            const file2 = filesDict2[file] || { status: 'not found' };

            console.log(`File: ${file}`);
            console.log(`PR #${prNumber1} Status: ${file1.status}`);
            console.log(`PR #${prNumber2} Status: ${file2.status}`);
            console.log('------------------------');
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

// create a new Issue
export async function createIssue(body = '') {
    const ISSUE_TITLE = `Error merge ${global.targetVersion}`;

    const response = await services.git.searchIssues({
        q: `repo:ton-connect/sdk ${ISSUE_TITLE}`,
    });
    // console.log(response.data.items);
    
    if(response.ok && response.data.total_count > 0) return;
    const reaData = {
        title: ISSUE_TITLE,
        body: body
    }
    const { data, ok } = await services.git.createIssue(global.owner, global.repo, reaData);
    if (ok) {
        console.log('Issue created successfully:');
    } else {
        console.error('Error creating issue:', data);
    }
}

createIssue();