// Routes for project-related operations
const express = require("express");
const router = express.Router();
const passport = require("passport");
const projectController = require("../controllers/projectController");
const commentController = require("../controllers/commentController");
const limiter = require("../middlewares/rateLimiter");

const { isAdmin } = require("../middlewares/authentication");

// Create a new project
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  projectController.createProject
);

// Assign technicians to project
router.post(
  "/:projectId/assign",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  projectController.assignTechniciansToProject
);

// Route to view all projects
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  projectController.getAllProjects
);

// Search projects
router.get(
  "/search",
  passport.authenticate("jwt", { session: false }),
  projectController.searchProjects
);

// Get project by ID
router.get(
  "/:projectId",
  passport.authenticate("jwt", { session: false }),
  projectController.getProjectById
);

// Update an existing project
router.put(
  "/:projectId",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  projectController.updateProject
);

// Update project status only
router.put(
  "/:projectId/status",
  passport.authenticate("jwt", { session: false }),
  limiter,
  projectController.updateProjectStatus
);

// Delete a project
router.delete(
  "/:projectId",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  projectController.deleteProject
);

// Add a comment to a project
// Admin can add comments
// Technicians can add comments (To their assigned projects only)
router.post(
  "/post/comment",
  passport.authenticate("jwt", { session: false }),
  limiter,
  commentController.postComment
);

// Export all overdue projects of the last month
router.get(
  "/export/overdue-last-month",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  projectController.exportOverdueProjects
);

module.exports = router;

// SWAGGER DOCUMENTATION

/**
 * @swagger
 * tags:
 *   - name: Projects
 *     description: Operations related to projects
 */

/**
 * @swagger
 * /api/v1/projects:
 *   post:
 *     summary: Create a new project
 *     description: |
 *       Only admins (users with isAdmin: true) can create a project.
 *       When the (clientEmail) is provided during project creation:
 *       - If the client already exists, the project will be associated with the existing client's ID.
 *       - If the client does not exist, a new client will be created using the provided email,
 *         and the project will be associated with the newly created client's ID.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []  # Bearer token is required
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               dueDate:
 *                 type: string
 *                 format: date
 *               noteToClient:
 *                 type: string
 *               clientEmail:
 *                 type: string
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 project:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     startDate:
 *                       type: string
 *                       format: date
 *                     dueDate:
 *                       type: string
 *                       format: date
 *                     noteToClient:
 *                       type: string
 *                     status:
 *                       type: string
 *                     sharedLinkToken:
 *                       type: string
 *       400:
 *         description: Invalid request or date format
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       403:
 *         description: Forbidden, admin privileges required
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/projects/{projectId}/assign:
 *   post:
 *     summary: Assign technicians to a project
 *     description: |
 *       Only admins (users with isAdmin: true) can assign a technician (users with isAdmin: false by default) to a project.
 *       - If a technician has overdue projects (projects with a due date in the past and status not Closed), they cannot be assigned to new projects until all overdue projects are Closed.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []  # Bearer token is required
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         description: ID of the project
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Technicians assigned to the project successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request or user ID(s)
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       403:
 *         description: Forbidden, admin privileges required
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/projects:
 *   get:
 *     summary: Get all projects
 *     description: |
 *       Only admins (users with isAdmin: true) can view all projects. Technicians (users with isAdmin: false by default) can only see projects they are assigned to.
 *     tags: [Projects]
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
 *         description: Number of projects per page for pagination
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 projects:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       403:
 *         description: Forbidden, admin privileges required
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/projects/search:
 *   get:
 *     summary: Search projects
 *     description: |
 *       - Only admins (users with isAdmin: true) can view all filtered projects. Technicians (users with isAdmin: false by default) can only see the filtered projects assigned to them.
 *       - Find a project by name, creation date or due date (within a specified range) or status or find all overdue projects.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []  # Bearer token is required
 *     parameters:
 *       - in: query
 *         name: name
 *         description: Search by project name
 *         schema:
 *           type: string
 *       - in: query
 *         name: creationDate
 *         description: Search by creation date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dueDate
 *         description: Search by due date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dateRangeStart
 *         description: Search by start date in a range
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dateRangeEnd
 *         description: Search by end date in a range
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: status
 *         description: Search by project status
 *         schema:
 *           type: string
 *       - in: query
 *         name: findAllOverdue
 *         description: Find all overdue projects
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 projects:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/projects/{projectId}:
 *   get:
 *     summary: Get project by ID
 *     description: |
 *       Only admins (users with isAdmin: true) can view any specific project by ID. Technicians (users with isAdmin: false by default) can only view the projects assigned to them.
 *     tags: [Projects]
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
 *         description: Project retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 project:
 *                   $ref: '#/components/schemas/Project'
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       403:
 *         description: Forbidden, project not assigned to the user
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/projects/{projectId}:
 *   put:
 *     summary: Update an existing project
 *     description: |
 *       Only admins (users with isAdmin: true) can update a project.
 *       - If a technician has overdue projects (projects with a due date in the past and status not Closed),
 *         they cannot be assigned to new projects until all overdue projects are Closed.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []  # Bearer token is required
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         description: ID of the project
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProjectRequest'
 *           example:
 *             name: "Updated Project Name"
 *             description: "This is the updated project description."
 *             startDate: "2024-02-31"
 *             dueDate: "2024-03-31"
 *             noteToClient: "Please review the updated project details."
 *             status: "Open"
 *             userIds: [2, 3]
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 project:
 *                   $ref: '#/components/schemas/Project'
 *       400:
 *         description: Invalid request, user ID(s), or status value
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       403:
 *         description: Forbidden, open projects assigned to technicians
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/projects/{projectId}/status:
 *   put:
 *     summary: Update project status only
 *     description: |
 *       - Admins (users with isAdmin: true) can update a project's status to any of these values (Open, In Progress, Completed, Closed or Rejected).
 *       - Technicians (users with isAdmin: false by default) can update a project status to (Open, In Progress, Completed) only.
 *       - Rate Limit: 100 requests per 15 minutes
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []  # Bearer token is required
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         description: ID of the project
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 project:
 *                   $ref: '#/components/schemas/Project'
 *       400:
 *         description: Invalid status value for the user role
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       403:
 *         description: Forbidden, user not assigned to the project
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/projects/{projectId}:
 *   delete:
 *     summary: Delete a project
 *     description: |
 *       Only admins (users with isAdmin: true) can delete a project.
 *     tags: [Projects]
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
 *         description: Project deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       403:
 *         description: Forbidden, admin privileges required
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/projects/export/overdue-last-month:
 *   get:
 *     summary: Export all overdue projects of the last month
 *     description: |
 *       Only admins (users with isAdmin: true) can view all overdue projects of the last month.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []  # Bearer token is required
 *     responses:
 *       200:
 *         description: Overdue projects exported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 projects:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       403:
 *         description: Forbidden, admin privileges required
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/projects/post/comment:
 *   post:
 *     summary: Post a comment on a project
 *     description: |
 *       This endpoint allows users to post comments on a specific project.
 *       - Admins (users with isAdmin: true) can comment on all projects.
 *       - Technicians (users with isAdmin: false) can provide comments on projects they are assigned to.
 *       - Rate Limit: 100 requests per 15 minutes
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []  # Bearer token is required
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         description: ID of the project
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: The text of the comment.
 *     responses:
 *       201:
 *         description: Comment posted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 comment:
 *                   $ref: '#/components/schemas/Comment'
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       403:
 *         description: Forbidden, user not assigned to the project
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */

// Components section (definitions)
// PROJECT
/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier for the project.
 *         name:
 *           type: string
 *           description: The name of the project.
 *         description:
 *           type: string
 *           description: The description of the project.
 *         startDate:
 *           type: string
 *           format: date
 *           description: The start date of the project.
 *         dueDate:
 *           type: string
 *           format: date
 *           description: The due date of the project.
 *         noteToClient:
 *           type: string
 *           description: A note to the client regarding the project.
 *         status:
 *           type: string
 *           description: The status of the project (Open, In Progress, Completed, Closed, Rejected).
 *         clientId:
 *           type: integer
 *           description: The ID of the client associated with the project.
 *         sharedLinkToken:
 *           type: string
 *           description: A unique token associated with the project for shared links.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the project was created.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the project was last updated.
 *       required:
 *         - name
 *         - startDate
 *         - dueDate
 *         - createdAt
 *         - updatedAt
 */

// COMMENT
/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier for the comment.
 *         userId:
 *           type: integer
 *           description: The ID of the user who posted the comment.
 *         text:
 *           type: string
 *           description: The text of the comment.
 *         projectId:
 *           type: integer
 *           description: The ID of the project the comment is posted on.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the comment was created.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the comment was last updated.
 *       required:
 *         - userId
 *         - text
 *         - projectId
 *         - createdAt
 *         - updatedAt
 */
