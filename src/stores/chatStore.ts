import { create } from "zustand";
import { useUserStore, type Users } from "./userStore";

interface ChatStoreState {
  chatId: string | null;
  user: Users | null;
  isCurrentUserBlocked: boolean;
  isReceiverBlocked: boolean;
  changeChat: (chatId: string, user: Users) => void;
  changeBlock: () => void;
  resetChat: () => void;
}

export const useChatStore = create<ChatStoreState>((set) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,
  changeChat: (chatId: string, user: Users) => {
    const currentUser = useUserStore.getState().currentUser;
    if (!currentUser) return;
    //CHECK IF CURRENT USER IS BLOCKED
    if (user.blocked && user.blocked.includes(currentUser.id)) {
      return set({
        chatId,
        user: null,
        isCurrentUserBlocked: true,
        isReceiverBlocked: false,
      });
    }
    // CHECK IF RECEIVER IS BLOCKED
    else if (currentUser.blocked && currentUser.blocked.includes(user.id)) {
      return set({
        chatId,
        user: user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: true,
      });
    } else {
      return set({
        chatId,
        user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: false,
      });
    }
  },

  changeBlock: () => {
    set((state: ChatStoreState) => ({
      ...state,
      isReceiverBlocked: !state.isReceiverBlocked,
    }));
  },
  resetChat: () => {
    set({
      chatId: null,
      user: null,
      isCurrentUserBlocked: false,
      isReceiverBlocked: false,
    });
  },
}));
