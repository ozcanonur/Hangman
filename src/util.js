const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomWord = (words, range) => words[getRandomInt(0, range)];

const findIndicesOfLetterInWord = (word, letter) => {
  const indices = [];
  for (let i = 0; i < word.length; i += 1) {
    if (word[i] === letter) indices.push(i);
  }
  return indices;
};

module.exports = { getRandomWord, findIndicesOfLetterInWord };
