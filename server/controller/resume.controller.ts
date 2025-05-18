import ErrorHandler from "../utils/errorHandler";
import { catchAsyncError } from "../middleware/catchAsyncError";
import { NextFunction, Request, Response } from "express";
import cloudinary from "cloudinary";
import dotenv from "dotenv";
import Resume, { IResume } from "../model/Resume.model";
dotenv.config();

interface ResumeRequestBody {
  title: string;
  profileImage?: string; // Base64 image data (optional)
}

// @desc    Create a new resume
// @route   POST /api/v1/resumes
// @access  Private
export const createResume = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, profileImage } = req.body as ResumeRequestBody;

      // Default template and data structure
      const defaultResumeData: Partial<IResume> = {
        profileInfo: {
          profilePreviewUrl: "",
          fullName: "",
          designation: "",
          summary: "",
        },
        contactInfo: {
          email: "",
          phone: "",
          location: "",
          linkedin: "",
          github: "",
          website: "",
        },
        workExperience: [
          {
            company: "",
            role: "",
            startDate: "",
            endDate: "",
            description: "",
          },
        ],
        education: [
          {
            degree: "",
            institution: "",
            startDate: "",
            endDate: "",
          },
        ],
        skills: [
          {
            name: "",
            progress: 0,
          },
        ],
        projects: [
          {
            title: "",
            description: "",
            github: "",
            liveDemo: "",
          },
        ],
        certifications: [
          {
            title: "",
            issuer: "",
            year: "",
          },
        ],
        languages: [
          {
            name: "",
            progress: 0,
          },
        ],
        interests: [""],
      };

      // Handle profile image upload if provided
      if (profileImage) {
        try {
          // Upload image to cloudinary
          const result = await cloudinary.v2.uploader.upload(profileImage, {
            folder: "resume_profile_images",
            width: 300,
            crop: "scale",
          });

          // Add cloudinary image data to profile info
          if (defaultResumeData.profileInfo) {
            defaultResumeData.profileInfo.profilePreviewUrl = result.secure_url;
          }
        } catch (uploadError: any) {
          return next(
            new ErrorHandler(`Image upload failed: ${uploadError.message}`, 400)
          );
        }
      }

      // Create resume with user data and default template
      const newResume = await Resume.create({
        userId: req.user._id,
        title,
        ...defaultResumeData,
      });

      res.status(201).json({
        success: true,
        newResume,
        message: "Resume created successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// @desc    Update resume profile image
// @route   PUT /api/v1/update-resume-image/:id
// @access  Private
export const updateResumeProfileImage = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { profileImage } = req.body;

      // Find resume and verify ownership
      const resume = await Resume.findById(id);

      if (!resume) {
        return next(new ErrorHandler("Resume not found", 404));
      }

      if (resume.userId.toString() !== req.user._id.toString()) {
        return next(
          new ErrorHandler("You are not authorized to update this resume", 403)
        );
      }

      // Handle image update
      if (profileImage) {
        // If there's an existing image, delete it from cloudinary
        if (resume.profileInfo?.profilePreviewUrl) {
          const publicId = resume.profileInfo.profilePreviewUrl
            .split("/")
            .pop()
            ?.split(".")[0];

          if (publicId) {
            await cloudinary.v2.uploader.destroy(
              `resume_profile_images/${publicId}`
            );
          }
        }

        // Upload new image
        const result = await cloudinary.v2.uploader.upload(profileImage, {
          folder: "resume_profile_images",
          width: 300,
          crop: "scale",
        });

        // Update resume with new image URL
        if (!resume.profileInfo) {
          resume.profileInfo = {};
        }
        resume.profileInfo.profilePreviewUrl = result.secure_url;

        await resume.save();

        return res.status(200).json({
          success: true,
          profileImageUrl: result.secure_url,
          message: "Profile image updated successfully",
        });
      } else {
        return next(new ErrorHandler("No image provided", 400));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// @desc    Get all resumes for logged-in user
// @route   GET /api/v1/resumes
// @access  Private
export const getUserResumes = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resumes = await Resume.find({ userId: req.user._id }).sort({
        updatedAt: -1,
      });
      res.status(200).json({
        success: true,
        resumes,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// @desc    Get single resume by ID
// @route   GET /api/v1/resume/:id
// @access  Private
export const getResumeById = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resume = await Resume.findOne({
        _id: req.params.id,
        userId: req.user._id,
      });

      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }

      res.status(200).json({
        success: true,
        resume,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// @desc    Update a resume
// @route   PUT /api/v1/update-resume/:id
// @access  Private
export const updateResume = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resume = await Resume.findOne({
        _id: req.params.id,
        userId: req.user._id,
      });

      if (!resume) {
        return res
          .status(404)
          .json({ message: "Resume not found or unauthorized" });
      }

      // Merge updates from req.body into existing resume
      Object.assign(resume, req.body);

      // Save updated resume
      const savedResume = await resume.save();

      res.status(200).json({
        success: true,
        savedResume,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// @desc    Delete a resume
// @route   DELETE /api/v1/resume/:id
// @access  Private
export const deleteResume = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Find the resume by ID and user ID to ensure authorization
      const resume = await Resume.findOne({
        _id: req.params.id,
        userId: req.user._id,
      });

      if (!resume) {
        return res
          .status(404)
          .json({
            success: false,
            message: "Resume not found or unauthorized",
          });
      }

      // Extract the profile image URL if it exists
      const profileImageUrl = resume.profileInfo?.profilePreviewUrl;

      // Delete the resume from the database
      await Resume.findByIdAndDelete(req.params.id);

      // If a profile image exists, delete it from Cloudinary
      if (profileImageUrl && profileImageUrl.includes("cloudinary")) {
        try {
          // Extract the public_id from the Cloudinary URL
          // Cloudinary URLs typically have format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder_name/image_id
          const splitUrl = profileImageUrl.split("/");
          const publicIdWithExtension = splitUrl[splitUrl.length - 1];
          const publicIdParts = publicIdWithExtension.split(".");
          const folderName = splitUrl[splitUrl.length - 2];

          // Combine folder name and file name to get the complete public_id
          const publicId = `${folderName}/${publicIdParts[0]}`;

          // Delete the image from Cloudinary
          await cloudinary.v2.uploader.destroy(publicId);
        } catch (cloudinaryError: any) {
          // Log the error but don't stop the process
          console.error(
            "Error deleting image from Cloudinary:",
            cloudinaryError
          );
        }
      }

      res.status(200).json({
        success: true,
        message: "Resume deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
