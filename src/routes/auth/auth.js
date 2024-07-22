// routes/auth.js
const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const db = require("../../db");

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/verify-token", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  try {
    // Verify the token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const userId = payload.sub; // Google user ID
    const username = payload.name;

    // Check if user already exists
    const existingUser = await db.execute("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    if (existingUser.rows.length === 0) {
      // Insert new user if doesn't exist
      await db.execute("INSERT INTO users (id, username) VALUES (?, ?)", [
        userId,
        username,
      ]);
    }

    // Send user data back to the client
    res.json({ id: userId, username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to verify token" });
  }
});

module.exports = router;
