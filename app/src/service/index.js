export function search(params) {
  return fetch("/cgi-bin/automock/api-list", {
    method: "post",
    body: JSON.stringify(params),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    return response.json();
  });
}
export function check() {
  return fetch("/cgi-bin/automock/check-api-list").then((response) => {
    return response.json();
  });
}
export function init() {
  return fetch("/cgi-bin/init?_=" + Date.now(), {
    method: "get",
    referrer: location.origin,
  }).then((response) => {
    return response.json();
  });
}

export function getApiData(name) {
  return fetch("/cgi-bin/automock/get-api-data", {
    method: "post",
    body: JSON.stringify({ name }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    return response.json();
  });
}

export function updateApiData(name, data) {
  return fetch("/cgi-bin/automock/update-api-data", {
    method: "post",
    body: JSON.stringify({ name, data }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    return response.json();
  });
}

export function createApiData(body) {
  return fetch("/cgi-bin/automock/create-api-data", {
    method: "post",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    return response.json();
  });
}

export function updateApiMock(name, mock) {
  return fetch("/cgi-bin/automock/update-api-mock", {
    method: "post",
    body: JSON.stringify({ name, mock }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    return response.json();
  });
}

export function updateApiLock(name, locked) {
  return fetch("/cgi-bin/automock/update-api-lock", {
    method: "post",
    body: JSON.stringify({ name, locked }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    return response.json();
  });
}
export function deleteApi(name) {
  return fetch("/cgi-bin/automock/delete-api", {
    method: "post",
    body: JSON.stringify({ name }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    return response.json();
  });
}
export function batchDelete(params) {
  return fetch("/cgi-bin/automock/batch-delete-api", {
    method: "post",
    body: JSON.stringify(params),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    return response.json();
  });
}

export function getVersions(params) {
  return fetch("/cgi-bin/automock/get-versions", {
    method: "post",
    body: JSON.stringify(params),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    return response.json();
  });
}

export function addVersion(params) {
  return fetch("/cgi-bin/automock/add-new-version", {
    method: "post",
    body: JSON.stringify(params),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    return response.json();
  });
}

export function deleteVersion(params) {
  return fetch("/cgi-bin/automock/delete-version", {
    method: "post",
    body: JSON.stringify(params),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    return response.json();
  });
}
export function updateVersionContent(params) {
  return fetch("/cgi-bin/automock/update-version-content", {
    method: "post",
    body: JSON.stringify(params),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    return response.json();
  });
}
export function updateVersionName(params) {
  return fetch("/cgi-bin/automock/update-version-name", {
    method: "post",
    body: JSON.stringify(params),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    return response.json();
  });
}

export function setMockVersion(params) {
  return fetch("/cgi-bin/automock/set-mock-version", {
    method: "post",
    body: JSON.stringify(params),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    return response.json();
  });
}
