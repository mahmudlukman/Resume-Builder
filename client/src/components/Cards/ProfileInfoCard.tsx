import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useLogOutMutation } from "../../redux/features/auth/authApi";
import type { RootState } from "../../@types";

const ProfileInfoCard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [logout] = useLogOutMutation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout({}).unwrap();
      navigate("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Helper to check if a string is a valid URL
  const isImageUrl = (str?: string) => str && str.match(/^(http|https):\/\//);

  // Get initial or fallback
  const initial =
    user?.name && user.name.trim() ? user.name.charAt(0).toUpperCase() : "U";

  return (
    user && (
      <div className="flex items-center">
        {isImageUrl(user?.avatar?.url) ? (
          <img
            src={user?.avatar?.url ?? ""}
            alt="Avatar"
            className="w-11 h-11 bg-gray-300 rounded-full mr-3"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-800 text-lg font-medium rounded-full">
            {initial}
          </div>
        )}
        <div>
          <div className="text-[15px] font-bold leading-3">
            {user.name || ""}
          </div>
          <button
            className="text-purple-500 text-sm font-semibold cursor-pointer hover:underline"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    )
  );
};

export default ProfileInfoCard;
