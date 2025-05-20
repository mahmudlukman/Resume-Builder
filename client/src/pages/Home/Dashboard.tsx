import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { LuCirclePlus } from 'react-icons/lu';
import moment from 'moment';
import ResumeSummaryCard from "../../components/Cards/ResumeSummaryCard";
import CreateResumeForm from "./CreateResumeForm";
import Modal from "../../components/Modal";
import { useGetAllResumesQuery } from "../../redux/features/resume/resumeApi";

const Dashboard = () => {
  const navigate = useNavigate();
  const [openCreateModal, setOpenCreateModal] = useState(false);
  
  // Using RTK Query hook instead of manual axios call
  const { data, isLoading, error } = useGetAllResumesQuery({});
  
  const resumes = data?.resumes || data || [];

  return (
    <DashboardLayout activeMenu="dashboard">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-7 pt-1 pb-6 px-4 md:px-0">
        <div
          className="h-[300px] flex flex-col gap-5 items-center justify-center bg-white rounded-lg border border-purple-100 hover:border-purple-300 hover:bg-purple-50/5 cursor-pointer"
          onClick={() => setOpenCreateModal(true)}
        >
          <div className="w-12 h-12 flex items-center justify-center bg-purple-200/60 rounded-2xl">
            <LuCirclePlus className="text-xl text-purple-500" />
          </div>
          <h3 className="font-medium text-gray-800">Add New Resume</h3>
        </div>
        
        {isLoading && <div className="col-span-1 md:col-span-5">Loading resumes...</div>}
        
        {error && (
          <div className="col-span-1 md:col-span-5 text-red-500">
            Error loading resumes!
          </div>
        )}
        
        {Array.isArray(resumes) && resumes.length > 0 ? (
          resumes.map((resume) => (
            <ResumeSummaryCard
              key={resume?._id}
              imgUrl={resume?.thumbnailLink || null}
              title={resume.title}
              lastUpdated={
                resume?.updatedAt
                  ? moment(resume.updatedAt).format("Do MMM YYYY")
                  : ""
              }
              onSelect={() => navigate(`/resume/${resume?._id}`)}
            />
          ))
        ) : (
          !isLoading && (
            <div className="col-span-1 md:col-span-5 text-gray-500">
              No resumes found. Create your first resume to get started!
            </div>
          )
        )}
      </div>
      
      <Modal
        isOpen={openCreateModal}
        onClose={() => {
          setOpenCreateModal(false);
        }}
        hideHeader
      >
        <div>
          <CreateResumeForm onSuccess={() => setOpenCreateModal(false)} />
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default Dashboard;
