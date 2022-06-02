const zlib = require("zlib");
const { RuleValueMap } = require("./const");
// const URL = require('url')
const setProperty = (storage, property, val) => {
  if (storage.hasProperty(property)) {
    const oldVal = storage.getProperty(property);
    if (typeof oldVal === "object") {
      storage.setProperty(property, Object.assign(oldVal, val));
    } else {
      storage.setProperty(property, val);
    }
  } else {
    storage.setProperty(property, val);
  }
};

const getProperty = (storage, property) => {
  return storage.getProperty(property);
};
const removeProperty = (storage, property) => {
  return storage.removeProperty(property);
};

const writeFile = ({ storage, filename, body, properties, encoding }) => {
  if (encoding === "gzip") {
    body = zlib.gunzipSync(body);
  } else if (encoding === "deflate") {
    body = zlib.inflateSync(body);
  }
  const type = Object.prototype.toString.call(body);
  setProperty(
    storage,
    filename,
    Object.assign({ time: Date.now() }, properties || {})
  );
  if (type === "[object String]") {
    storage.writeFile(filename, body);
  } else if (type === "[object Object]") {
    storage.writeFile(filename, JSON.stringify(body));
  } else if (type === "[object Uint8Array]") {
    storage.writeFile(filename, body.toString());
  }
};

const getApiList = (storage) => {
  return storage.getFileList();
};

const updateFile = (storage, filename, body) => {
  if (!filename) {
    throw "文件名不能为空";
  }
  setProperty(storage, filename, { time: Date.now() });
  storage.writeFile(filename, JSON.stringify(body));
};

const readFile = (storage, filename) => {
  return storage.readFile(filename);
};

const removeFile = (storage, name) => {
  storage.removeFile(name);
  removeProperty(storage, name);
};
// 截取url问号前的url为文件名
const getFilename = (originalReq) => {
  const { url, ruleValue } = originalReq;
  const u = new URL(url);
  let filename = url;
  switch (ruleValue) {
    case RuleValueMap.href:
      filename = u.href;
      break;
    case RuleValueMap.pathname:
      filename = u.origin + u.pathname;
      break;
    default:
      filename = u.origin + u.pathname;
  }
  return filename;
};

const getApiListUpdated = (storage) => {
  return !!storage.getProperty("api-list-updated");
};
const setApiListUpdated = (storage, updated) => {
  return storage.setProperty("api-list-updated", updated);
};
const getRule = (originalReq) => {
  const { pattern, ruleValue } = originalReq;
  return `${pattern} automock://${ruleValue}`;
};

exports.isJsonReq = (headers) => {
  return (
    (headers.accept && headers.accept.includes("application/json")) ||
    headers["sec-fetch-dest"] === "empty" ||
    headers["Sec-Fetch-Dest"] === "empty"
  );
};
exports.setProperty = setProperty;
exports.getProperty = getProperty;
exports.removeProperty = removeProperty;
exports.writeFile = writeFile;
exports.getApiList = getApiList;
exports.updateFile = updateFile;
exports.readFile = readFile;
exports.removeFile = removeFile;
exports.getFilename = getFilename;
exports.getApiListUpdated = getApiListUpdated;
exports.setApiListUpdated = setApiListUpdated;
exports.getRule = getRule;
