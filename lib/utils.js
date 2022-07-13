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

const removePropertyAttr = (storage, property, attrName) => {
  if (storage.hasProperty(property)) {
    const oldVal = storage.getProperty(property);
    if (typeof oldVal === "object") {
      delete oldVal[attrName];
      storage.setProperty(property, oldVal);
    }
  }
};
const getPropertyAttr = (storage, property, attrName) => {
  const props = storage.getProperty(property);
  return props[attrName];
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
  setProperty(storage, filename, properties || {});
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

function getVersionName(name) {
  return "version." + name;
}

/**
 * 版本管理
 */

// 新增版本
const addNewVersion = ({ storage, filename, versionName, content }) => {
  const name = getVersionName(versionName);
  setProperty(storage, filename, { [name]: content });
};
// 更新版本文件内容
const updateVersionContent = ({ storage, filename, versionName, content }) => {
  const name = getVersionName(versionName);
  setProperty(storage, filename, { [name]: content });
};
// 获取版本文件内容
const getVersionContent = ({ storage, filename, versionName }) => {
  const name = getVersionName(versionName);
  return getPropertyAttr(storage, filename, name);
};
// 删除版本
const deleteVersion = ({ storage, filename, versionName }) => {
  const name = getVersionName(versionName);
  removePropertyAttr(storage, filename, name);
};
// 更新版本名称
const updateVersionName = ({ storage, filename, versionName, newVersion }) => {
  const file = getVersionContent(versionName);
  addNewVersion(storage, filename, { versionName: newVersion, file });
  deleteVersion({ storage, filename, versionName });
};
const getVersions = ({ storage, filename }) => {
  const props = getProperty(storage, filename);
  let list = [];
  Object.keys(props).forEach((key) => {
    const matchs = key.match(/^version\.{1}(.+)/);
    if (matchs && matchs[1]) {
      list.push({
        filename: matchs[1],
        content: props[key],
      });
    }
  });
  return list;
};
exports.addNewVersion = addNewVersion;
exports.updateVersionContent = updateVersionContent;
exports.deleteVersion = deleteVersion;
exports.updateVersionName = updateVersionName;
exports.getVersions = getVersions;
exports.setProperty = setProperty;
exports.getProperty = getProperty;
exports.getPropertyAttr = getPropertyAttr;
exports.getVersionContent = getVersionContent;
exports.removeProperty = removeProperty;
exports.removePropertyAttr = removePropertyAttr;
exports.writeFile = writeFile;
exports.getApiList = getApiList;
exports.updateFile = updateFile;
exports.readFile = readFile;
exports.removeFile = removeFile;
exports.getFilename = getFilename;
exports.getApiListUpdated = getApiListUpdated;
exports.setApiListUpdated = setApiListUpdated;
exports.getRule = getRule;
