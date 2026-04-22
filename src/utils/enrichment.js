const { fetchGender }      = require('../apis/genderize');
const { fetchAge }         = require('../apis/agify');
const { fetchNationality } = require('../apis/nationalize');

async function enrichName(name) {
  // Call all three APIs at the same time
  const [genderData, ageData, nationalityData] = await Promise.all([
    fetchGender(name),
    fetchAge(name),
    fetchNationality(name),
  ]);

  return {
    ...genderData,
    ...ageData,
    ...nationalityData,
  };
}

module.exports = { enrichName };