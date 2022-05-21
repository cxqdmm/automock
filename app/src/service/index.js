export function getApiList() {
  return fetch("/cgi-bin/api-list").then((response) => {
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
