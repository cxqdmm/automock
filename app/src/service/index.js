export function search(params) {
  return fetch("/cgi-bin/api-list", {
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
  return fetch("/cgi-bin/check-api-list").then((response) => {
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

export function updateApiData(name, data) {
  return fetch("/cgi-bin/update-api-data", {
    method: "post",
    body: JSON.stringify({ name, data }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    return response.json();
  });
}

export function updateApiMock(name, mock) {
  return fetch("/cgi-bin/update-api-mock", {
    method: "post",
    body: JSON.stringify({ name, mock }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    return response.json();
  });
}
export function deleteApi(name) {
  return fetch("/cgi-bin/delete-api", {
    method: "post",
    body: JSON.stringify({ name }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    return response.json();
  });
}
export function deleteAllApi(name) {
  return fetch("/cgi-bin/delete-all-api", {
    method: "post",
    body: JSON.stringify({ name }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    return response.json();
  });
}
