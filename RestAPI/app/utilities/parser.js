// PARSER FILE
// ============================================================
exports.tryParseInt = (stringValue, defaultValue) => {
  if (!stringValue) return defaultValue;

  try {
    return parseInt(stringValue, 10);
  } catch(err) {
    return defaultValue;
  }
};

exports.parseAnswer = (answer) => {
  if (!answer) {
    throw "Can't parse answer";
    return
  }

  const lowerString = answer.toLowerCase()
  const noSpaces = lowerString.replace(/\s+/g, '')
  return noSpaces
}