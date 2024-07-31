import { createIssue } from './diff.js';
import { services } from './services/index.js';
import { global } from './utils/global.js'

const branchName = 'update-file-content';

export async function applyPatch(patchContent) {
    try {
        const { data } = await services.file.fetchFileContent();
        // console.log(data);
        const packageJson = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'));

        const currentSha = data.sha;
        console.log(currentSha);

        // 应用 patch 到 package.json
        const modifiedLines = patchContent.split('\n')
            .filter(line => line.startsWith('+') && !line.startsWith('+++'))
            .map(line => line.substring(1)); // remove +

        const targetFiles = [
            `"version"`,
            `"@tonconnect/ui"`
        ];

        const onlyTargetFiles = modifiedLines.length === targetFiles.length &&
            modifiedLines.every(line => {
                const parsedLine = line.split(': ');
                const field = parsedLine[0];
                return targetFiles.includes(field.trim())
            });

        if (!onlyTargetFiles) {
            createIssue();
            return;
        }

        modifiedLines.forEach(line => {
            const parsedLine = line.split(': ');
            const field = parsedLine[0];
            const value = parsedLine[1];

            if (field.trim() === `"version"`) {
                packageJson.version = value.replace(/"/g, '');
            } else if (field.trim() === `"@tonconnect/ui"`) {
                packageJson.dependencies['@tonconnect/ui'] = value.replace(/"/g, '');
            }
        });

        // console.log('package.json update:', packageJson);
        createBranchAndCommit(packageJson, currentSha);
    } catch (error) {
        console.error('应用 patch 到 package.json 时出错:', error.message);
    }
}


export async function createBranchAndCommit(packageJson) {
    try {
        await createNewBranch();
        await updateFileContent(packageJson);
        await mergeBranches();

        console.log('File modification and commit successful!');
    } catch (error) {
        console.error('Error occurred while creating branch and committing file:', error);
        createIssue()
    }
}

// step 1
async function createNewBranch() {
    const { data } = await services.git.getBranchSha(global.owner, global.repo, "main");
    const reqData = {
        ref: `refs/heads/${branchName}`,
        sha: data.commit.sha,
    }
    const refResponse = await services.git.createNewBranch(global.owner, global.repo, reqData);
    if (refResponse.ok) {
        console.log(`Branch ${branchName} created successfully!`);
    } else {
        console.log(`Failed to create branch ${branchName}!`);
        createIssue()
    }
    return refResponse;
}

// step 2
async function updateFileContent(packageJson) {
    const res = await services.file.fetchFileContentFromOtherBranch(branchName);
    const updatedContent = Buffer.from(JSON.stringify(packageJson, null, 2)).toString('base64');
    const reqData = {
        message: global.COMMIT_MESSAGE,
        content: updatedContent,
        sha: res.data.sha,
        branch: branchName
    }
    const { data, ok } = await services.git.modifiedContentAndCommit(global.owner, global.repo, global.packageJsonPath, reqData);
    if (ok) {
        console.log('File updated and committed successfully:', data.commit);

    } else {
        console.error('Error updating file:', data);
        createIssue()
    }
}

// step 3 merge branche to main branch
async function mergeBranches() {
    const newBranch = branchName;
    const reqData = {
        base: 'main',
        head: newBranch,
        commit_message: `Merge ${newBranch} into main`
    };

    const { data, ok } = await services.git.mergeBranches(global.owner, global.repo, reqData);
    if (ok) {
        console.log('Merge successful:', data);
        await services.git.deleteBranch(global.owner, global.repo, branchName);
    } else {
        console.log('Error Merge:', data);
        吧v()
    }
}


// create Pull Request (PR)
// eslint-disable-next-line no-unused-vars
async function createPullRequest(newVersion, newUiVersion) {
    try {
        const reqData = {
            title: `Update version to ${newVersion}, @tonconnect/ui to ${newUiVersion}`,
            head: branchName,
            base: 'main',
        };
        const { data, ok } = await services.pr.createPullRequest(global.owner, global.repo, reqData);
        if (ok) {
            console.log(`PR created successfully: ${data.html_url}`);
        } else {
            console.log(`Error PR:`, data);
        }
    } catch (error) {
        console.error('Error PR:', error.message);
    }
}

