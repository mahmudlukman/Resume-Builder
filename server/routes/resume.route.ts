import express from "express";
import { createResume, deleteResume, getResumeById, getUserResumes, updateResume, updateResumeProfileImage } from "../controller/resume.controller";
import { isAuthenticated } from "../middleware/auth";
const resumeRouter = express.Router();

resumeRouter.post("/create-resume", isAuthenticated, createResume);
resumeRouter.put("/update-resume-image/:id", isAuthenticated, updateResumeProfileImage);
resumeRouter.get("/resumes", isAuthenticated, getUserResumes);
resumeRouter.get("/resume/:id", isAuthenticated, getResumeById);
resumeRouter.put("/update-resume/:id", isAuthenticated, updateResume);
resumeRouter.delete("/delete-resume/:id", isAuthenticated, deleteResume);


export default resumeRouter;
