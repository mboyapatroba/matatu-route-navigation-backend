const adminPageProtection = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Unauthorised Access to admin Page",
    });
  }

  next();
};
module.exports = adminPageProtection;
