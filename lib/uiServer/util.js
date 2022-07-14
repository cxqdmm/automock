exports.execFilter = function (result, filter) {
  const { key, value, method } = filter;
  const list = result.filter((item) => {
    const type = Object.prototype.toString.call(value);
    switch (method) {
      case "indexOf":
        if (type === "[object String]") {
          return ~item[key].indexOf(value);
        }
        break;
      case "equal":
        return item[key] === value;
      case "unequal":
        return item[key] !== value;
    }
    return true;
  });
  return list;
};
