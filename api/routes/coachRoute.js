const express = require("express");
const checkAuth = require('../middleware/check-auth');
const { fetchUser, createUser, editUser, deleteUser
} = require("../controller/coach");

const router = express.Router();

/**
 * @swagger
 * /api/coach/fetchUser:
 *   get:
 *     summary: Fetch all users
 *     tags: [User]
 *     responses:
 *       200:
 *         description: List of all users
 *       500:
 *         description: Database error
 */
router.get("/fetchUser", fetchUser);

/**
 * @swagger
 * /api/coach/createUser:
 *   post:
 *     summary: Create a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               emailId:
 *                 type: string
 *               phone:
 *                 type: string
 *             required:
 *               - name
 *               - emailId
 *               - phone
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error or email already exists
 */
router.post("/createUser", createUser);

/**
 * @swagger
 * /api/coach/editUser/{id}:
 *   put:
 *     summary: Edit user details
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               emailId:
 *                 type: string
 *               phone:
 *                 type: string
 *             required:
 *               - name
 *               - emailId
 *               - phone
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation error or user not found
 *       500:
 *         description: Database error
 */
router.put("/editUser/:id", editUser);

/**
 * @swagger
 * /api/coach/deleteUser/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: User not found with this ID
 *       500:
 *         description: Database error
 */
router.delete("/deleteUser/:id", deleteUser);


module.exports = router;
