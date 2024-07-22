const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const db = require("../db");

const authenticate = async (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const userId = payload.sub;

    const result = await db.execute("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    if (result.rows.length > 0) {
      req.user = result.rows[0]; // Attach user info to the request
      return next();
    } else {
      return res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = authenticate;
