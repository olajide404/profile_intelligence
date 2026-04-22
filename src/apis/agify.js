const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          reject(new Error('Agify: invalid JSON response'));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(8000, () => req.destroy(new Error('Agify: request timeout')));
  });
}

async function fetchAge(name) {
  const url = `https://api.agify.io?name=${encodeURIComponent(name)}`;
  const { status, body } = await get(url);

  if (
    status !== 200 ||
    body.age === null ||
    body.age === undefined
  ) {
    const err = new Error('Agify returned an invalid response');
    err.status  = 502;
    err.apiName = 'Agify';
    throw err;
  }

  return {
    age:       body.age,
    age_group: classifyAge(body.age),
  };
}

function classifyAge(age) {
  if (age <= 12) return 'child';
  if (age <= 19) return 'teenager';
  if (age <= 59) return 'adult';
  return 'senior';
}

module.exports = { fetchAge };