import { Link } from "react-router-dom";
import ProfileInfoCard from "../Cards/ProfileInfoCard";

// Add proper props interface for Navbar
interface NavbarProps {
  activeMenu: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Navbar = ({ activeMenu }: NavbarProps) => {
  return (
    <div className="h-16 bg-white border boredr-b border-gray-200/50 backdrop-blur-[2px] py-2.5 px-4 md:px-0 sticky top-0 z-30">
      <div className="container mx-auto flex items-center justify-between gap-5">
        <Link to='/dashboard'>
          <h2 className="text-lg md:text-xl font-medium text-black leading-5">
            Resume Builder
          </h2>
        </Link>

        <ProfileInfoCard />
      </div>
    </div>
  );
};

export default Navbar;

// import { Link } from "react-router-dom";
// import ProfileInfoCard from "../Cards/ProfileInfoCard";

// // Option 1: If activeMenu is needed for highlighting the active menu item
// interface NavbarProps {
//   activeMenu: string;
// }

// const Navbar = ({ activeMenu }: NavbarProps) => {
//   return (
//     <div className="h-16 bg-white border boredr-b border-gray-200/50 backdrop-blur-[2px] py-2.5 px-4 md:px-0 sticky top-0 z-30">
//       <div className="container mx-auto flex items-center justify-between gap-5">
//         <Link to='/dashboard'>
//           <h2 className={`text-lg md:text-xl font-medium leading-5 ${
//             activeMenu === 'dashboard' ? 'text-blue-600' : 'text-black'
//           }`}>
//             Resume Builder
//           </h2>
//         </Link>

//         {/* Navigation links that use activeMenu prop */}
//         <div className="hidden md:flex items-center gap-6">
//           <Link 
//             to="/dashboard" 
//             className={`${activeMenu === 'dashboard' ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
//           >
//             Dashboard
//           </Link>
//           <Link 
//             to="/templates" 
//             className={`${activeMenu === 'templates' ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
//           >
//             Templates
//           </Link>
//         </div>

//         <ProfileInfoCard />
//       </div>
//     </div>
//   );
// };

// export default Navbar;