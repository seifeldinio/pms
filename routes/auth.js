const express = require("express");
const {
  authenticateUser,
  generateToken,
} = require("../middlewares/authentication");
const router = express.Router();

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await authenticateUser(email, password);

    if (user) {
      const token = generateToken(user);

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Internal server error" });
        }

        // Exclude sensitive information from the response
        const sanitizedUser = {
          id: user.id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
        };

        return res.json({
          message: "Login successful",
          user: sanitizedUser,
          token,
        });
      });
    } else {
      return res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Error during authentication:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

// SWAGGER DOCUMENTATION

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication operations
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Authenticate and obtain a Bearer token
 *     description: |
 *       - Upon successful login, the API will provide a token that must be included in the Authorization header for subsequent requests.
 *       - The token is essential for authenticating and authorizing API access.
 *       - ✨ User Role Determination:
 *       - The token payload includes user information with an isAdmin field. If isAdmin is true, the user has admin privileges; if false, they are a non-admin user (technician).
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Authentication successful, Bearer token obtained
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     isAdmin:
 *                       type: boolean
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Internal server error
 */

// Components
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier for the user.
 *         email:
 *           type: string
 *           description: The email address of the user.
 *         password:
 *           type: string
 *           description: The password of the user.
 *         name:
 *           type: string
 *           description: The name of the user.
 *         isAdmin:
 *           type: boolean
 *           description: Indicates whether the user has administrator privileges (true) or is a technician (false).
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the user was created.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the user was last updated.
 *       required:
 *         - email
 *         - password
 *         - name
 *         - createdAt
 *         - updatedAt
 */
