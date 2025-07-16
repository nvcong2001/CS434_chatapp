import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../stores/chatStore";
import { useUserStore } from "../../stores/userStore";
import upload from "../../lib/upload";
import { formatDistanceToNow } from "date-fns";

const Chat = () => {
  const [chat, setChat] = useState<DocumentData | null>(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState<{ file: File | null; url: string }>({
    file: null,
    url: "",
  });

  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();
  const { currentUser } = useUserStore();

  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  useEffect(() => {
    if (!chatId) return;
    const chatDocRef = doc(db, "chats", chatId);
    const unSub = onSnapshot(chatDocRef, (res) => {
      setChat(res.data() ?? null);
    });
    return () => {
      unSub();
    };
  }, [chatId]);

  const handleEmoji = (e: { emoji: string }) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSend = async () => {
    if (text === "") return;
    if (!chatId || !currentUser?.id || !user?.id) return;

    let imgUrl = null;
    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl ? { img: imgUrl } : {}),
        }),
      });
      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        if (!id) return;
        const userChatsRef = doc(db, "userChats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();

          const chatIndex = userChatsData.chats.findIndex(
            (c: { chatId: string }) => c.chatId === chatId
          );

          if (chatIndex !== -1) {
            userChatsData.chats[chatIndex].lastMessage = text;
            userChatsData.chats[chatIndex].isSeen =
              id === currentUser.id ? true : false;
            userChatsData.chats[chatIndex].updatedAt = Date.now();

            await updateDoc(userChatsRef, {
              chats: userChatsData.chats,
            });
          }
        }
      });
    } catch (error) {
      console.log(error);
    } finally {
      setImg({
        file: null,
        url: "",
      });
      setText("");
    }
  };
  return (
    <div className="flex-1/2 border-x h-full flex flex-col">
      <div className="flex p-5 items-center justify-between border-b">
        <div className="flex items-center gap-5">
          <img
            src={user?.avatar || "./avatar.png"}
            alt=""
            className="w-15 h-15 rounded-full object-cover"
          />
          <div className="flex flex-col gap-">
            <span className="font-bold text-lg">
              {user?.username || "Người dùng"}
            </span>
            <p
              className={`${
                isCurrentUserBlocked || isReceiverBlocked ? "hidden" : ""
              }"font-light text-sm opacity-80"`}
            >
              Đang hoạt động
            </p>
          </div>
        </div>
        <div className="flex gap-5 text-2xl">
          <i className="bx  bx-phone"></i>
          <i className="bx  bx-video"></i>
          <i className="bx  bx-info-circle"></i>
        </div>
      </div>
      <div className="flex p-5 overflow-y-auto flex-col gap-1">
        {chat?.messages?.map(
          (
            message: {
              senderId: string;
              text: string;
              createdAt:
                | { seconds: number; nanoseconds: number }
                | string
                | number;
              img?: string;
            },
            idx: number
          ) => {
            let timestamp: number | null = null;
            if (
              message.createdAt &&
              typeof message.createdAt === "object" &&
              "seconds" in message.createdAt
            ) {
              timestamp = message.createdAt.seconds * 1000;
            } else if (
              typeof message.createdAt === "string" ||
              typeof message.createdAt === "number"
            ) {
              const date = new Date(message.createdAt);
              if (!isNaN(date.getTime())) {
                timestamp = date.getTime();
              }
            }
            let key: string | number = idx;
            if (
              typeof message.createdAt === "string" ||
              typeof message.createdAt === "number"
            ) {
              key = message.createdAt;
            }
            return (
              <div
                className={`max-w-[70%] mt-5 ${
                  message.senderId === currentUser?.id
                    ? "self-end"
                    : "self-start"
                }`}
                key={key}
              >
                {message.img && (
                  <img
                    src={message.img}
                    alt=""
                    className="w-full h-[300px] rounded-xl"
                  />
                )}
                <div>
                  <p
                    className={`${
                      message.senderId === currentUser?.id
                        ? "bg-blue-500"
                        : "bg-black/30"
                    } rounded-xl p-3`}
                  >
                    {message.text}
                  </p>
                  <span className="text-[13px]">
                    {timestamp
                      ? formatDistanceToNow(timestamp, { addSuffix: true })
                      : ""}
                  </span>
                </div>
              </div>
            );
          }
        )}
        {img.url && (
          <div className="max-w-[70%] flex gap-5 self-end">
            <div className="flex flex-col gap-1">
              <img src={img.url} alt="" />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>
      <div className="flex p-5 gap-5 items-center justify-between border-t mt-auto text-2xl">
        <div className="flex gap-5">
          <label htmlFor="file">
            <i className="bx bx-image cursor-pointer"></i>
            <input
              type="file"
              id="file"
              className="hidden"
              onChange={handleImg}
            />
          </label>

          <button>
            <i className="bx bx-camera cursor-pointer"></i>
          </button>

          <button>
            <i className="bx bx-microphone cursor-pointer"></i>
          </button>
        </div>
        <input
          type="text"
          placeholder={`${
            isCurrentUserBlocked || isReceiverBlocked
              ? "You can't not sen a message"
              : "Type a mess"
          }`}
          value={text}
          className="outline-0 bg-black/50 rounded-xl text-base p-4 flex-1 disabled:cursor-not-allowed"
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
        <div className="relative">
          <i
            className="bx bx-smile cursor-pointer"
            onClick={() => setOpen(() => !open)}
          ></i>
          <div className="absolute bottom-12.5">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button
          className="bg-blue-400 px-4 py-2.5 cursor-pointer rounded-xl disabled:cursor-not-allowed"
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
