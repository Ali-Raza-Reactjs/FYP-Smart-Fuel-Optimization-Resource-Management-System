let sanitizeHtml;

const sanitize = (obj) => {
  if (typeof obj === "string") {
    return sanitizeHtml(obj, {
      allowedTags: [], // Strip all HTML tags
      allowedAttributes: {},
    });
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitize(item));
  }
  if (typeof obj === "object" && obj !== null) {
    const sanitizedObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitizedObj[key] = sanitize(obj[key]);
      }
    }
    return sanitizedObj;
  }
  return obj;
};

const xssClean = async (req, res, next) => {
  try {
    if (!sanitizeHtml) {
      const mod = await import("sanitize-html");
      sanitizeHtml = mod.default || mod;
    }

    if (req.body) req.body = sanitize(req.body);
    if (req.query) req.query = sanitize(req.query);
    if (req.params) req.params = sanitize(req.params);
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = xssClean;
