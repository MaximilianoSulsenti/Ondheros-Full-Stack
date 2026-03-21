export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        error: "No autenticado"
      });
    }

    // normalizamos roles
    const userRole = req.user.role?.toLowerCase();
    const rolesAllowed = allowedRoles.map(r => r.toLowerCase());

    if (rolesAllowed.length && !rolesAllowed.includes(userRole)) {
      return res.status(403).json({
        status: "error",
        error: "Acceso denegado"
      });
    }

    next();
  };
};
