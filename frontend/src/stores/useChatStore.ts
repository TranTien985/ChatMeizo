import { chatService } from "@/services/chatServices";
import type { ChatState } from "@/types/store";
import { create } from "zustand";
import { persist } from "zustand/middleware"; // để khi load lại vẫn giữ nguyên trạng thái theme
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: {},
      activeConversationId: null,
      convoLoading: false, // convo loading
      messageLoading: false,

      setActiveConversation: (id) => set({ activeConversationId: id }),
      reset: () => {
        set({
          conversations: [],
          messages: {},
          activeConversationId: null,
          convoLoading: false,
          messageLoading: false,
        });
      },
      fetchConversations: async () => {
        try {
          set({ convoLoading: true }); // đang tải dữ liệu
          const { conversations } = await chatService.fetchConversations();

          set({ conversations, convoLoading: false });
        } catch (error) {
          console.error("Lỗi xảy ra khi fetchConversations", error);
          set({ convoLoading: false });
        }
      },
      fetchMessages: async (ConversationId) => {
        // lấy dữ liệu từ store
        const { activeConversationId, messages } = get();
        const { user } = useAuthStore.getState();

        const convoId = ConversationId ?? activeConversationId;

        if (!convoId) return;
        const current = messages?.[convoId]; // lấy dữ liệu tin nhắn hiện tại
        const nextCursor =
          current?.nextCursor === undefined ? "" : current?.nextCursor; // lấy cursor tiếp theo

        if (nextCursor === null) return; // nếu hết dữ liệu thì sẽ dừng

        // lấy tin nhắn mới, bật loading
        set({ messageLoading: true });

        try {
          const { messages: fetched, cursor } = await chatService.fetchMessages(
            convoId,
            nextCursor,
          );

          // phân biệt là tin nhắn gửi đi của user này hay không
          const processed = fetched.map((m) => ({
            ...m,
            isOwn: m.senderId === user?._id,
          }));

          // cập nhật store
          set((state) => {
            const prev = state.messages[convoId]?.items ?? [];
            const merged =
              prev.length > 0 ? [...processed, ...prev] : processed;
            // đây là ghép dữ liệu từ những tin nhắn cũ hơn ghép với tin nhắn mới khi phân trang

            return {
              messages: {
                ...state.messages,
                [convoId]: {
                  items: merged,
                  hasMore: !!cursor,
                  nextCursor: cursor ?? null,
                },
              },
            };
          });
        } catch (error) {
          console.error("Lỗi xảy ra khi fetchMessages:", error);
        } finally {
          set({ messageLoading: false });
        }
      },
      sendDirectMessage: async (recipientId, content, imgUrl) => {
        try {
          const { activeConversationId } = get();
          await chatService.sendDirectMessage(
            recipientId,
            content,
            imgUrl,
            activeConversationId || undefined,
          );
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === activeConversationId ? { ...c, seenBy: [] } : c,
            ),
          }));
        } catch (error) {
          console.error("Lỗi xảy ra khi gửi direct message", error);
        }
      },
      sendGroupMessage: async (conversationId, content, imgUrl) => {
        try {
          await chatService.sendGroupMessage(conversationId, content, imgUrl);
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === get().activeConversationId ? { ...c, seenBy: [] } : c,
            ),
          }));
        } catch (error) {
          console.error("Lỗi xảy ra gửi group message", error);
        }
      },

      addMessage: async (message) => {
        try {
          const { user } = useAuthStore.getState();
          const { fetchMessages } = get();

          message.isOwn = message.senderId === user?._id;

          const convoId = message.conversationId;

          let prevItems = get().messages[convoId]?.items ?? []; // nếu nhấn vào hội thoại thì sẽ hiển thị cả tn cũ, còn ko nhấn vào thì sẽ chỉ hiển thị tin nhắn mới nhất thôi

          if (prevItems.length === 0) {
            await fetchMessages(message.conversationId);
            prevItems = get().messages[convoId]?.items ?? [];
          }

          set((state) => {
            if (prevItems.some((m) => m._id === message._id)) {
              return state;
            }

            return {
              messages: {
                ...state.messages,
                [convoId]: {
                  items: [...prevItems, message],
                  hasMore: state.messages[convoId].hasMore,
                  nextCursor: state.messages[convoId].nextCursor ?? undefined,
                },
              },
            };
          });
        } catch (error) {
          console.error("Lỗi xảy khi ra add message:", error);
        }
      },

      updateConversation: (conversation) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c._id === conversation._id ? { ...c, ...conversation } : c,
          ),
        }));
      },
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({ conversations: state.conversations }),
    },
  ),
);
