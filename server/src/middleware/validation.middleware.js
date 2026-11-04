const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details.map(detail => detail.message).join(', '),
    });
  }

  // Express 5 makes req.query a getter, so plain assignment is ignored.
  Object.defineProperty(req, source, {
    value,
    writable: true,
    configurable: true,
    enumerable: true,
  });
  next();
};

module.exports = validate;
