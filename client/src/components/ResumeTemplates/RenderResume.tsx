import React from "react";
import TemplateOne from "./TemplateOne";
import TemplateTwo from "./TemplateTwo";
import TemplateThree from "./TemplateThree";
import type { ResumeData } from "../../@types";

interface RenderResumeProps {
  templateId: string;
  resumeData: ResumeData;
  colorPalette: {
    primary: string;
    secondary: string;
    background: string;
  };
  containerWidth: number;
}

const RenderResume: React.FC<RenderResumeProps> = ({
  templateId,
  resumeData,
  colorPalette,
  containerWidth,
}) => {
  // Convert the colorPalette object to an array format expected by the templates
  const colorPaletteArray: string[] = [
    colorPalette.background,
    colorPalette.primary,
    colorPalette.background, // This could be a lighter shade of background
    colorPalette.secondary,
    "#4A5565", // Default text color from the original template
  ];

  switch (templateId) {
    case "01":
      return (
        <TemplateOne
          resumeData={resumeData}
          colorPalette={colorPaletteArray}
          containerWidth={containerWidth}
        />
      );
    case "02":
      return (
        <TemplateTwo
          resumeData={resumeData}
          colorPalette={colorPaletteArray}
          containerWidth={containerWidth}
        />
      );
    case "03":
      return (
        <TemplateThree
          resumeData={resumeData}
          colorPalette={colorPaletteArray}
          containerWidth={containerWidth}
        />
      );
    default:
      return (
        <TemplateOne
          resumeData={resumeData}
          colorPalette={colorPaletteArray}
          containerWidth={containerWidth}
        />
      );
  }
};

export default RenderResume;
