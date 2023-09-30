function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateRandomInteger(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

module.exports = {
  generateRandomInteger,
  sleep,
};
