import { auth } from "../../../lib/firebase";
import { useChatStore } from "../../../stores/chatStore";
import { useUserStore } from "../../../stores/userStore";

const UserInfo = () => {
  const { currentUser } = useUserStore();
  const { resetChat } = useChatStore();

  if (!currentUser) return null;

  const handleLogout = () => {
    auth.signOut();
    resetChat();
  };

  return (
    <div className="p-5 flex items-center justify-between">
      <div className="flex items-center gap-5">
        <img
          src={currentUser.avatar || "./avatar.png"}
          alt=""
          className="w-12 h-12 rounded-full object-cover"
        />
        <h2>{currentUser.username || "User"}</h2>
      </div>
      <button
        className="text-2xl bg-red-400 hover:bg-red-700 rounded-2xl p-3 items-center flex cursor-pointer"
        onClick={handleLogout}
      >
        <i className="bx  bx-arrow-out-right-square-half"></i>
      </button>
    </div>
  );
};

export default UserInfo;
