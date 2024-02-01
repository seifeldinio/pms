// Routes for project-related operations

const express = require("express");
const router = express.Router();
const passport = require("passport");
const emailsController = require("../controllers/emailsController"); // Adjust the path based on your project structure

const { isAdmin } = require("../middlewares/authentication");

// Manually send email
router.post(
  "/send-email/:projectId",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  emailsController.manuallySendEmail
);

// Get all sent emails to a project
router.get(
  "/project/:projectId/sent-emails",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  emailsController.getSentEmailsForProject
);

// Get all sent emails
router.get(
  "/sent-emails",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  emailsController.getAllSentEmails
);

module.exports = router;

// DOCUMENTATION

/**
 * @swagger
 * tags:
 *   - name: Emails
 *     description: Operations related to emails
 */

/**
 * @swagger
 * /api/v1/emails/send-email/{projectId}:
 *   post:
 *     summary: Manually send an email to the client of a project
 *     description: |
 *         Only admins (users with isAdmin: true) are authorized to resend the notice email to the client indicating the project start.
 *     tags: [Emails]
 *     security:
 *       - bearerAuth: []  # Bearer token is required
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         description: ID of the project
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Email sent successfully
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
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/emails/project/{projectId}/sent-emails:
 *   get:
 *     summary: Get all sent emails for a project
 *     description: |
 *         Only admins (users with isAdmin: true) are authorized to retrieve all the sent emails sent to a specific client of the project.
 *     tags: [Emails]
 *     security:
 *       - bearerAuth: []  # Bearer token is required
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         description: ID of the project
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *       - in: query
 *         name: per_page
 *         description: Number of emails per page for pagination
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sent emails retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 sentEmails:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SentEmail'
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/emails/sent-emails:
 *   get:
 *     summary: Get all sent emails
 *     description: |
 *         Only admins (users with isAdmin: true) can retrieve all sent emails to all clients.
 *     tags: [Emails]
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
 *         description: Number of emails per page for pagination
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: All sent emails retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 sentEmails:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SentEmail'
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       500:
 *         description: Internal server error
 */

// Components section (definitions)
/**
 * @swagger
 * components:
 *   schemas:
 *     SentEmail:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier for the sent email.
 *         projectId:
 *           type: integer
 *           description: The ID of the project associated with the sent email.
 *         clientEmail:
 *           type: string
 *           description: The email address of the client to whom the email was sent.
 *         sharedLinkToken:
 *           type: string
 *           description: A unique token associated with the project for shared links.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the email was sent.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the sent email was last updated.
 *       required:
 *         - projectId
 *         - clientEmail
 *         - sharedLinkToken
 *         - createdAt
 *         - updatedAt
 */
