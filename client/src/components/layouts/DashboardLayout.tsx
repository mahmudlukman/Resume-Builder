import { type PropsWithChildren } from "react";
import Navbar from "./Navbar";
import { useSelector } from "react-redux";
import type { RootState } from "../../@types";

interface DashboardLayoutProps {
  activeMenu: string;
}

const DashboardLayout = ({
  activeMenu,
  children,
}: PropsWithChildren<DashboardLayoutProps>) => {
  const { user } = useSelector((state: RootState) => state.auth);
  return (
    <div>
      <Navbar activeMenu={activeMenu} />

      {user && <div className="container mx-auto pt-4 pb-4">{children}</div>}
    </div>
  );
};

export default DashboardLayout;
