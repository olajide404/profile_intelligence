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
          reject(new Error('Genderize: invalid JSON response'));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(8000, () => req.destroy(new Error('Genderize: request timeout')));
  });
}

async function fetchGender(name) {
  const url = `https://api.genderize.io?name=${encodeURIComponent(name)}`;
  const { status, body } = await get(url);

  if (
    status !== 200 ||
    body.gender === null ||
    body.gender === undefined ||
    body.count === null ||
    body.count === undefined ||
    body.count === 0
  ) {
    const err = new Error('Genderize returned an invalid response');
    err.status  = 502;
    err.apiName = 'Genderize';
    throw err;
  }

  return {
    gender:             body.gender,
    gender_probability: body.probability,
    sample_size:        body.count,
  };
}

module.exports = { fetchGender };