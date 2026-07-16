/**
 * XSS Protection Middleware
 * Strips all HTML tags from request data to prevent XSS attacks.
 */

const stripHtml = (str) => {
  return str
    .replace(/<[^>]*>/g, "") // Remove all HTML tags
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ""); // Remove script tags
};

const sanitize = (obj) => {
  if (typeof obj === "string") {
    return stripHtml(obj);
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

const xssClean = (req, res, next) => {
  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);
  next();
};

module.exports = xssClean;

