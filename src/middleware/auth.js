const db = require("../db");

const authenticate = async (req, res, next) => {
  const token = req.headers["authorization"];
  const DUMMY_TOKEN = "123456";

  if (token === DUMMY_TOKEN) {
    const userId = req.headers["user-id"];
    if (userId) {
      try {
        const result = await db.execute("SELECT * FROM users WHERE id = ?", [
          userId,
        ]);
        if (result.rows.length > 0) {
          req.user = { id: userId }; // Attach user info to the request
          return next();
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  res.status(401).json({ message: "Unauthorized" }); // Token is invalid, respond with 401
};

module.exports = authenticate;
