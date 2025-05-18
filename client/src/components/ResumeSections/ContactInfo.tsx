import React from "react";

interface ContactInfoProps {
  icon: React.ReactNode;
  iconBG: string;
  value: string;
}

const ContactInfo = ({ icon, iconBG, value }: ContactInfoProps) => {
  return <div className="flex items-center gap-3">
      <div
        className="w-[30px] h-[30px] flex items-center justify-center rounded-full"
        style={{ backgroundColor: iconBG }}
      >
        {icon}
      </div>

      <p className="flex-1 text-[12px] font-medium break-all">{value}</p>
    </div>
};

export default ContactInfo;
