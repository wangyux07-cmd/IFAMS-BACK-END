function success(res, data = null, msg = 'Success') {
  return res.json({ code: 200, msg, data });
}

function created(res, data = null, msg = 'Created') {
  return res.status(201).json({ code: 201, msg, data });
}

function error(res, code = 500, msg = 'Server error', data = null) {
  return res.status(code).json({ code, msg, data });
}

module.exports = { success, created, error };
