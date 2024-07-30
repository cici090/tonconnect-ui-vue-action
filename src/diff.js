import { global } from './utils/global.js';
import { applyPatch } from './updateVersion.js';
import { services } from './services/index.js';

const baseTag = 'ui-2.0.5';  // Previous version tag
const headTag = 'ui-2.0.6';  // Current version tag

export async function getDiffFunc() {
    try {
        const { data } = await services.tag.fetchComparison(global.target_owner, global.target_repo, baseTag, `${headTag}`);
        const baseJson = data;
        // console.log(baseJson);
        if (!baseJson.files) {
            console.log('No files found.');
            return;
        }
        // Output file diffs
        baseJson.files.filter((item) => item.filename.includes('ui-react')).forEach(file => {
            console.log(`File: ${file.filename}`);
            console.log(`Additions: ${file.additions}`);
            console.log(`Deletions: ${file.deletions}`);
            console.log(`Changes: ${file.changes}`);
            console.log(`patch: ${file.patch}`);
            console.log('------------------------');
            // checkForChanges(file.patch);

            // TODO: check for changes
            if (file.filename === 'packages/ui-react/package.json')
                applyPatch(file.patch);

        });

    } catch (error) {
        console.error('Error fetching data:', error);
    }
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

// 创建新的 Issue
export async function createIssue() {
    const ISSUE_TITLE = 'Issue Title'; // 替换为 Issue 标题
    const ISSUE_BODY = 'This is the body of the issue.'; // 替换为 Issue 描述
    try {
        const reaData = {
            title: ISSUE_TITLE,
            body: ISSUE_BODY
        }
        const { data, ok } = await services.git.createIssue(global.owner, global.repo, reaData);
        if (ok) {
            console.log('Issue created successfully:');
        } else {
            console.error('Error creating issue:', data);
        }
    } catch (error) {
        console.error('Error creating issue:', error.response ? error.response.data : error.message);
    }
}
