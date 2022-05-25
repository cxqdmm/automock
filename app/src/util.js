exports.getActivePatterns = (rules = "") => {
  return rules
    .split("\n")
    .map((i) => i.trim())
    .filter((i) => i[0] !== "#")
    .filter((i) => ~i.indexOf("automock://"))
    .map((i) => i.split(" ")[0]);
};
