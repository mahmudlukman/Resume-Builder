export interface RootState {
  auth: {
    user: {
      _id: string;
      name: string;
      email: string;
      avatar: {
        public_id: string;
        url: string;
      };
    } | null;
  };
}

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
interface ResumeData {
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
