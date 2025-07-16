import { useEffect, useState } from "react";
import AddUser from "./addUser";
import {
  useUserStore,
  type ChatItem,
  type Users,
} from "../../../stores/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../stores/chatStore";

interface ExtendedChatItem extends ChatItem {
  isSeen?: boolean;
}

const ChatList = () => {
  const [chats, setChats] = useState<ExtendedChatItem[]>([]);
  const [addMode, setAddMode] = useState(false);
  const [input, setInput] = useState("");
  const { currentUser } = useUserStore();
  const { changeChat } = useChatStore();

  useEffect(() => {
    if (!currentUser?.id) return;
    const unSub = onSnapshot(
      doc(db, "userChats", currentUser.id),
      async (res) => {
        const data = res.data();
        if (!data || !data.chats) {
          setChats([]);
          return;
        }
        const items: ExtendedChatItem[] = data.chats;
        const promises = items.map(async (item: ExtendedChatItem) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);
          const user = userDocSnap.data() as Users | undefined;
          return { ...item, user };
        });

        const chatData = await Promise.all(promises);
        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      }
    );

    return () => {
      unSub();
    };
  }, [currentUser?.id]);

  const handleSelect = async (chat: ExtendedChatItem) => {
    if (!currentUser?.id) return;

    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );

    if (chatIndex !== -1) {
      userChats[chatIndex].isSeen = true;
    }

    const userChatsRef = doc(db, "userChats", currentUser.id);

    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });
      if (chat.user) {
        changeChat(chat.chatId, chat.user);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const filteredChats = chats.filter((c) =>
    c.user?.username?.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="overflow-y-auto">
      <div className="flex items-center justify-center gap-5 p-5">
        <div className="flex bg-black/50 items-center gap-5 rounded-lg p-2.5 max-w-max">
          <i className="bx bx-search px-2"></i>
          <input
            type="text"
            className="outline-0"
            placeholder="Search"
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <div onClick={() => setAddMode(() => !addMode)}>
          <i
            className={`bx  bx-${
              addMode ? "minus" : "plus"
            } p-2.5 bg-black/50 rounded-lg cursor-pointer text-center`}
          ></i>
        </div>
      </div>

      {filteredChats.map((chat) => (
        <div
          key={chat.chatId}
          className={`flex items-center gap-5 p-5 cursor-pointer border-b ${
            chat?.isSeen ? "bg-transparent" : "bg-blue-400"
          }`}
          onClick={() => handleSelect(chat)}
        >
          <img
            src={
              chat.user?.blocked?.includes(currentUser?.id || "")
                ? "./avatar.png"
                : chat.user?.avatar
            }
            alt=""
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="gap-2.5 flex flex-col">
            <span className="font-medium">
              {chat.user?.blocked?.includes(currentUser?.id || "")
                ? "User"
                : chat.user?.username}
            </span>
            <p className="font-light">{chat.lastMessage}</p>
          </div>
        </div>
      ))}

      {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;
