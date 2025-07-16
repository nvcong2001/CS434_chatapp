import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { useState } from "react";
import type { FormEvent } from "react";
import { useUserStore, type Users } from "../../../../stores/userStore";

const AddUser = () => {
  const [user, setUser] = useState<Users | null>(null);
  const { currentUser } = useUserStore();

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username");

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapShot = await getDocs(q);

      if (!querySnapShot.empty) {
        setUser(querySnapShot.docs[0].data() as Users);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAdd = async () => {
    if (!user || !currentUser) {
      return;
    }
    const chatsRef = collection(db, "chats");
    const userChatsRef = collection(db, "userChats");

    try {
      const newChatsRef = doc(chatsRef);

      await setDoc(newChatsRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      await updateDoc(doc(userChatsRef, user.id), {
        chats: arrayUnion({
          chatId: newChatsRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });

      await updateDoc(doc(userChatsRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatsRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: Date.now(),
        }),
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="max-w-max max-h-max p-7 bg-black/75 rounded-lg absolute inset-0 m-auto">
      <form className="flex gap-5" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Username"
          name="username"
          className="p-5 rounded-lg outline-0 bg-white text-black"
        />
        <button className="p-5 rounded-lg bg-blue-400 cursor-pointer">
          Search
        </button>
      </form>
      {user && (
        <div className="mt-12 flex items-center justify-between">
          <div className="flex gap-5 items-center">
            <img
              src={user.avatar}
              alt=""
              className="w-12 h-12 rounded-full object-cover"
            />
            <span>{user.username}</span>
          </div>
          <button
            onClick={handleAdd}
            className="p-2 rounded-lg bg-blue-400 cursor-pointer"
          >
            Add User
          </button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
