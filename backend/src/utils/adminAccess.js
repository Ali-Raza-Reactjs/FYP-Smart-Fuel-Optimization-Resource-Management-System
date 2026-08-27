const isSuperAdmin = (user) => {
  if (!user || user.role !== 'Admin') return false;

  const configuredAdminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  return user.adminRole === 'superAdmin'
    || (configuredAdminEmail && user.email?.toLowerCase() === configuredAdminEmail);
};

const superAdminOnly = (req, res, next) => {
  if (!isSuperAdmin(req.user)) {
    res.status(403);
    return next(new Error('Only a Super Admin can manage administrator accounts'));
  }
  next();
};

module.exports = { isSuperAdmin, superAdminOnly };
