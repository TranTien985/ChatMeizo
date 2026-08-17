import { cn, formatMessageTime } from "@/lib/utils";
import type { Conversation, Message, Participant } from "@/types/chat";
import UserAvatar from "./UserAvatar";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";

interface MessageItemProps {
  message: Message;
  index: number;
  messages: Message[];
  selectedConvo: Conversation;
  lastMessageStatus: "delivered" | "seen";
}

const MessageItem = ({
  message,
  index,
  messages,
  selectedConvo,
  lastMessageStatus,
}: MessageItemProps) => {
  // Tin nhắn ngay trước message hiện tại
  const prev = index > 0 ? messages[index - 1] : undefined;

  // Kiểm tra khoảng cách giữa message hiện tại
  // và message trước đó
  const timeDiff = prev
    ? new Date(message.createdAt).getTime() - new Date(prev.createdAt).getTime()
    : Infinity;

  // Hiển thị thời gian nếu:
  // - Đây là tin nhắn đầu tiên
  // - Hoặc cách tin nhắn trước hơn 5 phút
  const isShowTime = !prev || timeDiff > 5 * 60 * 1000;

  // Tách nhóm khi:
  // - Cách nhau hơn 5 phút
  // - Hoặc người gửi thay đổi
  const isGroupBreak = isShowTime || message.senderId !== prev?.senderId;

  const participant = selectedConvo.participants.find(
    (p: Participant) => p._id.toString() === message.senderId.toString(),
  );

  return (
    <div
      className={cn(
        "flex gap-2 message-bounce mt-1",
        message.isOwn ? "justify-end" : "justify-start",
      )}
    >
      {/* Avatar */}
      {!message.isOwn && (
        <div className="w-8">
          {isGroupBreak && (
            <UserAvatar
              type="chat"
              name={participant?.displayName ?? "Moji"}
              avatarUrl={participant?.avatarUrl ?? undefined}
            />
          )}
        </div>
      )}

      {/* Tin nhắn */}
      <div
        className={cn(
          "max-w-xs lg:max-w-md space-y-1 flex flex-col",
          message.isOwn ? "items-end" : "items-start",
        )}
      >
        {/* Bubble */}
        <Card
          className={cn(
            "p-3",
            message.isOwn
              ? "chat-bubble-sent border-0"
              : "chat-bubble-received",
          )}
        >
          <p className="text-sm leading-relaxed break-words">
            {message.content}
          </p>
        </Card>

        {/* Thời gian */}
        {isShowTime && (
          <span className="text-xs text-muted-foreground px-1">
            {formatMessageTime(new Date(message.createdAt))}
          </span>
        )}

        {/* Seen / Delivered */}
        {message.isOwn && message._id === selectedConvo.lastMessage?._id && (
          <Badge
            variant="outline"
            className={cn(
              "text-xs px-1.5 py-0.5 h-4 border-0",
              lastMessageStatus === "seen"
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground",
            )}
          >
            {lastMessageStatus}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
