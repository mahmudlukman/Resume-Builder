import mongoose, { Document, Model, Schema } from "mongoose";

// Define interfaces for nested objects
interface Template {
  theme?: string;
  colorPalette?: string[];
}

interface ProfileInfo {
  profilePreviewUrl?: string;
  fullName?: string;
  designation?: string;
  summary?: string;
}

interface ContactInfo {
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

interface WorkExperience {
  company?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

interface Education {
  degree?: string;
  institution?: string;
  startDate?: string;
  endDate?: string;
}

interface Skill {
  name?: string;
  progress?: number;
}

interface Project {
  title?: string;
  description?: string;
  github?: string;
  liveDemo?: string;
}

interface Certification {
  title?: string;
  issuer?: string;
  year?: string;
}

interface Language {
  name?: string;
  progress?: number;
}

// Main Resume interface
export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  thumbnailLink?: string;
  template?: Template;
  profileInfo?: ProfileInfo;
  contactInfo?: ContactInfo;
  workExperience?: WorkExperience[];
  education?: Education[];
  skills?: Skill[];
  projects?: Project[];
  certifications?: Certification[];
  languages?: Language[];
  interests?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    thumbnailLink: {
      type: String,
    },
    template: {
      theme: String,
      colorPalette: [String],
    },
    profileInfo: {
      profilePreviewUrl: String,
      fullName: String,
      designation: String,
      summary: String,
    },
    contactInfo: {
      email: String,
      phone: String,
      location: String,
      linkedin: String,
      github: String,
      website: String,
    },
    workExperience: [
      {
        company: String,
        role: String,
        startDate: String,
        endDate: String,
        description: String,
      },
    ],
    education: [
      {
        degree: String,
        institution: String,
        startDate: String,
        endDate: String,
      },
    ],
    skills: [
      {
        name: String,
        progress: Number,
      },
    ],
    projects: [
      {
        title: String,
        description: String,
        github: String,
        liveDemo: String,
      },
    ],
    certifications: [
      {
        title: String,
        issuer: String,
        year: String,
      },
    ],
    languages: [
      {
        name: String,
        progress: Number,
      },
    ],
    interests: [String],
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const Resume: Model<IResume> = mongoose.model("Resume", ResumeSchema);
export default Resume;
