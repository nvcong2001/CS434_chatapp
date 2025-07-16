import { onAuthStateChanged } from "firebase/auth";
import Chat from "./components/chat";
import Detail from "./components/detail";
import List from "./components/list";
import Notificaton from "./components/notification";
import Login from "./pages/login";
import { auth } from "./lib/firebase";
import { useUserStore } from "./stores/userStore";
import { useEffect } from "react";
import { useChatStore } from "./stores/chatStore";

function App() {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  if (isLoading)
    return (
      <div className="p-12 text-4xl rounded-lg bg-neutral-700">Loading...</div>
    );

  return (
    <div className="flex m-0 p-0 w-[90vw] h-[90vh] bg-black/30 rounded-xl backdrop-blur-md">
      {currentUser ? (
        <>
          <List />
          {chatId && <Chat />}
          {chatId && <Detail />}
        </>
      ) : (
        <Login />
      )}
      <Notificaton />
    </div>
  );
}

export default App;
