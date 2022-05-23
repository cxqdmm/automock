const zlib = require("zlib");

exports.setProperty = (storage, property, val) => {
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

exports.getProperty = (storage, property) => {
  return storage.getProperty(property);
};
exports.removeProperty = (storage, property) => {
  return storage.removeProperty(property);
};

exports.writeFile = (storage, filename, body, encoding) => {
  if (encoding === "gzip") {
    body = zlib.gunzipSync(body);
  } else if (encoding === "deflate") {
    body = zlib.inflateSync(body);
  }
  // 创建并写入文件
  let content = {
    time: Date.now(),
    data: body.toString(),
  };

  storage.writeFile(filename, JSON.stringify(content));
};

exports.getCachedApiList = (storage, filters) => {
  const list = storage.getFileList();
  return filters.reduce((result, filter) => {
    const { key, value } = filter;
    return result.filter((item) => item[key] && ~item[key].indexOf(value));
  }, list);
};

exports.updateFile = (storage, filename, body) => {
  // 创建并写入文件
  let content = {
    time: Date.now(),
    data: JSON.stringify(body),
  };
  storage.writeFile(filename, JSON.stringify(content));
};

exports.readFile = (storage, filename) => {
  return storage.readFile(filename);
};

exports.removeFile = (storage, name) => {
  storage.removeFile(name);
};
// 截取url问号前的url为文件名
exports.getFilename = (url) => {
  if (url) {
    return url.split("?")[0];
  }
  return "";
};

exports.getApiListUpdated = (storage) => {
  return !!storage.getProperty("api-list-updated");
};
exports.setApiListUpdated = (storage, updated) => {
  return storage.setProperty("api-list-updated", updated);
};
