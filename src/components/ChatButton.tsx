// src/components/ChatButton.tsx
import { BsFillChatSquareTextFill } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';

const ChatButton = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('/chatbot')}
      className="fixed bottom-6 right-6 rounded-full w-14 h-14 flex items-center justify-center shadow-lg z-50
        bg-black text-white
        dark:bg-white dark:text-black
        transition-colors duration-200"
      aria-label="Chat with assistant"
      style={{ border: 'none', fontSize: 28, cursor: 'pointer' }}
    >
      <BsFillChatSquareTextFill />
    </button>
  );
};

export default ChatButton;