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
          reject(new Error('Nationalize: invalid JSON response'));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(8000, () => req.destroy(new Error('Nationalize: request timeout')));
  });
}

async function fetchNationality(name) {
  const url = `https://api.nationalize.io?name=${encodeURIComponent(name)}`;
  const { status, body } = await get(url);

  if (
    status !== 200 ||
    !Array.isArray(body.country) ||
    body.country.length === 0
  ) {
    const err = new Error('Nationalize returned an invalid response');
    err.status  = 502;
    err.apiName = 'Nationalize';
    throw err;
  }

  // Pick highest probability country
  const top = body.country.reduce((best, c) =>
    c.probability > best.probability ? c : best
  );

  return {
    country_id:          top.country_id,
    country_probability: top.probability,
  };
}

module.exports = { fetchNationality };