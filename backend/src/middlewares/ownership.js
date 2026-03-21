export const checkUserOwnership = (req, res, next) => {
  const { uid } = req.params;
  const loggedUser = req.user;

  if (!loggedUser) {
    return res.status(401).json({
      status: "error",
      error: "No autenticado"
    });
  }

  // Admin tiene acceso a todo
  if (loggedUser.role === "admin") {
    return next();
  }

  // User solo su propio recurso
  if (loggedUser._id.toString() !== uid) {
    return res.status(403).json({
      status: "error",
      error: "No podés modificar otro usuario"
    });
  }

  next();
};
