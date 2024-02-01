// Routes for technician-related operations

const express = require("express");
const router = express.Router();
const passport = require("passport");
const technicianController = require("../controllers/technicianController");

const { isAdmin } = require("../middlewares/authentication");

// Route to create a new technician user
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  technicianController.createTechnician
);

// Get all technicians
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  technicianController.getAllTechnicians
);

// Get Technicians with overdue projects
router.get(
  "/overdue",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  technicianController.getTechniciansWithOverdueProjects
);

// Get a technician by ID
router.get(
  "/:technicianId",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  technicianController.getTechnicianById
);

// Update a technician by ID
router.put(
  "/:technicianId",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  technicianController.updateTechnician
);

// Delete technician
router.delete(
  "/:technicianId",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  technicianController.deleteTechnician
);

module.exports = router;

// DOCUMENTATION

/**
 * @swagger
 * tags:
 *   - name: Technicians
 *     description: Operations related to technicians
 */

/**
 * @swagger
 * /api/v1/technicians:
 *   post:
 *     summary: Create a new technician user
 *     description: |
 *         - Only an admin (users with isAdmin: true) is authorized to create a technician user.
 *         - Technician are users that have isAdmin set to false by default (isAdmin: false).
 *     tags: [Technicians]
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
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Technician created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Email is already in use
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/technicians:
 *   get:
 *     summary: Get all technicians
 *     description: |
 *         Only an admin (users with isAdmin: true) is authorized to view all technician users (users with isAdmin: false).
 *     tags: [Technicians]
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
 *         description: Number of technicians per page for pagination
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Technicians retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 technicians:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/technicians/overdue:
 *   get:
 *     summary: Get technicians with overdue projects
 *     description: |
 *         Only an admin (users with isAdmin: true) is authorized to view technicians with overdue projects.
 *     tags: [Technicians]
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
 *         description: Number of technicians per page for pagination
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Technicians with overdue projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 technicians:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/technicians/{technicianId}:
 *   get:
 *     summary: Get a technician by ID
 *     description: |
 *         Only an admin (users with isAdmin: true) is authorized to view a specific technician (user with isAdmin: false).
 *     tags: [Technicians]
 *     security:
 *       - bearerAuth: []  # Bearer token is required
 *     parameters:
 *       - in: path
 *         name: technicianId
 *         required: true
 *         description: ID of the technician
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Technician retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 technician:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       404:
 *         description: Technician not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/technicians/{technicianId}:
 *   put:
 *     summary: Update a technician by ID
 *     description: |
 *         Only an admin (users with isAdmin: true) is authorized to update a technician (user with isAdmin: false).
 *     tags: [Technicians]
 *     security:
 *       - bearerAuth: []  # Bearer token is required
 *     parameters:
 *       - in: path
 *         name: technicianId
 *         required: true
 *         description: ID of the technician
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTechnicianRequest'
 *           example:
 *             email: "newemail@example.com"
 *             password: "123456"
 *             name: "New Technician Name"
 *     responses:
 *       200:
 *         description: Technician updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 technician:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid request or email is already in use
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       404:
 *         description: Technician not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/technicians/{technicianId}:
 *   delete:
 *     summary: Delete a technician
 *     description: |
 *         Only an admin (users with isAdmin: true) is authorized to delete a technician (user with isAdmin: false).
 *     tags: [Technicians]
 *     security:
 *       - bearerAuth: []  # Bearer token is required
 *     parameters:
 *       - in: path
 *         name: technicianId
 *         required: true
 *         description: ID of the technician
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Technician deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       404:
 *         description: Technician not found
 *       500:
 *         description: Internal server error
 */
