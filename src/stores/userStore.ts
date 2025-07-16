import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "../lib/firebase";

export interface Users {
  id: string;
  username?: string;
  avatar?: string;
  blocked?: string[];
}

export interface ChatItem {
  chatId: string;
  receiverId: string;
  lastMessage: string;
  updatedAt: number;
  user?: Users;
}

interface UserStoreState {
  currentUser: Users | null;
  isLoading: boolean;
  fetchUserInfo: (uid: string | undefined | null) => Promise<void>;
}

export const useUserStore = create<UserStoreState>((set) => ({
  currentUser: null,
  isLoading: true,
  fetchUserInfo: async (uid) => {
    if (!uid) return set({ currentUser: null, isLoading: false });

    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        set({ currentUser: docSnap.data() as Users, isLoading: false });
      } else {
        set({ currentUser: null, isLoading: false });
      }
    } catch (error) {
      console.log(error);
      return set({ currentUser: null, isLoading: false });
    }
  },
}));
