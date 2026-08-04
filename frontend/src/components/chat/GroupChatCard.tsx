import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import type { Conversation } from "@/types/chat";
import ChatCard from "./ChatCard";
import { cn } from "@/lib/utils";

const GroupChatCard = ({ convo }: { convo: Conversation }) => {
  const { user } = useAuthStore(); // lay thong tin nguoi dung
  const { activeConversationId, setActiveConversation, messages } =
    useChatStore(); // lay thong tin cuoc tro chuyen

  if (!user) return null;

  const unreadCount = convo.unreadCounts[user._id]; // dếm số tin nhắn chưa đọc của user
  const name = convo.group?.name ?? "";
  const lastMessage = convo.lastMessage?.content ?? ""; // lưu tin nhắn mới nhất

  // hàm xử lí khi người dùng click vào 1 conversation
  const handleSelectConversation = async (id: string) => {
    setActiveConversation(id);
    if (!messages[id]) {
      // todo : fetch message
    }
  };

  return (
    <ChatCard
      convoId={convo._id}
      name={name}
      timestamp={
        convo.lastMessage?.createdAt
          ? new Date(convo.lastMessage.createdAt)
          : undefined
      }
      isActive={activeConversationId === convo._id}
      onSelect={handleSelectConversation}
      unreadCount={unreadCount}
      leftSection={
        <>
          {/* {todoo : user avatar} */}
          {/* {todoo : status badge} */}
          {/* {todoo : unread count} */}
        </>
      }
      subtitle={
        <p className="text-sm truncate text-muted-foreground">
          {convo.participants.length} thành viên
        </p>
      }
    />
  );
};

export default GroupChatCard;
