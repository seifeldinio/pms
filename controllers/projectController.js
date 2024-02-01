// Controllers for project-related operations
const { Op, literal } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const {
  Project,
  User,
  ProjectAssignment,
  Comment,
  Client,
  SentEmail,
} = require("../models");

// Function to create a new project
const createProject = async (req, res) => {
  try {
    // Extract necessary information from the request body
    const { name, description, startDate, dueDate, noteToClient, clientEmail } =
      req.body;

    // Check if the user is an admin (assuming you have the isAdmin middleware applied)
    if (!req.isAuthenticated() || req.user.isAdmin === false) {
      return res
        .status(403)
        .json({ message: "Access forbidden. Admin privileges required." });
    }

    // Validate date format
    const isValidDate = (dateString) => {
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      return dateString.match(regex);
    };

    if (!isValidDate(startDate) || !isValidDate(dueDate)) {
      return res.status(400).json({ message: "Invalid date format." });
    }

    // Extract the part of the email before the '@' sign as the default name
    const defaultName = clientEmail.split("@")[0] || "Default Client";

    // Find or create the client based on the provided email
    const [client, created] = await Client.findOrCreate({
      where: { email: clientEmail },
      defaults: {
        name: req.body.clientName || defaultName,
      },
    });

    // Generate a unique link or token for the project
    const sharedLinkToken = uuidv4();

    // Create the new project with the associated client and the generated link or token
    const newProject = await Project.create({
      name,
      description,
      startDate,
      dueDate,
      noteToClient,
      sharedLinkToken,
      clientId: client.id, // Associate the project with the client
    });

    // Exclude sensitive information from the response
    const sanitizedProject = {
      id: newProject.id,
      name: newProject.name,
      description: newProject.description,
      startDate: newProject.startDate,
      dueDate: newProject.dueDate,
      noteToClient: newProject.noteToClient,
      status: newProject.status,
      sharedLinkToken: newProject.sharedLinkToken,
      clientId: client.id, // Associate the project with the client
    };

    return res.status(201).json({
      message: "Project created successfully",
      project: sanitizedProject,
    });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      // Handle specific Sequelize validation error
      return res
        .status(400)
        .json({ message: "Validation error. Please check your input." });
    } else if (
      error.name === "SequelizeDatabaseError" &&
      error.parent &&
      error.parent.code === "ER_TRUNCATED_WRONG_VALUE"
    ) {
      // Handle incorrect date format error
      return res.status(400).json({ message: "Invalid date format." });
    } else {
      // Handle other unexpected errors
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

// Assign Technicians to project
const assignTechniciansToProject = async (req, res) => {
  const techniciansToAssign = req.body.userIds;

  // Include explicit projectId and userId values when creating records
  const assignments = techniciansToAssign.map((userId) => {
    return {
      projectId: req.params.projectId,
      userId: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  try {
    const { userIds } = req.body;
    const projectId = req.params.projectId;

    // Check if the user is an admin
    if (!req.isAuthenticated() || req.user.isAdmin === false) {
      return res
        .status(403)
        .json({ message: "Access forbidden. Admin privileges required." });
    }

    // Check if the project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Find users with the provided userIds
    const users = await User.findAll({
      where: {
        id: userIds,
        isAdmin: false,
      },
    });

    if (users.length !== userIds.length) {
      return res.status(400).json({ message: "Invalid user ID(s)" });
    }

    // Check if any assigned technicians have open projects
    const assignedTechnicians = await User.findAll({
      where: {
        id: { [Op.in]: userIds },
        isAdmin: false,
      },
      include: [
        {
          model: Project,
          as: "assignedTechnicians", // Correct alias here
          attributes: ["id", "name", "status"],
          through: { attributes: [] }, // Exclude join table fields
          where: {
            status: "Open",
            id: { [Op.ne]: projectId },
          },
        },
      ],
    });

    if (assignedTechnicians.length > 0) {
      return res.status(400).json({
        message:
          "Technician has overdue projects. Close them before assigning new projects.",
      });
    }

    // Check if any overdue projects are assigned to the technicians
    // const overdueProjects = await Project.findAll({
    //   where: {
    //     dueDate: { [Op.lt]: new Date() },
    //     status: { [Op.ne]: "Closed" },
    //   },
    //   include: [
    //     {
    //       model: User,
    //       as: "assignedTechnicians",
    //       where: { id: { [Op.in]: userIds } },
    //     },
    //   ],
    // });

    // if (overdueProjects.length > 0) {
    //   return res.status(400).json({
    //     message:
    //       "Technician has overdue projects. Close them before assigning new projects.",
    //   });
    // }

    // Assign users to the project without specifying IDs
    await ProjectAssignment.bulkCreate(assignments);

    return res
      .status(200)
      .json({ message: "Technicians assigned to the project successfully" });
  } catch (error) {
    if (
      error.name === "SequelizeUniqueConstraintError" &&
      Array.isArray(error.errors) &&
      error.errors[0]?.type === "unique violation"
    ) {
      return res.status(400).json({
        message: "Technicians are already assigned to the project",
      });
    }

    console.error("Error assigning technicians to project:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Function to view all projects
const getAllProjects = async (req, res) => {
  // Pagination
  let page = parseInt(req.query.page);
  let per_page = parseInt(req.query.per_page || 10);
  const offset = page ? page * per_page : 0;

  try {
    // Check if the user is authenticated
    if (req.isAuthenticated()) {
      let projects;

      // If the user is an admin, fetch all projects
      if (req.user.isAdmin) {
        projects = await Project.findAll({
          // pagination
          limit: per_page,
          offset: offset,
          attributes: {
            exclude: ["projectId"],
          },
          include: [
            {
              model: User,
              as: "assignedTechnicians",
              attributes: ["id", "name", "email"],
              through: {
                model: ProjectAssignment,
                attributes: [],
              },
            },
            {
              model: Comment,
              as: "comments",
              attributes: ["userId", "text", "createdAt"],
              include: [
                {
                  model: User,
                  as: "user",
                  attributes: ["name", "email"],
                },
              ],
            },
          ],
        });
      } else {
        // If the user is not an admin, fetch projects assigned to the user
        projects = await Project.findAll({
          // pagination
          limit: per_page,
          offset: offset,
          attributes: {
            exclude: ["projectId"],
          },
          include: [
            {
              model: User,
              as: "assignedTechnicians",
              where: { id: req.user.id }, // Filter by the current user's id
              attributes: ["id", "name", "email"],
              through: {
                model: ProjectAssignment,
                attributes: [],
              },
            },
            {
              model: Comment,
              as: "comments",
              attributes: ["userId", "text", "createdAt"],
              include: [
                {
                  model: User,
                  as: "user",
                  attributes: ["name", "email"],
                },
              ],
            },
          ],
        });
      }

      return res.status(200).json({ projects });
    }

    // If the user is not authenticated, return an error
    return res
      .status(403)
      .json({ message: "Access forbidden. Authentication required." });
  } catch (error) {
    console.error("Error viewing all projects:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get project by ID
const getProjectById = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    // Fetch the project by its ID with its associated technicians and comments
    const project = await Project.findByPk(projectId, {
      attributes: {
        exclude: ["projectId"],
      },
      include: [
        {
          model: User,
          as: "assignedTechnicians",
          attributes: ["id", "name", "email"],
          through: {
            model: ProjectAssignment,
            attributes: [],
          },
        },
        {
          model: Comment,
          as: "comments",
          attributes: ["userId", "text", "createdAt"],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["name", "email"],
            },
          ],
        },
      ],
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if the user is an admin
    if (req.isAuthenticated() && req.user.isAdmin) {
      return res.status(200).json({ project });
    }

    // Check if the project is assigned to the non-admin user
    const isProjectAssignedToUser = project.assignedTechnicians.some(
      (technician) => technician.id === req.user.id
    );

    if (!isProjectAssignedToUser) {
      return res
        .status(403)
        .json({ message: "Access forbidden. Project not assigned to user." });
    }

    return res.status(200).json({ project });
  } catch (error) {
    console.error("Error getting project by ID:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const {
      name,
      description,
      startDate,
      dueDate,
      noteToClient,
      status,
      userIds,
    } = req.body;

    // Find the project
    const project = await Project.findByPk(projectId, {
      include: [
        {
          model: User,
          as: "assignedTechnicians",
          attributes: ["id", "email", "name"],
        },
      ],
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if any assigned technicians have open projects
    const assignedTechnicians = await User.findAll({
      where: {
        id: { [Op.in]: userIds },
        isAdmin: false,
      },
      include: [
        {
          model: Project,
          as: "assignedTechnicians", // Correct alias here
          attributes: ["id", "name", "status"],
          through: { attributes: [] }, // Exclude join table fields
          where: {
            status: "Open",
            id: { [Op.ne]: projectId },
          },
        },
      ],
    });

    if (assignedTechnicians.length > 0) {
      return res.status(400).json({
        message:
          "Technician has open projects. Close them before updating the assignment.",
      });
    }

    // Validate status
    const allowedStatusValues = [
      "Open",
      "In Progress",
      "Completed",
      "Closed",
      "Rejected",
    ];
    if (!allowedStatusValues.includes(status)) {
      return res.status(400).json({
        message:
          "Invalid status value. (Accepted values: Open, In Progress, Completed, Closed, or Rejected)",
      });
    }

    // Update project details
    await project.update({
      name,
      description,
      startDate,
      dueDate,
      noteToClient,
      status,
    });

    // Find users with the provided userIds
    const users = await User.findAll({
      where: {
        id: userIds,
        isAdmin: false,
      },
    });

    // Check if all provided userIds are valid
    if (users.length !== userIds.length) {
      return res.status(400).json({ message: "Invalid user ID(s)" });
    }

    // Update the assigned technicians for the project
    await project.setAssignedTechnicians(users);

    // Fetch the updated project with the associated technicians
    const updatedProject = await Project.findByPk(projectId, {
      include: {
        model: User,
        as: "assignedTechnicians",
        attributes: ["id", "email", "name"],
      },
      attributes: {
        exclude: ["projectId"],
      },
    });

    // Manually remove the ProjectAssignment field from the response
    const sanitizedProject = JSON.parse(JSON.stringify(updatedProject));
    sanitizedProject.assignedTechnicians.forEach((technician) => {
      delete technician.ProjectAssignment;
    });

    return res.status(200).json({
      message: "Project updated successfully",
      project: sanitizedProject,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update Project Status
const updateProjectStatus = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { status } = req.body;

    // Validate status
    const allowedStatusValuesAdmin = [
      "Open",
      "In Progress",
      "Completed",
      "Closed",
      "Rejected",
    ];

    const allowedStatusValuesNonAdmin = ["Open", "In Progress", "Completed"];

    const user = req.isAuthenticated() ? req.user : null;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const isAdmin = user.isAdmin;

    // Check if the user is assigned to the project (for non-admin users)
    if (!isAdmin) {
      const isAssigned = await ProjectAssignment.findOne({
        where: {
          projectId: projectId,
          userId: user.id,
        },
      });

      if (!isAssigned) {
        return res
          .status(403)
          .json({ message: "You are not assigned to this project" });
      }
    }

    if (isAdmin && allowedStatusValuesAdmin.includes(status)) {
      // Find the project
      const project = await Project.findByPk(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Update project status
      await project.update({ status });

      // Fetch the updated project
      const updatedProject = await Project.findByPk(projectId, {
        attributes: {
          exclude: ["id"],
        },
      });

      return res.status(200).json({
        message: "Project status updated successfully",
        project: {
          id: parseInt(projectId, 10), // Parse id to an integer
          ...updatedProject.toJSON(),
        },
      });
    } else if (!isAdmin && allowedStatusValuesNonAdmin.includes(status)) {
      // Find the project
      const project = await Project.findByPk(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Update project status
      await project.update({ status });

      // Fetch the updated project
      const updatedProject = await Project.findByPk(projectId, {
        attributes: {
          exclude: ["id"],
        },
      });

      return res.status(200).json({
        message: "Project status updated successfully",
        project: {
          id: parseInt(projectId, 10), // Parse id to an integer
          ...updatedProject.toJSON(),
        },
      });
    } else {
      return res.status(400).json({
        message: `Invalid status value for the user role. (Accepted values: ${
          isAdmin ? allowedStatusValuesAdmin : allowedStatusValuesNonAdmin
        })`,
      });
    }
  } catch (error) {
    console.error("Error updating project status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// SEARCH PROJECTS
const searchProjects = async (req, res) => {
  try {
    const {
      name,
      creationDate,
      dueDate,
      dateRangeStart,
      dateRangeEnd,
      status,
      findAllOverdue,
    } = req.query;

    const whereClause = {};

    if (name) {
      whereClause.name = {
        [Op.like]: `%${name}%`,
      };
    }

    if (creationDate) {
      whereClause.createdAt = {
        [Op.eq]: new Date(creationDate),
      };
    }

    if (dueDate) {
      whereClause.dueDate = {
        [Op.eq]: new Date(dueDate),
      };
    }

    if (dateRangeStart && dateRangeEnd) {
      whereClause.startDate = {
        [Op.between]: [new Date(dateRangeStart), new Date(dateRangeEnd)],
      };
    }

    if (status) {
      whereClause.status = status; // Use the provided status directly
    }

    const user = req.isAuthenticated() ? req.user : null;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const isAdmin = user.isAdmin;

    const includeArray = [
      {
        model: User,
        as: "assignedTechnicians",
        attributes: {
          exclude: ["password", "createdAt", "updatedAt"],
        },
        through: {
          model: ProjectAssignment,
          attributes: [],
          where: isAdmin ? {} : { userId: user.id },
        },
      },
      {
        model: Comment,
        as: "comments",
        attributes: ["userId", "text", "createdAt"],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["name", "email"],
          },
        ],
      },
    ];

    if (findAllOverdue) {
      whereClause.dueDate = {
        [Op.lt]: new Date(),
      };
    }

    const projects = await Project.findAll({
      where: isAdmin
        ? whereClause
        : { ...whereClause, "$assignedTechnicians.id$": user.id },
      include: includeArray,
      attributes: {
        exclude: ["projectId", "updatedAt"],
      },
    });

    if (projects.length === 0) {
      return res.status(404).json({ message: "No projects found" });
    }

    return res.status(200).json({ projects });
  } catch (error) {
    console.error("Error searching projects:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    // Check if the user is an admin (assuming you have the isAdmin middleware applied)
    if (!req.isAuthenticated() || req.user.isAdmin === false) {
      return res
        .status(403)
        .json({ message: "Access forbidden. Admin privileges required." });
    }

    // Check if the project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Delete the project
    await project.destroy();

    return res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Export all overdue projects of the last month
const exportOverdueProjects = async (req, res) => {
  try {
    const lastMonthStartDate = new Date();
    lastMonthStartDate.setMonth(lastMonthStartDate.getMonth() - 1);

    const projects = await Project.findAll({
      where: {
        dueDate: {
          [Op.lt]: new Date(), // Overdue projects
        },
        status: {
          [Op.in]: ["Open", "In Progress", "Completed", "Closed", "Rejected"],
        },
        createdAt: {
          [Op.gte]: lastMonthStartDate,
        },
      },
      attributes: { exclude: ["projectId"] }, // Exclude projectId from the response
      include: [
        {
          model: User,
          as: "assignedTechnicians",
          attributes: ["id", "name", "email"],
          through: {
            model: ProjectAssignment,
            attributes: [],
          },
        },
        {
          model: Comment, // Include comments
          as: "comments",
          attributes: ["userId", "text", "createdAt"],
        },
      ],
    });

    return res.status(200).json({ projects });
  } catch (error) {
    console.error("Error exporting overdue projects:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createProject,
  assignTechniciansToProject,
  getAllProjects,
  getProjectById,
  updateProject,
  updateProjectStatus,
  searchProjects,
  deleteProject,
  exportOverdueProjects,
};
