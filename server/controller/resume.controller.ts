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
// @route   POST /api/resumes
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
          return next(new ErrorHandler(`Image upload failed: ${uploadError.message}`, 400));
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
        message: "Resume created successfully"
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// @desc    Update resume profile image
// @route   PUT /api/resumes/:id/profile-image
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
        return next(new ErrorHandler("You are not authorized to update this resume", 403));
      }

      // Handle image update
      if (profileImage) {
        // If there's an existing image, delete it from cloudinary
        if (resume.profileInfo?.profilePreviewUrl) {
          const publicId = resume.profileInfo.profilePreviewUrl
            .split('/')
            .pop()
            ?.split('.')[0];
            
          if (publicId) {
            await cloudinary.v2.uploader.destroy(`resume_profile_images/${publicId}`);
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
          message: "Profile image updated successfully"
        });
      } else {
        return next(new ErrorHandler("No image provided", 400));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);