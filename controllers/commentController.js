// Controllers for comment operations

const { Comment, User, Project, ProjectAssignment } = require("../models"); // Adjust the path as needed
const passport = require("passport");

const postComment = async (req, res) => {
  try {
    // Add passport authentication middleware
    passport.authenticate("jwt", { session: false }, async (err, user) => {
      if (err || !user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { text, projectId } = req.body;

      // Check if the user and project exist
      const project = await Project.findByPk(projectId);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check if the user is an admin or assigned to the project
      if (user.isAdmin || (await isUserAssignedToProject(user.id, projectId))) {
        // Create a new comment
        const comment = await Comment.create({
          userId: user.id, // Use the authenticated user's ID
          text,
          projectId,
        });

        return res
          .status(201)
          .json({ message: "Comment posted successfully", comment });
      } else {
        return res
          .status(403)
          .json({ message: "Forbidden: User not assigned to project" });
      }
    })(req, res); // Invoke passport middleware
  } catch (error) {
    console.error("Error posting comment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Helper function to check if the user is assigned to the project
const isUserAssignedToProject = async (userId, projectId) => {
  const assignment = await ProjectAssignment.findOne({
    where: { userId, projectId },
  });

  return !!assignment;
};

module.exports = { postComment };
