export const updateConversationAfterCreateMessage = (
  conversation,
  message,
  senderId,
) => {
  conversation.set({
    seenBy: [], // khi có tin nhắn mới thì trạng thái sẽ là chưa xem
    lastMessageAt: message.createdAt, // gán thời gian tin nhắn cuối thành tin nhắn vừa tạo
    lastMessage: {
      // lưu cache tin nhắn cuối sẽ có các trường tương ứng
      _id: message._id,
      content: message.content,
      senderId,
      lastMessageAt: message.createdAt,
    },
  });

  // hàm này mục đích để đếm xem có bao nhiêu tin nhắn chưa seen
  conversation.participants.forEach((p) => {
    const memberId = p.userId.toString(); // id thường là dạng ObjectId nên ta cần chuyển sang string để dùng map để so sánh
    const isSender = memberId === senderId.toString(); // kiểm tra xem thành viên này có phải người gửi tin nhắn không
    const prevCount = conversation.unreadCount.get(memberId) || 0; // lấy số lượng tin nhắn chưa đọc của member trong biến undreadCount
    conversation.unreadCount.set(memberId, isSender ? 0 : prevCount + 1); //cập nhật số lượng tin chưa đọc mới vào Map
    // nếu isSender = true: là người gửi thì gán = 0
    // nếu isSender = false: gán prevCount + 1
  });
};

export const emitNewMessage = (io, conversation, message) => {
  io.to(conversation._id.toString()).emit("new-message", {
    message,
    conversation: {
      _id: conversation._id,
      lastMessage: conversation.lastMessage,
      lastMessageAt: conversation.lastMessageAt,
    },
    unreadCounts: conversation.unreadCounts,
  }); // gửi sự kiện newMessage đến tất cả các client trong phòng chat
};
