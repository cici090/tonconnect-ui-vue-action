import { get } from '../request.js'
import { global } from '../utils/global.js'
export class FileService {
    fetchFileContent() {
        const apiUrl = `/${global.owner}/${global.repo}/contents/${global.packageJsonPath}`;
        return get(apiUrl)
    }

    fetchFileContentFromOtherBranch(branchName) {
        const apiUrl = `/${global.owner}/${global.repo}/contents/${global.packageJsonPath}?ref=${branchName}`;
        return get(apiUrl)
    }
}