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

// @desc    Update resume profile image and thumbnail
// @route   PUT /api/v1/update-resume-image/:id
// @access  Private
export const updateResumeProfileImage = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

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

      // Get profileImage and thumbnail from req.body (base64 strings, optional)
      const { profileImage, thumbnail } = req.body || {};

      // Initialize response object
      const response: { thumbnailLink?: string; profilePreviewUrl?: string } = {};

      // Handle profile image upload (optional)
      if (profileImage) {
        // Delete existing profile image from Cloudinary if it exists
        if (resume.profileInfo?.profilePreviewUrl) {
          const publicId = resume.profileInfo.profilePreviewUrl
            .split("/")
            .pop()
            ?.split(".")[0];
          if (publicId) {
            try {
              await cloudinary.v2.uploader.destroy(`resume_profile_images/${publicId}`);
            } catch (error: any) {
              console.error("Error deleting profile image from Cloudinary:", error);
            }
          }
        }

        // Upload new profile image to Cloudinary
        const profileImageResult = await cloudinary.v2.uploader.upload(profileImage, {
          folder: "resume_profile_images",
          width: 300,
          crop: "scale",
        });

        // Update profile image URL
        if (!resume.profileInfo) {
          resume.profileInfo = {};
        }
        resume.profileInfo.profilePreviewUrl = profileImageResult.secure_url;
        response.profilePreviewUrl = profileImageResult.secure_url;
      }

      // Handle thumbnail upload (optional)
      if (thumbnail) {
        // Delete existing thumbnail from Cloudinary if it exists
        if (resume.thumbnailLink) {
          const publicId = resume.thumbnailLink.split("/").pop()?.split(".")[0];
          if (publicId) {
            try {
              await cloudinary.v2.uploader.destroy(`resume_thumbnails/${publicId}`);
            } catch (error: any) {
              console.error("Error deleting thumbnail from Cloudinary:", error);
            }
          }
        }

        // Upload new thumbnail to Cloudinary
        const thumbnailResult = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "resume_thumbnails",
          width: 800,
          crop: "scale",
        });

        // Update thumbnail URL
        resume.thumbnailLink = thumbnailResult.secure_url;
        response.thumbnailLink = thumbnailResult.secure_url;
      }

      // Save updated resume (even if no images were provided)
      await resume.save();

      return res.status(200).json({
        success: true,
        ...response,
        message: "Resume images updated successfully",
      });
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
      const { id } = req.params;

      // Find resume and verify ownership
      const resume = await Resume.findOne({
        _id: id,
        userId: req.user._id,
      });

      if (!resume) {
        return res
          .status(404)
          .json({ message: "Resume not found or unauthorized" });
      }

      // Update resume with new data
      const updatedData = req.body;

      // Explicitly update each field to ensure nested objects and arrays are handled correctly
      resume.title = updatedData.title || resume.title;
      resume.profileInfo = updatedData.profileInfo || resume.profileInfo;
      resume.contactInfo = updatedData.contactInfo || resume.contactInfo;
      resume.workExperience = updatedData.workExperience || resume.workExperience;
      resume.education = updatedData.education || resume.education;
      resume.skills = updatedData.skills || resume.skills;
      resume.projects = updatedData.projects || resume.projects;
      resume.certifications = updatedData.certifications || resume.certifications;
      resume.languages = updatedData.languages || resume.languages;
      resume.interests = updatedData.interests || resume.interests;
      resume.template = updatedData.template || resume.template;
      resume.thumbnailLink = updatedData.thumbnailLink || resume.thumbnailLink;

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
