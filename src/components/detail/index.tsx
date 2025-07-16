import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../stores/chatStore";
import { useUserStore } from "../../stores/userStore";

const Detail = () => {
  const { user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } =
    useChatStore();
  const { currentUser } = useUserStore();

  const handleBlock = async () => {
    if (!user || !currentUser) return;

    const userDocRef = doc(db, "users", currentUser.id);
    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="flex-1/4 overflow-y-auto">
      <div className="px-5 py-7 flex flex-col items-center gap-5 border-b">
        <img
          src={user?.avatar || "./avatar.png"}
          alt=""
          className="w-25 h-25 rounded-full object-cover"
        />
        <h2>{user?.username}</h2>
        <p
          className={`${
            isCurrentUserBlocked || isReceiverBlocked ? "hidden" : ""
          }"font-light text-sm opacity-80"`}
        >
          Đang hoạt động
        </p>
      </div>
      <div className="p-5 flex flex-col gap-7">
        <div className="option">
          <div className="flex items-center justify-between">
            <span>Chat Setting</span>
            <i className="bx bx-chevron-down bg-black/30 cursor-pointer rounded-full"></i>
          </div>
        </div>

        <div className="option">
          <div className="flex items-center justify-between">
            <span>Privacy & Help</span>
            <i className="bx bx-chevron-down bg-black/30 cursor-pointer rounded-full"></i>
          </div>
        </div>

        <div className="option">
          <div className="flex items-center justify-between">
            <span>Share photo</span>
            <i className="bx bx-chevron-up bg-black/30 cursor-pointer rounded-full"></i>
          </div>
          <div className="flex flex-col gap-5 mt-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <img
                  src="https://i.pravatar.cc/"
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <span className="text-sm font-light">photo_2025.png</span>
              </div>
              <i className="bx bx-folder-down-arrow"></i>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <img
                  src="https://i.pravatar.cc/"
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <span className="text-sm font-light">photo_2025.png</span>
              </div>
              <i className="bx bx-folder-down-arrow"></i>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <img
                  src="https://i.pravatar.cc/"
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <span className="text-sm font-light">photo_2025.png</span>
              </div>
              <i className="bx bx-folder-down-arrow"></i>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <img
                  src="https://i.pravatar.cc/"
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <span className="text-sm font-light">photo_2025.png</span>
              </div>
              <i className="bx bx-folder-down-arrow"></i>
            </div>
          </div>
        </div>

        <div className="option">
          <div className="flex items-center justify-between">
            <span>Share Files</span>
            <i className="bx bx-chevron-down bg-black/30 cursor-pointer rounded-full"></i>
          </div>
        </div>
        <button
          onClick={handleBlock}
          className="bg-red-700/70 rounded-sm px-5 py-2.5 hover:bg-red-700/90"
        >
          {isCurrentUserBlocked
            ? "You are Blocked!"
            : isReceiverBlocked
            ? "User blocker"
            : "Block User"}
        </button>
      </div>
    </div>
  );
};

export default Detail;
