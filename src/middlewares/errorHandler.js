// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // 502 from any of the 3 external APIs
  if (err.status === 502 && err.apiName) {
    return res.status(502).json({
      status:  '502',
      message: `${err.apiName} returned an invalid response`,
    });
  }

  // Other known HTTP errors
  if (err.status >= 400 && err.status < 600) {
    return res.status(err.status).json({
      status:  'error',
      message: err.message,
    });
  }

  // Postgres duplicate (race condition fallback)
  if (err.code === '23505') {
    return res.status(409).json({
      status:  'error',
      message: 'A profile with this name already exists',
    });
  }

  // Unexpected crash
  console.error('Unhandled error:', err);
  return res.status(500).json({
    status:  'error',
    message: 'Internal server error',
  });
}

module.exports = { errorHandler };