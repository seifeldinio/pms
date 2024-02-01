// Controllers for technician-related operations
const { Op } = require("sequelize");
const { User, Project } = require("../models");

// Create a new technician user
const createTechnician = async (req, res) => {
  try {
    // Extract necessary information from the request body
    const { email, password, name } = req.body;

    // Check if the email is already in use
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    // Create the new user (isAdmin: false by default)
    const newTechnician = await User.create({
      email,
      password,
      name,
    });

    // Exclude sensitive information from the response
    const sanitizedUser = {
      id: newTechnician.id,
      email: newTechnician.email,
      name: newTechnician.name,
      isAdmin: newTechnician.isAdmin,
    };

    return res.status(201).json({
      message: "Technician created successfully",
      user: sanitizedUser,
    });
  } catch (error) {
    console.error("Error creating technician:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get all technicians
const getAllTechnicians = async (req, res) => {
  // Pagination
  let page = parseInt(req.query.page);
  let per_page = parseInt(req.query.per_page || 10);
  const offset = page ? page * per_page : 0;

  try {
    const technicians = await User.findAll({
      // pagination
      limit: per_page,
      offset: offset,
      where: { isAdmin: false }, // Exclude admins
      attributes: ["id", "email", "name"],
    });

    return res.status(200).json({
      message: "Technicians retrieved successfully",
      technicians,
    });
  } catch (error) {
    console.error("Error getting technicians:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get a single technician by ID
const getTechnicianById = async (req, res) => {
  try {
    const technicianId = req.params.technicianId;

    const technician = await User.findByPk(technicianId, {
      attributes: ["id", "email", "name"],
      include: [
        {
          model: Project,
          as: "assignedTechnicians",
          attributes: ["id", "name", "status"],
          through: { attributes: [] },
        },
      ],
    });

    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }

    // Rename "assignedTechnicians" to "projects" in the response
    const modifiedTechnician = {
      ...technician.toJSON(),
      projects: technician.assignedTechnicians,
    };

    delete modifiedTechnician.assignedTechnicians;

    return res.status(200).json({
      message: "Technician retrieved successfully",
      technician: modifiedTechnician,
    });
  } catch (error) {
    console.error("Error getting technician:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update a technician by ID
const updateTechnician = async (req, res) => {
  try {
    const technicianId = req.params.technicianId;
    const { email, password, name } = req.body;

    // Find the technician
    const technician = await User.findByPk(technicianId);

    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }

    // Update technician details
    technician.email = email || technician.email;
    technician.name = name || technician.name;

    // Update password if provided
    if (password) {
      technician.password = password;
    }

    // Save the changes, triggering the beforeSave hook for password hashing
    await technician.save();

    // Exclude sensitive information from the response
    const sanitizedTechnician = {
      id: technician.id,
      email: technician.email,
      name: technician.name,
      isAdmin: technician.isAdmin,
    };

    return res.status(200).json({
      message: "Technician updated successfully",
      technician: sanitizedTechnician,
    });
  } catch (error) {
    console.error("Error updating technician:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      const duplicateField = error.errors[0].path;

      if (duplicateField === "email") {
        return res.status(400).json({ message: "Email is already in use" });
      }
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete technician
const deleteTechnician = async (req, res) => {
  try {
    const technicianId = req.params.technicianId;

    // Find the technician
    const technician = await User.findByPk(technicianId);

    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }

    // Delete the technician
    await technician.destroy();

    return res.status(200).json({ message: "Technician deleted successfully" });
  } catch (error) {
    console.error("Error deleting technician:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//  Filter Technicians with overdue projects.
const getTechniciansWithOverdueProjects = async (req, res) => {
  // Pagination
  let page = parseInt(req.query.page);
  let per_page = parseInt(req.query.per_page || 10);
  const offset = page ? page * per_page : 0;

  try {
    const techniciansWithOverdueProjects = await User.findAll({
      // pagination
      limit: per_page,
      offset: offset,
      where: {
        isAdmin: false,
      },
      include: [
        {
          model: Project,
          as: "assignedTechnicians", // alias
          attributes: ["id", "name", "status"],
          through: { attributes: [] },
          where: {
            dueDate: { [Op.lt]: new Date() },
            status: { [Op.ne]: "Closed" },
          },
        },
      ],
      attributes: {
        exclude: ["password", "userId", "isAdmin", "updatedAt"],
      },
    });

    // Rename "assignedTechnicians" to "projects" in the response
    const modifiedResponse = techniciansWithOverdueProjects.map(
      (technician) => {
        const { assignedTechnicians, ...rest } = technician.toJSON();
        return {
          ...rest,
          projects: assignedTechnicians,
        };
      }
    );

    return res.status(200).json({
      message: "Technicians with overdue projects retrieved successfully",
      technicians: modifiedResponse,
    });
  } catch (error) {
    console.error("Error retrieving technicians with overdue projects:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createTechnician,
  getAllTechnicians,
  getTechnicianById,
  updateTechnician,
  deleteTechnician,
  getTechniciansWithOverdueProjects,
};
