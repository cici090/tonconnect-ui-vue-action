import { get } from '../request.js'
// import { global } from '../utils/global.js'
export class TagService {
    /**
     * Fetches comparison data between two tags from GitHub API.
     * @param {string} owner - The owner of the repository.
     * @param {string} repo - The name of the repository.
     * @param {string} baseTag - The base tag for comparison.
     * @param {string} headTag - The head tag for comparison.
     * @returns {Promise<object>} - The comparison data in JSON format.
     */
    fetchComparison(owner, repo, baseTag, headTag) {
        const url = `/${owner}/${repo}/compare/${baseTag}...${headTag}`;
        return get(url)
    }

    /**
     * Fetches tags from GitHub API.
     * @param {string} owner - The owner of the repository.
     * @param {string} repo - The name of the repository.
     * @returns {Promise<object[]>} - The tags data in JSON format.
     */
    fetchTags(owner, repo) {
        const url = `/${owner}/${repo}/tags`;
        return get(url)
    }

    /**
     * 
     * @param {string} owner 
     * @param {string} repo 
     * @returns 
     */
    async getAllPullRequests(owner, repo) {
        let prs = [];
        let page = 1;
        const perPage = 2; // Number of PRs per page (max 100)

        try {
            // eslint-disable-next-line no-constant-condition
            while (true) {
                // Fetch PRs for the current page
                const url = `/${owner}/${repo}/pulls?state=all&per_page=${perPage}&page=${page}`
                const response = await get(url);
                if (!response.ok) throw new Error(`Failed to fetch PRs: ${response.statusText}`);

                const data = await response.json();
                if (data.length === 0) break; // No more PRs to fetch

                prs = prs.concat(data); // Add fetched PRs to the list
                page++; // Move to the next page
            }

            return prs;
        } catch (error) {
            console.error('Error fetching PRs:', error);
        }
    }


    // Function to get PR details from GitHub API
    getPullRequest(owner, repo, prNumber) {
        const url = `/${owner}/${repo}/pulls/${prNumber}`
        return get(url);
    }
}