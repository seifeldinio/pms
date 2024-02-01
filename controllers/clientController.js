// Controllers for client-related operations
const { Project, Client } = require("../models");

// View project by sharedLinkToken
const getProjectBysharedLinkToken = async (req, res) => {
  try {
    const sharedLinkToken = req.params.sharedLinkToken;

    // Validate link or token and retrieve the project
    const project = await Project.findOne({
      where: { sharedLinkToken: sharedLinkToken },
      attributes: [
        "name",
        "description",
        "startDate",
        "status",
        "noteToClient",
      ],
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Return the specific project details
    return res.status(200).json({
      message: "Project details retrieved successfully",
      project: project,
    });
  } catch (error) {
    console.error("Error viewing project:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Create client
const createClient = async (req, res) => {
  try {
    // Extract necessary information from the request body
    const { email, name } = req.body;

    // Create the new client
    const newClient = await Client.create({
      email,
      name,
    });

    // Exclude sensitive information from the response
    const sanitizedClient = {
      id: newClient.id,
      email: newClient.email,
      name: newClient.name,
    };

    return res.status(201).json({
      message: "Client created successfully",
      client: sanitizedClient,
    });
  } catch (error) {
    // Check if the error is a SequelizeUniqueConstraintError
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        message:
          "Email address is already in use. Please choose a different email.",
      });
    }

    // Handle other errors
    console.error("Error creating client:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get all clients
const getAllClients = async (req, res) => {
  // Pagination
  let page = parseInt(req.query.page);
  let per_page = parseInt(req.query.per_page || 10);
  const offset = page ? page * per_page : 0;

  try {
    const clients = await Client.findAll({
      // pagination
      limit: per_page,
      offset: offset,
      attributes: {
        exclude: ["updatedAt"],
      },
    });

    return res.status(200).json({
      message: "Clients retrieved successfully",
      clients,
    });
  } catch (error) {
    console.error("Error getting clients:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get client by email
const getClientByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    // Find the client by email
    const client = await Client.findOne({
      where: { email },
    });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Exclude sensitive information from the response
    const sanitizedClient = {
      id: client.id,
      email: client.email,
      name: client.name,
    };

    return res.status(200).json({
      client: sanitizedClient,
    });
  } catch (error) {
    console.error("Error getting client by email:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update client
const updateClient = async (req, res) => {
  try {
    const { currentEmail } = req.params;
    const { email, name } = req.body;

    // Find the client by current email
    const client = await Client.findOne({
      where: { email: currentEmail },
    });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Update the client's email and name
    client.email = email;
    client.name = name;
    await client.save();

    // Exclude sensitive information from the response
    const sanitizedClient = {
      id: client.id,
      email: client.email,
      name: client.name,
    };

    return res.status(200).json({
      message: "Client updated successfully",
      client: sanitizedClient,
    });
  } catch (error) {
    console.error("Error updating client:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete client
const deleteClient = async (req, res) => {
  try {
    const email = req.params.email;

    // Check if email is provided
    if (!email) {
      return res
        .status(400)
        .json({ message: "Email is required for deletion" });
    }

    // Delete the client
    const deletedRowCount = await Client.destroy({
      where: { email }, // condition to identify the client by email
    });

    // Check if the client was found and deleted
    if (deletedRowCount === 0) {
      return res.status(404).json({ message: "Client not found" });
    }

    return res.status(200).json({
      message: "Client deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting client:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getProjectBysharedLinkToken,
  createClient,
  getAllClients,
  getClientByEmail,
  updateClient,
  deleteClient,
};
