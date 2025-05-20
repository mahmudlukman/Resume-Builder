import { useEffect, useRef, useState } from "react";
import {
  DUMMY_RESUME_DATA,
  resumeTemplates,
  themeColorPalette,
} from "../../utils/data";
import { LuCircleCheckBig } from "react-icons/lu";
import Tabs from "../../components/Tabs";
import TemplateCard from "../../components/Cards/TemplateCard";
import RenderResume from "../../components/ResumeTemplates/RenderResume";
import type { ResumeData } from "../../@types";

const TAB_DATA = [{ label: "Templates" }, { label: "Color Palettes" }];

interface ThemeSelectorProps {
  selectedTheme: { colorPalette: string[]; theme: string };
  setSelectedTheme: (theme: { colorPalette: string[]; theme: string }) => void;
  resumeData: ResumeData | null;
  onClose: () => void;
}

const ThemeSelector = ({
  selectedTheme,
  setSelectedTheme,
  resumeData,
  onClose,
}: ThemeSelectorProps) => {
  const resumeRef = useRef<HTMLDivElement | null>(null);
  const [baseWidth, setBaseWidth] = useState(800);

  const [tabValue, setTabValue] = useState("Templates");
  const [selectedColorPalette, setSelectedColorPalette] = useState({
    colors: selectedTheme?.colorPalette,
    index: -1,
  });
  const [selectedTemplate, setSelectedTemplate] = useState({
    theme: selectedTheme?.theme || "",
    index: -1,
  });

  // Handle Theme Change
  const handleThemeSelection = () => {
    setSelectedTheme({
      colorPalette: selectedColorPalette?.colors,
      theme: selectedTemplate?.theme,
    });
    onClose();
  };

  const updateBaseWidth = () => {
    if (resumeRef.current) {
      setBaseWidth(resumeRef.current.offsetWidth);
    }
  };

  useEffect(() => {
    updateBaseWidth();
    window.addEventListener("resize", updateBaseWidth);

    return () => {
      window.removeEventListener("resize", updateBaseWidth);
    };
  }, []);

  return <div className="container mx-auto px-2 md:px-0">
      <div className="flex items-center justify-between mb-5 mt-2">
        <Tabs tabs={TAB_DATA} activeTab={tabValue} setActiveTab={setTabValue} />

        <button
          className="btn-small-light"
          onClick={() => handleThemeSelection()}
        >
          <LuCircleCheckBig className="text-[16px]" />
          Done
        </button>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 md:col-span-5 bg-white">
          <div className="grid grid-cols-2 gap-5 max-h-[80vh] overflow-scroll custom-scrollbar md:pr-5">
            {tabValue === "Templates" &&
              resumeTemplates.map((template, index) => (
                <TemplateCard
                  key={`templates_${index}`}
                  thumbnailImg={template.thumbnailImg}
                  isSelected={selectedTemplate?.index === index}
                  onSelect={() =>
                    setSelectedTemplate({ theme: template.id, index })
                  }
                />
              ))}

              {tabValue === "Color Palettes" &&
              themeColorPalette.themeOne.map((colors, index) => (
                <ColorPalette
                  key={`palette_${index}`}
                  colors={colors}
                  isSelected={selectedColorPalette?.index === index}
                  onSelect={() => setSelectedColorPalette({ colors, index })}
                />
              ))}
          </div>
        </div>
        <div className="col-span-12 md:col-span-7 bg-white -mt-3" ref={resumeRef}>
          <RenderResume
            templateId={selectedTemplate?.theme || ""}
            resumeData={{
              ...resumeData || DUMMY_RESUME_DATA,
              createdAt: new Date(resumeData?.createdAt || DUMMY_RESUME_DATA.createdAt),
              updatedAt: new Date(resumeData?.updatedAt || DUMMY_RESUME_DATA.updatedAt)
            }}
            containerWidth={baseWidth}
            colorPalette={{
              primary: selectedColorPalette?.colors?.[0] || '#000000',
              secondary: selectedColorPalette?.colors?.[1] || '#ffffff',
              background: selectedColorPalette?.colors?.[2] || '#ffffff'
            }}
          />
        </div>
      </div>
    </div>
};

export default ThemeSelector;

interface ColorPaletteProps {
  colors: string[];
  isSelected: boolean;
  onSelect: () => void;
}

const ColorPalette = ({ colors, isSelected, onSelect }: ColorPaletteProps) => {
  return (
    <div
      className={`h-28 bg-purple-50 flex rounded-lg overflow-hidden border-2 ${
        isSelected ? "border-purple-500" : "border-none"
      }`}
    >
      {colors.map((color, index) => (
        <div
          key={`color_${index}`}
          className="flex-1"
          style={{ backgroundColor: colors[index] }}
          onClick={onSelect}
        />
      ))}
    </div>
  );
};