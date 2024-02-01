// Routes for client-related operations
const express = require("express");
const router = express.Router();
const passport = require("passport");
const clientController = require("../controllers/clientController");

const { isAdmin } = require("../middlewares/authentication");

// Get project by link
router.get("/:sharedLinkToken", clientController.getProjectBysharedLinkToken);

// Create client
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  clientController.createClient
);

// Get all clients
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  clientController.getAllClients
);

// Get client by email
router.get(
  "/email/:email",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  clientController.getClientByEmail
);

// Update client
router.put(
  "/:currentEmail",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  clientController.updateClient
);

// Delete client
router.delete(
  "/:email",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  clientController.deleteClient
);

module.exports = router;

// DOCUMENTATION

/**
 * @swagger
 * tags:
 *   - name: Clients
 *     description: Operations related to clients
 */

/**
 * @swagger
 * /api/v1/projects/{sharedLinkToken}:
 *   get:
 *     summary: Get project by link
 *     description: |
 *       - Retrieve project details using the shared link token.
 *       - This shared link to clients will only allow clients to view certain fields (name, description, start date, status, Note to clients).
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: sharedLinkToken
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique shared link token associated with the project.
 *     responses:
 *       200:
 *         description: Project details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 project:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: The name of the project.
 *                     description:
 *                       type: string
 *                       description: The description of the project.
 *                     startDate:
 *                       type: string
 *                       format: date
 *                       description: The start date of the project.
 *                     status:
 *                       type: string
 *                       description: The status of the project.
 *                     noteToClient:
 *                       type: string
 *                       description: A note to the client regarding the project.
 *       404:
 *         description: Project not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 */

/**
 * @swagger
 * /api/v1/clients:
 *   post:
 *     summary: Create client
 *     description: |
 *         Only an admin (users with isAdmin: true) is authorized to create a client.
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []  # Bearer token is required
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Client created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 client:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *       400:
 *         description: Invalid request or email address already in use
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       403:
 *         description: Forbidden, admin privileges required
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/clients:
 *   get:
 *     summary: Get all clients
 *     description: |
 *         Only an admin (users with isAdmin: true) is authorized to view all clients.
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []  # Bearer token is required
 *     parameters:
 *       - in: query
 *         name: page
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *       - in: query
 *         name: per_page
 *         description: Number of clients per page for pagination
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Clients retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 clients:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       email:
 *                         type: string
 *                       name:
 *                         type: string
 *                       updatedAt:
 *                         type: string
 *       401:
 *         description: Unauthorized. Bearer token required.
 *       403:
 *         description: Forbidden. Admin privileges required.
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/clients/email/{email}:
 *   get:
 *     summary: Get client by email
 *     description: |
 *         Only an admin (users with isAdmin: true) is authorized to view a specific client.
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []  # Bearer token is required
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         description: Email address of the client
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Client retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 client:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       403:
 *         description: Forbidden, admin privileges required
 *       404:
 *         description: Client not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/clients/{currentEmail}:
 *   put:
 *     summary: Update client
 *     description: |
 *         Only an admin (users with isAdmin: true) is authorized to update a client.
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []  # Bearer token is required
 *     parameters:
 *       - in: path
 *         name: currentEmail
 *         required: true
 *         description: Current email address of the client
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Client updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 client:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *       400:
 *         description: Invalid request or email address already in use
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       403:
 *         description: Forbidden, admin privileges required
 *       404:
 *         description: Client not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/clients/{email}:
 *   delete:
 *     summary: Delete client
 *     description: |
 *         Only an admin (users with isAdmin: true) is authorized to delete a client.
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []  # Bearer token is required
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         description: Email address of the client to be deleted
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Client deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Email is required for deletion
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       403:
 *         description: Forbidden, admin privileges required
 *       404:
 *         description: Client not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Client:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier for the client.
 *         email:
 *           type: string
 *           format: email
 *           description: The email address of the client.
 *         name:
 *           type: string
 *           description: The name of the client.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the client was created.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the client was last updated.
 *       required:
 *         - email
 *         - name
 *         - createdAt
 *         - updatedAt
 */
