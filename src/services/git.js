import { get, post, put, patch } from '../request.js'

// import { global } from '../utils/global.js'

export class GitService {
    getBranchSha(owner, repo, branch) {
        const url = `/${owner}/${repo}/branches/${branch}`
        return get(url);
    }

    createNewBranch(owner, repo, data) {
        const url = `/${owner}/${repo}/git/refs`
        return post(url, data);
    }

    modifiedContentAndCommit(owner, repo, filePath, data) {
        const url = `/${owner}/${repo}/contents/${filePath}`
        return put(url, data);
    }
    update(owner, repo, branchName, data) {
        const url = `/${owner}/${repo}/git/refs/heads/${branchName}`
        return patch(url, data);
    }

    mergeBranches(owner, repo, data) {
        const url = `/${owner}/${repo}/merges`
        return post(url, data);
    }
}