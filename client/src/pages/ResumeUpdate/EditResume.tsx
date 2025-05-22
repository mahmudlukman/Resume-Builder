import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  LuArrowLeft,
  LuCircleAlert,
  LuDownload,
  LuPalette,
  LuSave,
  LuTrash2,
} from "react-icons/lu";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import TitleInput from "../../components/Inputs/TitleInput";
import { useReactToPrint } from "react-to-print";
import StepProgress from "../../components/StepProgress";
import ProfileInfoForm from "./Forms/ProfileInfoForm";
import ContactInfoForm from "./Forms/ContactInfoForm";
import WorkExperienceForm from "./Forms/WorkExperienceForm";
import EducationDetailsForm from "./Forms/EducationDetailsForm";
import SkillsInfoForm from "./Forms/SkillsInfoForm";
import ProjectsDetailFrom from "./Forms/ProjectsDetailForm";
import CertificationInfoForm from "./Forms/CertificationInfoForm";
import AdditionalInfoForm from "./Forms/AdditionalInfoForm";
import RenderResume from "../../components/ResumeTemplates/RenderResume";
import { captureElementAsImage, fixTailwindColors } from "../../utils/helper";
import ThemeSelector from "./ThemeSelector";
import Modal from "../../components/Modal";
import {
  useGetResumeQuery,
  useUpdateResumeMutation,
  useUpdateResumeImageMutation,
  useDeleteResumeMutation,
} from "../../redux/features/resume/resumeApi";

const EditResume = () => {
  const { resumeId } = useParams();
  const navigate = useNavigate();

  const resumeRef = useRef<HTMLDivElement | null>(null);
  const resumeDownloadRef = useRef(null);

  const [baseWidth, setBaseWidth] = useState(800);
  const [openThemeSelector, setOpenThemeSelector] = useState(false);
  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [currentPage, setCurrentPage] = useState("profile-info");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  // RTK Query hooks
  const { data: resumeDetails, isLoading: isLoadingResume } = useGetResumeQuery(
    { id: resumeId }
  );
  const [updateResume, { isLoading: isUpdatingResume }] =
    useUpdateResumeMutation();
  const [updateResumeImage, { isLoading: isUpdatingImage }] =
    useUpdateResumeImageMutation();
  const [deleteResume, { isLoading: isDeleting }] = useDeleteResumeMutation();

  const isLoading = isUpdatingResume || isUpdatingImage || isDeleting;

  const [resumeData, setResumeData] = useState({
    _id: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    title: "",
    thumbnailLink: "",
    profileInfo: {
      profileImg: undefined,
      profilePreviewUrl: "",
      fullName: "",
      designation: "",
      summary: "",
    },
    template: {
      theme: "",
      colorPalette: [] as string[],
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
        startDate: "", // e.g. "2022-01"
        endDate: "", // e.g. "2023-12"
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
        progress: 0, // percentage value (0-100)
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
        progress: 0, // percentage value (0-100)
      },
    ],
    interests: [""],
  });

  // Validate Inputs
  const validateAndNext = () => {
    const errors = [];

    switch (currentPage) {
      case "profile-info": {
        const { fullName, designation, summary } = resumeData.profileInfo;
        if (!fullName.trim()) errors.push("Full Name is required");
        if (!designation.trim()) errors.push("Designation is required");
        if (!summary.trim()) errors.push("Summary is required");
        break;
      }

      case "contact-info": {
        const { email, phone } = resumeData.contactInfo;
        if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email))
          errors.push("Valid email is required.");
        if (!phone.trim())
          errors.push("Valid 10-digit phone number is required");
        break;
      }

      case "work-experience":
        resumeData.workExperience.forEach(
          ({ company, role, startDate, endDate }, index) => {
            if (!company.trim())
              errors.push(`Company is required in experience ${index + 1}`);
            if (!role.trim())
              errors.push(`Role is required in experience ${index + 1}`);
            if (!startDate || !endDate)
              errors.push(
                `Start and End dates are required in experience ${index + 1}`
              );
          }
        );
        break;

      case "education-info":
        resumeData.education.forEach(
          ({ degree, institution, startDate, endDate }, index) => {
            if (!degree.trim())
              errors.push(`Degree is required in education ${index + 1}`);
            if (!institution.trim())
              errors.push(`Institution is required in education ${index + 1}`);
            if (!startDate || !endDate)
              errors.push(
                `Start and End dates are required in education ${index + 1}`
              );
          }
        );
        break;

      case "skills":
        resumeData.skills.forEach(({ name, progress }, index) => {
          if (!name.trim())
            errors.push(`Skill name is required in skill ${index + 1}`);
          if (progress < 1 || progress > 100)
            errors.push(
              `Skill progress must be between 1 and 100 in skill ${index + 1}`
            );
        });
        break;

      case "projects":
        resumeData.projects.forEach(({ title, description }, index) => {
          if (!title.trim())
            errors.push(`Project title is required in project ${index + 1}`);
          if (!description.trim())
            errors.push(
              `Project description is required in project ${index + 1}`
            );
        });
        break;

      case "certifications":
        resumeData.certifications.forEach(({ title, issuer }, index) => {
          if (!title.trim())
            errors.push(
              `Certification title is required in certification ${index + 1}`
            );
          if (!issuer.trim())
            errors.push(`Issuer is required in certification ${index + 1}`);
        });
        break;

      case "additionalInfo":
        if (
          resumeData.languages.length === 0 ||
          !resumeData.languages[0].name?.trim()
        ) {
          errors.push("At least one language is required");
        }

        if (
          resumeData.interests.length === 0 ||
          !resumeData.interests[0]?.trim()
        ) {
          errors.push("At least one interest is required");
        }
        break;

      default:
        break;
    }

    if (errors.length > 0) {
      setErrorMsg(errors.join(", "));
      return;
    }

    // Move to next step
    setErrorMsg("");
    goToNextStep();
  };

  // Function to navigate to the next page
  const goToNextStep = () => {
    const pages = [
      "profile-info",
      "contact-info",
      "work-experience",
      "education-info",
      "skills",
      "projects",
      "certifications",
      "additionalInfo",
    ];

    if (currentPage === "additionalInfo") setOpenPreviewModal(true);

    const currentIndex = pages.indexOf(currentPage);
    if (currentIndex !== -1 && currentIndex < pages.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentPage(pages[nextIndex]);

      // Set progress as percentage
      const percent = Math.round((nextIndex / (pages.length - 1)) * 100);
      setProgress(percent);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Function to navigate to the previous page
  const goBack = () => {
    const pages = [
      "profile-info",
      "contact-info",
      "work-experience",
      "education-info",
      "skills",
      "projects",
      "certifications",
      "additionalInfo",
    ];

    if (currentPage === "profile-info") navigate("/dashboard");

    const currentIndex = pages.indexOf(currentPage);
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentPage(pages[prevIndex]);

      // Update progress
      const percent = Math.round((prevIndex / (pages.length - 1)) * 100);
      setProgress(percent);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderForm = () => {
    switch (currentPage) {
      case "profile-info":
        return (
          <ProfileInfoForm
            profileData={resumeData?.profileInfo}
            updateSection={(key, value) => {
              updateSection("profileInfo", key, value);
            }}
            onNext={validateAndNext}
          />
        );

      case "contact-info":
        return (
          <ContactInfoForm
            contactInfo={resumeData?.contactInfo}
            updateSection={(key, value) => {
              updateSection("contactInfo", key, value);
            }}
          />
        );

      case "work-experience":
        return (
          <WorkExperienceForm
            workExperience={resumeData?.workExperience}
            updateArrayItem={(index, key, value) => {
              updateArrayItem("workExperience", index, key, value);
            }}
            addArrayItem={(newItem) => addArrayItem("workExperience", newItem)}
            removeArrayItem={(index) =>
              removeArrayItem("workExperience", index)
            }
          />
        );

      case "education-info":
        return (
          <EducationDetailsForm
            educationInfo={resumeData?.education}
            updateArrayItem={(index, key, value) => {
              updateArrayItem("education", index, key, value);
            }}
            addArrayItem={(newItem) => addArrayItem("education", newItem)}
            removeArrayItem={(index) => removeArrayItem("education", index)}
          />
        );

      case "skills":
        return (
          <SkillsInfoForm
            skillsInfo={resumeData?.skills}
            updateArrayItem={(index, key, value) => {
              updateArrayItem("skills", index, key, value);
            }}
            addArrayItem={(newItem) => addArrayItem("skills", newItem)}
            removeArrayItem={(index) => removeArrayItem("skills", index)}
          />
        );

      case "projects":
        return (
          <ProjectsDetailFrom
            projectInfo={resumeData?.projects}
            updateArrayItem={(index, key, value) => {
              updateArrayItem("projects", index, key, value);
            }}
            addArrayItem={(newItem) => addArrayItem("projects", newItem)}
            removeArrayItem={(index) => removeArrayItem("projects", index)}
          />
        );

      case "certifications":
        return (
          <CertificationInfoForm
            certifications={resumeData?.certifications}
            updateArrayItem={(index, key, value) => {
              updateArrayItem("certifications", index, key, value);
            }}
            addArrayItem={(newItem) => addArrayItem("certifications", newItem)}
            removeArrayItem={(index) =>
              removeArrayItem("certifications", index)
            }
          />
        );

      case "additionalInfo":
        return (
          <AdditionalInfoForm
            languages={resumeData.languages}
            interests={resumeData.interests}
            updateArrayItem={(section, index, key, value) =>
              updateArrayItem(section as keyof typeof resumeData, index, key, value)
            }
            addArrayItem={(section, newItem) => addArrayItem(section, newItem)}
            removeArrayItem={(section, index) =>
              removeArrayItem(section, index)
            }
          />
        );

      default:
        return null;
    }
  };

  // Update simple nested object (like profileInfo, contactInfo, etc.)
  const updateSection = (
    section: keyof Pick<typeof resumeData, 'profileInfo' | 'contactInfo' | 'template'>,
    key: string,
    value: string
  ) => {
    setResumeData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  // Update array item (like workExperience[0], skills[1], etc.)
  const updateArrayItem = (
    section: keyof typeof resumeData,
    index: number,
    key: string | null,
    value: string | number
  ) => {
    setResumeData((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sectionArray = prev[section] as any[];
      const updatedArray = [...sectionArray];

      if (key === null) {
        updatedArray[index] = value; // for simple strings like in `interests`
      } else {
        updatedArray[index] = {
          ...updatedArray[index],
          [key]: value,
        };
      }

      return {
        ...prev,
        [section]: updatedArray,
      };
    });
  };

  // Add item to array
  const addArrayItem = (section: string, newItem) => {
    setResumeData((prev) => ({
      ...prev,
      [section]: [...prev[section], newItem],
    }));
  };

  // Remove item from array
  const removeArrayItem = (section: string, index: number) => {
    setResumeData((prev) => {
      const updatedArray = [...prev[section]];
      updatedArray.splice(index, 1);
      return {
        ...prev,
        [section]: updatedArray,
      };
    });
  };

  // upload thumbnail and resume profile img
  const uploadResumeImages = async () => {
  try {
    // Prepare data to send (base64 strings)
    const data: { profileImage?: string; thumbnail?: string } = {};

    // Convert thumbnail to base64 (if available)
    if (resumeRef.current) {
      fixTailwindColors(resumeRef.current);
      const imageDataUrl = await captureElementAsImage(resumeRef.current);
      if (imageDataUrl) {
        data.thumbnail = imageDataUrl;
      }
    }

    // Convert profile image to base64 (if valid File or Blob)
    const profileImageFile: any = resumeData?.profileInfo?.profileImg;
    if (profileImageFile instanceof File || profileImageFile instanceof Blob) {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(profileImageFile);
      });
      data.profileImage = await base64Promise;
    } else if (profileImageFile) {
      console.warn("Invalid profile image type:", typeof profileImageFile);
    }

    // Upload images and get persistent URLs
    let thumbnailLink: string | undefined;
    let profilePreviewUrl: string | undefined;
    
    if (data.profileImage || data.thumbnail) {
      const uploadResponse = await updateResumeImage({
        id: resumeId,
        data,
      }).unwrap();
      console.log("uploadResumeImage response:", uploadResponse);
      ({ thumbnailLink, profilePreviewUrl } = uploadResponse);
    }

    // Prepare the updated resume data with the new URLs from backend
    const updatedResumeData = {
      ...resumeData,
      thumbnailLink: thumbnailLink || resumeData.thumbnailLink,
      profileInfo: {
        ...resumeData.profileInfo,
        profilePreviewUrl: profilePreviewUrl || resumeData.profileInfo.profilePreviewUrl,
        profileImg: undefined, // Clear client-side File after upload
      },
    };

    // Update resume details with the corrected URLs
    await updateResumeDetails(updatedResumeData);

    // Update local state with the persistent URLs from backend
    setResumeData(updatedResumeData);

    toast.success("Resume Updated Successfully!");
    navigate("/dashboard");
  } catch (error) {
    console.error("Error uploading images:", error);
    toast.error("Failed to upload images");
  }
};

// Updated updateResumeDetails function to accept the full resume data
const updateResumeDetails = async (dataToUpdate: typeof resumeData): Promise<void> => {
  try {
    // Update the resume using RTK Query
    await updateResume({
      id: resumeId,
      data: dataToUpdate,
    }).unwrap();
  } catch (err) {
    console.error("Error updating resume details:", err);
    toast.error("Failed to update resume details");
  }
};

  // Delete Resume
  const handleDeleteResume = async () => {
    try {
      await deleteResume(resumeId).unwrap();
      toast.success("Resume Deleted Successfully");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error deleting resume:", err);
      toast.error("Failed to delete resume");
    }
  };

  // download resume
  const reactToPrintFn = useReactToPrint({ contentRef: resumeDownloadRef });

  // Function to update baseWidth based on the resume container size
  const updateBaseWidth = () => {
    if (resumeRef.current) {
      setBaseWidth(resumeRef.current.offsetWidth);
    }
  };

  // Load resume data when component mounts
  useEffect(() => {
    if (resumeDetails && resumeDetails.resume) {
      setResumeData((prevState) => ({
        ...prevState, // Preserve profileImg or other client-side state
        _id: resumeDetails.resume._id || "",
        createdAt: resumeDetails.resume.createdAt
          ? new Date(resumeDetails.resume.createdAt)
          : new Date(),
        updatedAt: resumeDetails.resume.updatedAt
          ? new Date(resumeDetails.resume.updatedAt)
          : new Date(),
        title: resumeDetails.resume.title || "Untitled",
        thumbnailLink: resumeDetails.resume.thumbnailLink || "",
        profileInfo: {
          ...prevState.profileInfo, // Preserve profileImg
          profilePreviewUrl:
            resumeDetails.resume.profileInfo?.profilePreviewUrl || "",
          fullName: resumeDetails.resume.profileInfo?.fullName || "",
          designation: resumeDetails.resume.profileInfo?.designation || "",
          summary: resumeDetails.resume.profileInfo?.summary || "",
        },
        template: {
          theme: resumeDetails.resume.template?.theme || "",
          colorPalette: resumeDetails.resume.template?.colorPalette || [],
        },
        contactInfo: {
          email: resumeDetails.resume.contactInfo?.email || "",
          phone: resumeDetails.resume.contactInfo?.phone || "",
          location: resumeDetails.resume.contactInfo?.location || "",
          linkedin: resumeDetails.resume.contactInfo?.linkedin || "",
          github: resumeDetails.resume.contactInfo?.github || "",
          website: resumeDetails.resume.contactInfo?.website || "",
        },
        workExperience: resumeDetails.resume.workExperience?.length
          ? resumeDetails.resume.workExperience.map(({ _id, ...rest }) => rest) // Remove _id
          : [
              {
                company: "",
                role: "",
                startDate: "",
                endDate: "",
                description: "",
              },
            ],
        education: resumeDetails.resume.education?.length
          ? resumeDetails.resume.education.map(({ _id, ...rest }) => rest) // Remove _id
          : [{ degree: "", institution: "", startDate: "", endDate: "" }],
        skills: resumeDetails.resume.skills?.length
          ? resumeDetails.resume.skills.map(({ _id, ...rest }) => rest) // Remove _id
          : [{ name: "", progress: 0 }],
        projects: resumeDetails.resume.projects?.length
          ? resumeDetails.resume.projects.map(({ _id, ...rest }) => rest) // Remove _id
          : [{ title: "", description: "", github: "", liveDemo: "" }],
        certifications: resumeDetails.resume.certifications?.length
          ? resumeDetails.resume.certifications.map(({ _id, ...rest }) => rest) // Remove _id
          : [{ title: "", issuer: "", year: "" }],
        languages: resumeDetails.resume.languages?.length
          ? resumeDetails.resume.languages.map(({ _id, ...rest }) => rest) // Remove _id
          : [{ name: "", progress: 0 }],
        interests: resumeDetails.resume.interests?.length
          ? resumeDetails.resume.interests
          : [""],
      }));
    } else {
      console.log("resumeDetails is undefined or missing resume property");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeDetails]);

  useEffect(() => {
    updateBaseWidth();
    window.addEventListener("resize", updateBaseWidth);

    return () => {
      window.removeEventListener("resize", updateBaseWidth);
    };
  }, []);

  return (
    <DashboardLayout activeMenu="resume">
      <div className="container mx-auto">
        <div className="flex items-center justify-between gap-5 bg-white rounded-lg border border-purple-100 py-3 px-4 mb-4">
          <TitleInput
            title={resumeData.title}
            setTitle={(value) =>
              setResumeData((prevState) => ({
                ...prevState,
                title: value,
              }))
            }
          />

          <div className="flex items-center gap-4">
            <button
              className="btn-small-light"
              onClick={() => setOpenThemeSelector(true)}
            >
              <LuPalette className="text-[16px]" />
              <span className="hidden md:block">Change Theme</span>
            </button>

            <button className="btn-small-light" onClick={handleDeleteResume}>
              <LuTrash2 className="text-[16px]" />
              <span className="hidden md:block">Delete</span>
            </button>

            <button
              className="btn-small-light"
              onClick={() => setOpenPreviewModal(true)}
            >
              <LuDownload className="text-[16px]" />
              <span className="hidden md:block">Preview & Download</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-lg border border-purple-100 overflow-hidden">
            <StepProgress progress={progress} />

            {isLoadingResume ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading resume data...</p>
              </div>
            ) : (
              renderForm()
            )}

            <div className="mx-5">
              {errorMsg && (
                <div className="flex items-center gap-2 text-[11px] font-medium text-amber-600 bg-amber-100 px-2 py-0.5 my-1 rounded">
                  <LuCircleAlert className="text-md" /> {errorMsg}
                </div>
              )}

              <div className="flex items-end justify-end gap-3 mt-3 mb-5">
                <button
                  className="btn-small-light"
                  onClick={goBack}
                  disabled={isLoading}
                >
                  <LuArrowLeft className="text-[16px]" />
                  Back
                </button>
                <button
                  className="btn-small-light"
                  onClick={uploadResumeImages}
                  disabled={isLoading}
                >
                  <LuSave className="text-[16px]" />
                  {isLoading ? "Updating..." : "Save & Exit"}
                </button>
                <button
                  className="btn-small"
                  onClick={validateAndNext}
                  disabled={isLoading}
                >
                  {currentPage === "additionalInfo" && (
                    <LuDownload className="text-[16px]" />
                  )}

                  {currentPage === "additionalInfo"
                    ? "Preview & Download"
                    : "Next"}
                  {currentPage !== "additionalInfo" && (
                    <LuArrowLeft className="text-[16px] rotate-180" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div ref={resumeRef} className="h-[100vh]">
            {/* Resume Template */}
            <RenderResume
              templateId={resumeData?.template?.theme || ""}
              resumeData={resumeData}
              colorPalette={{
                primary: resumeData?.template?.colorPalette?.[0] || "#000000",
                secondary: resumeData?.template?.colorPalette?.[1] || "#666666",
                background:
                  resumeData?.template?.colorPalette?.[2] || "#ffffff",
              }}
              containerWidth={baseWidth}
            />
          </div>
        </div>
      </div>

      <Modal
        isOpen={openThemeSelector}
        onClose={() => setOpenThemeSelector(false)}
        title="Change Theme"
      >
        <div className="w-[90vw] h-[80vh]">
          <ThemeSelector
            selectedTheme={{
              theme: resumeData?.template?.theme || "",
              colorPalette: resumeData?.template?.colorPalette || [],
            }}
            setSelectedTheme={(value) => {
              setResumeData((prevState) => ({
                ...prevState,
                template: value || prevState.template,
              }));
            }}
            resumeData={null}
            onClose={() => setOpenThemeSelector(false)}
          />
        </div>
      </Modal>

      <Modal
        isOpen={openPreviewModal}
        onClose={() => setOpenPreviewModal(false)}
        title={resumeData.title}
        showActionBtn
        actionBtnText="Download"
        actionBtnIcon={<LuDownload className="text-[16px]" />}
        onActionClick={() => reactToPrintFn()}
      >
        <div ref={resumeDownloadRef} className="w-[98vw] h-[90vh]">
          <RenderResume
            templateId={resumeData?.template?.theme || ""}
            resumeData={resumeData}
            colorPalette={{
              primary: resumeData?.template?.colorPalette?.[0] || "#000000",
              secondary: resumeData?.template?.colorPalette?.[1] || "#666666",
              background: resumeData?.template?.colorPalette?.[2] || "#ffffff",
            }}
            containerWidth={baseWidth}
          />
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default EditResume;
