const supertest = require("supertest");
const { app, sequelize, server } = require("../app");
const { Project } = require("../models");
const scheduler = require("../services/scheduler");
const { setupDatabase } = require("./testSetup");

const request = supertest(app);

let adminUser;
let technician1;
let technician2;
let technician3;

describe("API Endpoints Testing", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    const users = await setupDatabase();
    adminUser = users.adminUser;
    technician1 = users.technician1;
    technician2 = users.technician2;
    technician3 = users.technician3;
  });

  afterAll(async () => {
    const cronJob = await scheduler.getCronJob();
    cronJob.stop();
    server.close();
    await sequelize.close();
  });

  describe("POST /api/v1/projects", () => {
    it("should create a new project", async () => {
      const response = await request
        .post("/api/v1/projects")
        .set("Authorization", `Bearer ${adminUser.generateToken()}`)
        .send({
          name: "Sample Project",
          description: "This is a sample project.",
          startDate: "2024-01-31",
          dueDate: "2024-03-01",
          noteToClient: "Please review the project details.",
          clientEmail: "seif@bloxat.com",
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toContain("Project created successfully");
      expect(response.body).toHaveProperty("project");
    });

    it("should return 400 if client email format is invalid", async () => {
      const response = await request
        .post("/api/v1/projects")
        .set("Authorization", `Bearer ${adminUser.generateToken()}`)
        .send({
          name: "Sample Project",
          description: "This is a sample project.",
          startDate: "2024-01-31",
          dueDate: "2024-03-01",
          noteToClient: "Please review the project details.",
          clientEmail: "invalid-email-format",
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Validation error. Please check your input."
      );
    });

    // Additional test cases for createProject endpoint - Error Handling
    it("should return 400 if date format is invalid", async () => {
      const response = await request
        .post("/api/v1/projects")
        .set("Authorization", `Bearer ${adminUser.generateToken()}`)
        .send({
          name: "Sample Project",
          description: "This is a sample project.",
          startDate: "2024-29-31",
          dueDate: "2024-03-01",
          noteToClient: "Please review the project details.",
          clientEmail: "seif@bloxat.com",
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Invalid date format.");
    });

    it("should return 403 if user is not an admin", async () => {
      const response = await request
        .post("/api/v1/projects")
        .set("Authorization", `Bearer ${technician1.generateToken()}`)
        .send({
          name: "Sample Project",
          description: "This is a sample project.",
          startDate: "2024-31-01",
          dueDate: "2024-03-01",
          noteToClient: "Please review the project details.",
          clientEmail: "seif@bloxat.com",
        });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty(
        "message",
        "Access forbidden. Admin privileges required."
      );
    });

    it("should return 400 if request payload is missing required fields", async () => {
      const response = await request
        .post("/api/v1/projects")
        .set("Authorization", `Bearer ${adminUser.generateToken()}`)
        .send({
          description: "This is a sample project.",
          startDate: "2024-31-01",
          dueDate: "2024-03-01",
          noteToClient: "Please review the project details.",
          clientEmail: "seif@bloxat.com",
        });

      expect(response.status).toBe(400);
    });

    it("should return 401 if user is not authenticated", async () => {
      const response = await request.post("/api/v1/projects").send({
        name: "Sample Project",
        description: "This is a sample project.",
        startDate: "2024-31-01",
        dueDate: "2024-03-01",
        noteToClient: "Please review the project details.",
        clientEmail: "seif@bloxat.com",
      });

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/v1/projects/:projectId/assign", () => {
    it("should assign technicians to a project", async () => {
      // Create a project and some users for testing
      const project = await Project.create({
        name: "Sample Project",
        description: "This is a sample project.",
        startDate: "2024-01-31",
        dueDate: "2024-03-01",
        noteToClient: "Please review the project details.",
        clientEmail: "seif@bloxat.com",
      });

      const response = await request
        .post(`/api/v1/projects/${project.id}/assign`)
        .set("Authorization", `Bearer ${adminUser.generateToken()}`)
        .send({
          userIds: [technician1.id, technician2.id],
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain(
        "Technicians assigned to the project successfully"
      );
    });

    // Additional test cases for assignTechniciansToProject endpoint - Negative Testing
    it("should return 404 if project does not exist", async () => {
      const nonExistentProjectId = 123456; // Assuming this ID does not exist

      const response = await request
        .post(`/api/v1/projects/${nonExistentProjectId}/assign`)
        .set("Authorization", `Bearer ${adminUser.generateToken()}`)
        .send({
          userIds: [technician1.id, technician2.id],
        });

      expect(response.status).toBe(404);
    });

    it("should return 403 if user does not have permission to assign technicians", async () => {
      const project = await Project.create({
        name: "Sample Project",
        description: "This is a sample project.",
        startDate: "2024-01-31",
        dueDate: "2024-03-01",
        noteToClient: "Please review the project details.",
        clientEmail: "seif@bloxat.com",
      });

      const response = await request
        .post(`/api/v1/projects/${project.id}/assign`)
        .set("Authorization", `Bearer ${technician3.generateToken()}`)
        .send({
          userIds: [technician1.id, technician2.id],
        });

      expect(response.status).toBe(403);
    });
  });

  describe("GET /api/v1/projects", () => {
    it("should retrieve all projects for an admin user", async () => {
      const response = await request
        .get("/api/v1/projects")
        .set("Authorization", `Bearer ${adminUser.generateToken()}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("projects");
    });

    it("should retrieve projects assigned to a non-admin user", async () => {
      const response = await request
        .get("/api/v1/projects")
        .set("Authorization", `Bearer ${technician1.generateToken()}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("projects");
    });
  });

  describe("GET /api/v1/projects/:projectId", () => {
    it("should retrieve a project by ID for an admin user", async () => {
      const project = await Project.create({
        name: "Sample Project",
        description: "This is a sample project.",
        startDate: "2024-01-31",
        dueDate: "2024-03-01",
        noteToClient: "Please review the project details.",
        clientEmail: "seif@bloxat.com",
      });

      const response = await request
        .get(`/api/v1/projects/${project.id}`)
        .set("Authorization", `Bearer ${adminUser.generateToken()}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("project");
    });

    it("should retrieve a project by ID assigned to a non-admin user", async () => {
      const project = await Project.create({
        name: "Sample Project",
        description: "This is a sample project.",
        startDate: "2024-01-31",
        dueDate: "2024-03-01",
        noteToClient: "Please review the project details.",
        clientEmail: "seif@bloxat.com",
      });

      // Assign the project to the non-admin user
      // You should use your application's logic for assigning projects to users
      const assignResponse = await request
        .post(`/api/v1/projects/${project.id}/assign`)
        .set("Authorization", `Bearer ${adminUser.generateToken()}`)
        .send({
          userIds: [technician3.id],
        });

      expect(assignResponse.status).toBe(200);
      expect(assignResponse.body.message).toContain(
        "Technicians assigned to the project successfully"
      );

      // Get the project as a technician assigned to the project
      const response = await request
        .get(`/api/v1/projects/${project.id}`)
        .set("Authorization", `Bearer ${technician3.generateToken()}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("project");
    });

    it("should return a 404 status for a project not found", async () => {
      const nonExistentProjectId = 123456; // Assuming this ID does not exist

      const response = await request
        .get(`/api/v1/projects/${nonExistentProjectId}`)
        .set("Authorization", `Bearer ${adminUser.generateToken()}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Project not found");
    });
  });
});
