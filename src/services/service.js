/**
 * Fetches data from the specified API endpoint.
 * @param {string} url - The API endpoint URL.
 * @param {object} options - Optional fetch options (method, headers, etc.).
 * @returns {Promise<object>} - The response data in JSON format.
 */
async function fetchData(url, options = {}) {
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch data error:', error);
        throw error;
    }
}

const GITHUB_API_BASE_URL = 'https://api.github.com';
/**
 * Fetches comparison data between two tags from GitHub API.
 * @param {string} owner - The owner of the repository.
 * @param {string} repo - The name of the repository.
 * @param {string} baseTag - The base tag for comparison.
 * @param {string} headTag - The head tag for comparison.
 * @returns {Promise<object>} - The comparison data in JSON format.
 */
export async function fetchComparison(owner, repo, baseTag, headTag) {
    const url = `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/compare/${baseTag}...${headTag}`;
    const options = {
        method: 'GET',
        headers: {
            'Accept': 'application/vnd.github.v3+json',
        },
    };
    return fetchData(url, options);
}

/**
 * Fetches tags from GitHub API.
 * @param {string} owner - The owner of the repository.
 * @param {string} repo - The name of the repository.
 * @returns {Promise<object[]>} - The tags data in JSON format.
 */
async function fetchTags(owner, repo) {
    const url = `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/tags`;
    const options = {
        method: 'GET',
        headers: {
            'Accept': 'application/vnd.github.v3+json',
        },
    };
    return fetchData(url, options);
}

// Function to get PR details from GitHub API
async function getPullRequest(owner, repo, prNumber) {
    const response = await fetch(`${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/pulls/${prNumber}`);
    if (!response.ok) throw new Error(`Failed to fetch PR #${prNumber}: ${response.statusText}`);
    return response.json();
}

// Function to get the files changed in a PR
async function getPRFiles(owner, repo, prNumber) {
    const response = await fetch(`${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/pulls/${prNumber}/files`);
    if (!response.ok) throw new Error(`Failed to fetch files for PR #${prNumber}: ${response.statusText}`);
    return response.json();
}

// Function to compare two PRs
async function comparePRs(owner, repo, prNumber1, prNumber2) {
    try {
        // const pr1 = await getPullRequest(owner, repo, prNumber1);
        // const pr2 = await getPullRequest(owner, repo, prNumber2);

        // console.log(`Comparing PR #${prNumber1} with PR #${prNumber2}`);

        // Get the list of changed files in both PRs
        const files1 = await getPRFiles(owner, repo, prNumber1);
        const files2 = await getPRFiles(owner, repo, prNumber2);

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

/**
 * 
 * @param {string} owner 
 * @param {string} repo 
 * @returns 
 */
async function getAllPullRequests(owner, repo) {
    let prs = [];
    let page = 1;
    const perPage = 2; // Number of PRs per page (max 100)

    try {
        while (true) {
            // Fetch PRs for the current page
            const response = await fetch(`${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/pulls?state=all&per_page=${perPage}&page=${page}`);
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
function printPRDetails(prs) {
    prs.forEach(pr => {
        console.log(`PR #${pr.number}`);
        console.log(`标题: ${pr.title}`);
        console.log(`状态: ${pr.state}`);
        console.log(`创建时间: ${pr.created_at}`);
        console.log(`更新时间: ${pr.updated_at}`);
        console.log(`URL: ${pr.html_url}`);
        console.log('------------------------');
    });
}


// module.exports = {fetchData, fetchComparison, fetchTags, comparePRs, getAllPullRequests };