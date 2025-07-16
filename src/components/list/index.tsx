import ChatList from "./chatList";
import UserInfo from "./userInfo";

const List = () => {
  return (
    <div className="flex-1/4 flex flex-col">
      <UserInfo />
      <ChatList />
    </div>
  );
};

export default List;
