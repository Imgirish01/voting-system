/**
 * Request validation helper middleware
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    const errors = [];

    if (schema.body) {
      for (const [field, rules] of Object.entries(schema.body)) {
        const val = req.body[field];

        if (rules.required && (val === undefined || val === null || val === '')) {
          errors.push(`Field '${field}' is required.`);
          continue;
        }

        if (val !== undefined && val !== null && val !== '') {
          if (rules.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(val)) {
              errors.push(`Field '${field}' must be a valid email address.`);
            }
          }
          if (rules.minLength && String(val).length < rules.minLength) {
            errors.push(`Field '${field}' must be at least ${rules.minLength} characters.`);
          }
          if (rules.enum && !rules.enum.includes(val)) {
            errors.push(`Field '${field}' must be one of [${rules.enum.join(', ')}].`);
          }
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors,
      });
    }

    next();
  };
};

module.exports = validateRequest;

