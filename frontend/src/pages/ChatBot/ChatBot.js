import React, { useState, useEffect, useRef } from 'react';
import { FaTelegram } from 'react-icons/fa';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import chatbotavatar from './../../assets/logos/logo_purple.png' ;
import useravatar from './../../assets/avatar.png' ;
import './ChatBot.css' ;
import Navbar from '../../component/navbar';
import Footer from '../../component/footer';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [progress, setProgress] = useState(0);
  const [userInput, setUserInput] = useState('');
  const messagesEndRef = useRef(null);
  const navigate = useNavigate (null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleChangeUserMessage = (event) => {
    setUserInput(event.target.value);
  };

  const addBotMessage = () => {
    const newMessage = {
      id: messages.length + 1,
      text: "weshbik yakho",
      type: 'bot',
      avatar : chatbotavatar
    };
    setMessages(prev => [...prev, newMessage]);
    setProgress(prev => Math.min(prev + 20, 100));
    if (progress == 100)
    {
      navigate('/RecommendationPage')
    }

  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: userInput,
      type: 'user',
      avatar : useravatar
    };
    setMessages(prev => [...prev, userMessage]);
    setUserInput(''); // Clear input

    // Add bot reply after a small delay
    setTimeout(addBotMessage, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className='display_flex flex-column '>
    <div className='position-relative'><Navbar /></div>

    
    <div className="chat-container">
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${progress}%` }} /><div/>
      </div>
      
      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            <img src={message.avatar} alt="Message avatar" />
            <div className={`message-content  ${message.type}`}>
              {message.text}
            </div>
            
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
  
      <form onSubmit={handleSubmit} className="input-form">
        <div className="chat-input">
          <input
            type="text"
            value={userInput}
            onChange={handleChangeUserMessage}
            onKeyPress={handleKeyPress}
            placeholder="décrire vos symptômes..."
            className="message-input"
          />
          <button type="submit" className="send-button">
            <FaTelegram className="send-icon" />
          </button>
        </div>
      </form>
   
    </div> 
    <Footer />
    </div>
  );
}
  export default ChatInterface ;




// export const  PromptInput = () => {
//   const [focused, setFocused] = useState(false);
//   const [value, setValue] = useState('');

//   return (
//     <div className="max-w-xl w-full mx-auto relative">
//       <div
//         className={`
//           flex items-center 
//           bg-[#40CBC4] 
//           rounded-lg 
//           overflow-hidden 
//           transition-all 
//           duration-200
//           ${focused ? 'ring-2 ring-[#35ABA4]' : ''}
//         `}
//       >
//         {/* <div className="px-4">
//           <input className="w-5 h-5 text-white" />
//         </div> */}
        
//         <input
//           type="text"
//           placeholder="Search..."
//           value={value}
//           onChange={(e) => setValue(e.target.value)}
//           onFocus={() => setFocused(true)}
//           onBlur={() => setFocused(false)}
//           className="
//             w-full 
//             py-3 
//             px-2 
//             bg-transparent 
//             text-white 
//             placeholder-white 
//             outline-none
//             border-none
//           "
//         />
        
//         <button 
//           className="
//             px-4 
//             h-full 
//             flex 
//             items-center 
//             hover:bg-[#35ABA4] 
//             transition-colors
//           "
//         >
//           <ChevronRight className="w-5 h-5 text-white" />
//         </button>
//       </div>
//     </div>
//   );
// };

