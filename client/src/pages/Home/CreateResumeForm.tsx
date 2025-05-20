import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from "../../components/Inputs/Input";
import { useCreateResumeMutation } from "../../redux/features/resume/resumeApi";

const CreateResumeForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Using RTK Query mutation hook
  const [createResume, { isLoading }] = useCreateResumeMutation();

  // Handle Create Resume
interface CreateResumeResponse {
    _id: string;
    resume?: {
        _id: string;
    };
    [key: string]: unknown;
}

interface CreateResumeError {
    data?: {
        message: string;
    };
}

const handleCreateResume = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title) {
        setError("Please enter resume title");
        return;
    }
    setError(null);
    
    //Create Resume API Call with RTK Query
    try {
        const response = await createResume({ title }).unwrap() as CreateResumeResponse;
        const resumeId = response?._id || response?.resume?._id;
        if (resumeId) {
            if (onSuccess) {
                onSuccess();
            }
            navigate(`/resume/${resumeId}`);
        }
    } catch (err: unknown) {
        const error = err as CreateResumeError;
        if (error.data && error.data.message) {
            setError(error.data.message);
        } else {
            setError("Something went wrong. Please try again.");
        }
    }
};
  
  return (
    <div className="w-[90vw] md:w-[70vh] p-7 flex flex-col justify-center">
      <h3 className="text-lg font-semibold text-black">Create New Resume</h3>
      <p className="text-xs text-slate-700 mt-[5px] mb-3">
        Give your resume a title to get started. You can edit all details later.
      </p>
      <form onSubmit={handleCreateResume}>
        <Input
          value={title}
          onChange={({ target }) => setTitle(target.value)}
          label="Resume Title"
          placeholder="Eg: Mike's Resume"
          type="text"
          disabled={isLoading}
        />
        {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Resume"}
        </button>
      </form>
    </div>
  );
};

export default CreateResumeForm;