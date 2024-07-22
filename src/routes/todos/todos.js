const express = require("express");
const router = express.Router();
const db = require("../../db");

// Create a new todo
router.post("/", async (req, res) => {
  const { text } = req.body;
  const userId = req.userId; // Get user ID from the request
  if (!text) {
    return res.status(400).send("Todo text is required");
  }

  try {
    const result = await db.execute(
      "INSERT INTO todos (text, user_id) VALUES (?, ?) RETURNING *",
      [text, userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Get all todos for the logged-in user
router.get("/", async (req, res) => {
  const userId = req.userId; // Get user ID from the request
  try {
    const result = await db.execute("SELECT * FROM todos WHERE user_id = ?", [
      userId,
    ]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Get a single todo by ID for the logged-in user
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const userId = req.userId; // Get user ID from the request
  try {
    const result = await db.execute(
      "SELECT * FROM todos WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Todo not found");
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Update a toodo as marked
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { checked } = req.body;
  const userId = req.userId; // Get user ID from the request
  if (typeof checked !== "boolean") {
    return res.status(400).send("Invalid parameter");
  }

  try {
    const result = await db.execute(
      "UPDATE todos SET checked = ? WHERE id = ? AND user_id = ? RETURNING *",
      [checked, id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Todo not found");
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Update a todo by ID for the logged-in user
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const userId = req.userId; // Get user ID from the request
  if (!text) {
    return res.status(400).send("Todo text is required");
  }

  try {
    const result = await db.execute(
      "UPDATE todos SET text = ? WHERE id = ? AND user_id = ? RETURNING *",
      [text, id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Todo not found");
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Delete a todo by ID for the logged-in user
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const userId = req.userId; // Get user ID from the request
  try {
    const result = await db.execute(
      "DELETE FROM todos WHERE id = ? AND user_id = ? RETURNING *",
      [id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Todo not found");
    }
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

module.exports = router;
