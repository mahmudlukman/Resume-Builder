import { LuGithub, LuExternalLink } from "react-icons/lu";
import ActionLink from "./ActionLink";

interface ProjectInfoProps {
  title: string;
  description: string;
  githubLink?: string;
  liveDemoUrl?: string;
  bgColor?: string;
  isPreview?: boolean;
}

const ProjectInfo = ({
  title,
  description,
  githubLink,
  liveDemoUrl,
  bgColor,
  isPreview,
}: ProjectInfoProps) => {
  return (
    <div className="mb-5">
      <h3
        className={`${
          isPreview ? "text-xs" : "text-base"
        } font-semibold text-gray-900`}
      >
        {title}
      </h3>
      <p className="text-sm text-gray-700 font-medium mt-1">{description}</p>

      <div className="flex items-center gap-3 mt-2">
        {githubLink && (
          <ActionLink icon={<LuGithub />} link={githubLink} bgColor={bgColor || '#ffffff'} />
        )}

        {liveDemoUrl && (
          <ActionLink
            icon={<LuExternalLink />}
            link={liveDemoUrl}
            bgColor={bgColor || '#ffffff'}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectInfo;
