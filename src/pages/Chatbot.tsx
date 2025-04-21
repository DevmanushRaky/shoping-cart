import { useState, useEffect, useRef } from 'react';
import { askGemini, getChats, saveChats, createNewChat, Chat, ChatMessage } from '../services/chatService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { FiTrash2 } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';

const getTitleFromMessage = (msg: string) => {
  const words = msg.trim().split(/\s+/).slice(0, 8).join(' ');
  return words.length > 0 ? words + (msg.trim().split(/\s+/).length > 8 ? '...' : '') : 'New Chat';
};

// Helper to get a short title (max 3 words)
const getShortTitle = (title: string) => {
  const words = title.trim().split(/\s+/);
  return words.slice(0, 3).join(' ') + (words.length > 3 ? '...' : '');
};

const Chatbot = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chats on mount
  useEffect(() => {
    const loaded: Chat[] = getChats();
    setChats(loaded);
    if (loaded.length) setCurrentChatId(loaded[0].id);
    else {
      const newChat: Chat = createNewChat();
      setChats([newChat]);
      setCurrentChatId(newChat.id);
      saveChats([newChat]);
    }
  }, []);

  const currentChat = chats.find((c: Chat) => c.id === currentChatId);

  const sendMessage = async () => {
    if (!input.trim() || !currentChat) return;
    const userMsg: ChatMessage = { from: 'user', text: input, timestamp: Date.now() };
    setLoading(true);
    // Optimistically show the user message and 'Generating answer...'
    let updatedChats: Chat[] = chats.map((chat: Chat) => {
      if (chat.id === currentChatId) {
        let newTitle = chat.title;
        if (chat.title === 'New Chat' && chat.messages.length === 0) {
          newTitle = getTitleFromMessage(input);
        }
        return {
          ...chat,
          title: newTitle,
          messages: [...chat.messages, userMsg, { from: 'bot', text: 'Generating answer...', timestamp: Date.now() }]
        };
      }
      return chat;
    });
    setChats(updatedChats);
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 100);

    const answer = await askGemini(input);
    // Replace the last 'Generating answer...' with the real answer
    updatedChats = updatedChats.map((chat: Chat) => {
      if (chat.id === currentChatId) {
        const msgs = [...chat.messages];
        if (msgs.length > 0 && msgs[msgs.length - 1].from === 'bot' && msgs[msgs.length - 1].text === 'Generating answer...') {
          msgs[msgs.length - 1] = { from: 'bot', text: answer, timestamp: Date.now() };
        }
        return { ...chat, messages: msgs };
      }
      return chat;
    });
    setChats(updatedChats);
    saveChats(updatedChats);
    setLoading(false);
  };

  const handleNewChat = () => {
    const newChat: Chat = createNewChat('New Chat');
    const updatedChats: Chat[] = [newChat, ...chats];
    setChats(updatedChats);
    setCurrentChatId(newChat.id);
    saveChats(updatedChats);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleDeleteChat = (chatId: string) => {
    const filteredChats = chats.filter((chat) => chat.id !== chatId);
    let newCurrentChatId = currentChatId;
    if (chatId === currentChatId) {
      if (filteredChats.length > 0) {
        newCurrentChatId = filteredChats[0].id;
      } else {
        const newChat: Chat = createNewChat();
        filteredChats.push(newChat);
        newCurrentChatId = newChat.id;
      }
    }
    setChats(filteredChats);
    setCurrentChatId(newCurrentChatId);
    saveChats(filteredChats);
  };

  return (
    <div className="flex h-[80vh] bg-background rounded-lg shadow-lg overflow-hidden border border-border">
      {/* Sidebar */}
      <aside className="w-64 bg-muted border-r border-border flex flex-col">
        <Button
          variant="outline"
          className="m-4"
          onClick={handleNewChat}
        >
          + New Chat
        </Button>
        <ScrollArea className="flex-1">
          <ul className="space-y-1 px-2 overflow-visible">
            {chats.map((chat: Chat) => (
              <li key={chat.id} className="group relative flex items-center w-full">
                <div className="flex flex-row items-center w-full">
                  <Button
                    variant={chat.id === currentChatId ? 'default' : 'ghost'}
                    className={cn(
                      'flex-1 flex items-center min-w-0 justify-start rounded-r-none px-3 py-2',
                      chat.id === currentChatId && 'font-bold'
                    )}
                    onClick={() => setCurrentChatId(chat.id)}
                    title={chat.title}
                  >
                    <span className="truncate flex-1 text-left min-w-0">
                      {getShortTitle(chat.title)}
                    </span>
                  </Button>
                  {/* Show delete icon only for active chat */}
                  {chat.id === currentChatId && (
                    <button
                      className="flex items-center justify-center w-10 h-10 text-red-600 hover:bg-red-50 rounded transition ml-1"
                      title="Delete chat"
                      onClick={e => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this chat?')) {
                          handleDeleteChat(chat.id);
                        }
                      }}
                      type="button"
                      style={{ flexShrink: 0 }}
                    >
                      <FiTrash2 className="w-5 h-5 mx-auto" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </aside>
      {/* Chat Window */}
      <main className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-6 space-y-4">
          {currentChat?.messages.map((msg: ChatMessage, i: number) => (
            <div
              key={i}
              className={cn(
                'flex',
                msg.from === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'rounded-2xl px-4 py-2 max-w-[70%] break-words',
                  msg.from === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {msg.from === 'bot' ? (
                  <ReactMarkdown
                    components={{
                      strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                      em: ({node, ...props}) => <em className="italic" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc ml-5 my-2" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal ml-5 my-2" {...props} />,
                      li: ({node, ...props}) => <li className="mb-1" {...props} />,
                      p: ({node, ...props}) => <p className="mb-2" {...props} />,
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}
        </ScrollArea>
        <form
          className="flex items-center gap-2 p-4 border-t border-border"
          onSubmit={e => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1"
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            Send
          </Button>
        </form>
      </main>
    </div>
  );
};

export default Chatbot;