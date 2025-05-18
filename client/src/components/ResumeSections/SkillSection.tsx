import type { Skill } from "../../@types";
import Progress from "../Progress";

interface SkillInfoProps {
  skill: string;
  progress: number;
  accentColor: string;
  bgColor: string;
}

const SkillInfo = ({ skill, progress, accentColor, bgColor }: SkillInfoProps) => {
  return (
    <div className="flex items-center justify-between">
      <span>{skill}</span>
      {progress > 0 && (
        <Progress
          progress={(progress / 100) * 5}
          color={accentColor}
          bgColor={bgColor}
        />
      )}
    </div>
  );
};

const SkillSection = ({ skills, accentColor, bgColor }: { skills: Skill[]; accentColor: string; bgColor: string }) => {
  return <div className="grid grid-cols-2 gap-x-5 gap-y-1 mb-5">
      {skills?.map((skill, index) => (
        <SkillInfo
          key={`skill_${index}`}
          skill={skill.name ?? ""}
          progress={skill.progress ?? 0}
          accentColor={accentColor}
          bgColor={bgColor}
        />
      ))}
    </div>
};

export default SkillSection;
