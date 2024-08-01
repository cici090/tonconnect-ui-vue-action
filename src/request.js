import axios from "axios";
const GITHUB_API_BASE_URL = 'https://api.github.com';
const githubToken = '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';

const mergePath = path => {
  if (path.includes('https')) return path;
  return GITHUB_API_BASE_URL + '/repos' + path;
}
axios.defaults.headers.get["Content-Type"] =
  "application/x-www-form-urlencoded";
// axios.defaults.headers.post["Content-Type"] =
//   "application/x-www-form-urlencoded";
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.withCredentials = false;
axios.defaults.xsrfCookieName = "csrfToken";
axios.defaults.xsrfHeaderName = "x-csrf-token";

export async function get(url, params = {}) {

  const config = {
    url: mergePath(url),
    method: "get", // default
    headers: { 'Accept': 'application/vnd.github.v3+json', },
    params: params,
  };

  try {
    const response = await axios(config).catch((e) => {
      return e;
    });
    if (response instanceof Error) throw response;
    return {
      data: response.data,
      ok: (response.status >= 200 && response.status < 400) && (response.data.code == undefined ? true : response.data.code - 0 < 400)
    };
  } catch (err) {
    console.log("err", err, err.response);
    return { data: err.response.data, ok: false };
  }
}

export async function post(url, data = {}, params = {}) {
  const config = {
    url: mergePath(url),
    method: 'post',
    headers: {
      Authorization: `token ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    params: params,
    data: data,
  };

  try {
    const response = await axios(config);
    return {
      data: response.data,
      ok: response.status >= 200 && response.status < 400 && (response.data.code === undefined ? true : response.data.code - 0 < 400),
    };
  } catch (error) {
    console.error('post 请求时出错:', error);
    return {
      data: error.response.data,
      ok: false,
    };
  }
}

export async function put(url, data = {}, params = {}) {
  const config = {
    url: mergePath(url),
    method: 'put',
    headers: {
      Authorization: `token ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    params: params,
    data: data,
  };

  try {
    const response = await axios(config);
    return {
      data: response.data,
      ok: response.status >= 200 && response.status < 400 && (response.data.code === undefined ? true : response.data.code - 0 < 400),
    };
  } catch (error) {
    console.error('PUT 请求时出错:', error);
    return {
      data: error.response.data,
      ok: false,
    };
  }
}

export async function patch(url, data = {}, params = {}) {
  const config = {
    url: mergePath(url),
    method: 'patch', // 使用 put 方法执行 patch 请求
    headers: {
      Authorization: `token ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    params: params,
    data: data,
  };

  try {
    const response = await axios(config);
    return {
      data: response.data,
      ok: response.status >= 200 && response.status < 400 && (response.data.code === undefined ? true : response.data.code - 0 < 400),
    };
  } catch (error) {
    console.error('PUT 请求时出错:', error);
    return {
      data: error.response.data,
      ok: false,
    };
  }
}

export async function del(url, data = {}, params = {}) {
  const config = {
    url: mergePath(url),
    method: 'delete',
    headers: {
      Authorization: `token ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    params: params,
    data: data,
  };

  try {
    const response = await axios(config);
    return {
      data: response.data,
      ok: response.status >= 200 && response.status < 400 && (response.data.code === undefined ? true : response.data.code - 0 < 400),
    };
  } catch (error) {
    console.error('delete 请求时出错:', error);
    return {
      data: error.response.data,
      ok: false,
    };
  }
}

