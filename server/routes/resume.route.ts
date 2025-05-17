import express from "express";
import { createResume } from "../controller/resume.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
const resumeRouter = express.Router();

resumeRouter.post("/create-resume", isAuthenticated, createResume);


export default resumeRouter;
