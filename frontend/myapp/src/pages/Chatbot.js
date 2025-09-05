import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [listening, setListening] = useState(false);
  const chatRef = useRef(null);
  const recognitionRef = useRef(null);

  const sendMessage = useCallback(async (msg = userInput) => {
    if (!msg.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: msg }];
    setMessages(newMessages);
    setUserInput('');
    setLoading(true);
    setExpanded(true);

    try {
      const response = await axios.post('http://127.0.0.1:8000/web/chat/', {
        message: msg, 
      });
      setMessages([
        ...newMessages,
        { sender: 'bot', text: response.data.reply },
      ]);
    } catch (error) {
      setMessages([
        ...newMessages,
        { sender: 'bot', text: '⚠️ Something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [messages, userInput]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        sendMessage(transcript);
      };

      recognitionRef.current.onend = () => {
        setListening(false);
      };

      recognitionRef.current.onerror = (e) => {
        if (e.error !== 'aborted') {
          alert('Voice recognition error: ' + e.error);
        }
        setListening(false);
      };
    } else {
      alert('Your browser does not support Speech Recognition.');
    }
  }, [sendMessage]);

  const handleVoiceInput = () => {
    
    if (!recognitionRef.current) return;

    if (!listening) {
      const clickSound = document.getElementById("clickSound");
      clickSound.currentTime = 0;
      clickSound.play();
      recognitionRef.current.start();
      setListening(true);
    } else {
      
      recognitionRef.current.abort();
      setListening(false);
    }
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        .main-content {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%);
          margin: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          min-height: 100vh;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        .main-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 80%, rgba(0, 191, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(0, 255, 153, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(255, 77, 77, 0.05) 0%, transparent 50%);
          pointer-events: none;
          z-index: 1;
        }

        .main-content > * {
          position: relative;
          z-index: 2;
        }

        .top-bar {
          display: flex;
          align-items: center;
          padding: 10px;
          margin-bottom: 20px;
          width: 100%;
          max-width: 700px;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
        }

        .top-bar img {
          width: 70px;
          height: 70px;
          margin-right: 30px;
        }

        .top-bar span {
          color: white;
          font-weight: bold;
          font-size: 60px;
          margin-left: 20px;
          font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
        }

        .logo_text {
          font-size: 60px;
          display: inline-flex;
          background: linear-gradient(45deg, #00bfff, #00ff99);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          transition: all 0.3s ease;
          animation: logoGlow 2s ease-in-out infinite alternate;
        }

        @keyframes logoGlow {
          from { filter: drop-shadow(0 0 20px rgba(0, 191, 255, 0.5)); }
          to { filter: drop-shadow(0 0 30px rgba(0, 255, 153, 0.5)); }
        }

        .logo_text::before {
          content: "FINANCOGRAM";
          position: absolute;
          width: 0%;
          height: 100%;
          color: rgba(255, 255, 255, 0.2);
          overflow: hidden;
          border-right: 4px solid rgba(255, 255, 255, 0.6);
          transition: 1s ease-in-out;
        }

        .logo_text:hover::before {
          width: 100%;
          filter: drop-shadow(0 0 5px rgb(255, 255, 255));
        }

        .logo_text:hover {
          transform: scale(1.05);
          filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
        }

        .chatbot-container {
          width: 100%;
          max-width: 700px;
          background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
          border-radius: 36px;
          box-shadow: 0 0 25px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
          font-family: 'Segoe UI', sans-serif;
          transition: all 0.3s ease;
          border: 2px solid rgba(0, 191, 255, 0.2);
          overflow: hidden;
          backdrop-filter: blur(20px);
          position: relative;
        }

        .chatbot-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, rgba(0, 191, 255, 0.05), rgba(0, 255, 153, 0.05));
          pointer-events: none;
          z-index: 1;
        }

        .chatbot-container > * {
          position: relative;
          z-index: 2;
        }

        .chatbot-container:hover {
          border-color: rgba(187, 187, 187, 0.3);
          box-shadow: 0 0 25px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .chat-window {
          padding: 15px;
          overflow-y: auto;
          background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
          transition: all 0.3s ease;
          border-top-left-radius: 36px;
          border-top-right-radius: 36px;
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 191, 255, 0.5) rgba(26, 26, 26, 0.5);
          position: relative;
        }

        .chat-window::-webkit-scrollbar {
          width: 8px;
        }

        .chat-window::-webkit-scrollbar-track {
          background: #303030;
          border-radius: 4px;
        }

        .chat-window::-webkit-scrollbar-thumb {
          background: #424242;
          border-radius: 4px;
        }

        .chat-window::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        .chat-window.collapsed {
          height: 60px;
          padding: 0 15px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chat-window.expanded {
          height: 290px;
          overflow-y: scroll;
        }

        .placeholder-text {
          color: #bbb;
          font-style: italic;
          padding: 15px;
          text-align: center;
          font-size: 16px;
          animation: fadeIn 0.5s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .message {
          max-width: 80%;
          padding: 12px 16px;
          margin: 10px 0;
          border-radius: 18px;
          line-height: 1.5;
          font-size: 15px;
          word-break: break-word;
          box-shadow: 0 0px 5px rgba(0, 0, 0, 0.3);
          font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
          font-size: 18px;
          animation: messageSlideIn 0.3s ease-out;
          transition: all 0.2s ease;
        }

        @keyframes messageSlideIn {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        .message:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }

        .message.user {
          background: linear-gradient(135deg, #00bfff, #00ff99);
          color: #000;
          align-self: flex-end;
          margin-left: auto;
          border-bottom-right-radius: 4px;
          position: relative;
          box-shadow: 0 4px 15px rgba(0, 191, 255, 0.3);
        }

        .message.user::before {
          content: '';
          position: absolute;
          right: -8px;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-left: 8px solid #00bfff;
          border-top: 8px solid transparent;
          border-bottom: 8px solid transparent;
        }

        .message.bot {
          background: linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%);
          color: #ffffff;
          align-self: flex-start;
          margin-right: auto;
          border-bottom-left-radius: 4px;
          position: relative;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(0, 191, 255, 0.2);
        }

        .message.bot::before {
          content: '';
          position: absolute;
          left: -8px;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-right: 8px solid #2a2a2a;
          border-top: 8px solid transparent;
          border-bottom: 8px solid transparent;
        }

        .input-area {
          display: flex;
          padding: 15px;
          background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
          border-top: 2px solid rgba(0, 191, 255, 0.3);
          border-bottom-left-radius: 36px;
          border-bottom-right-radius: 36px;
          gap: 10px;
          align-items: center;
          position: relative;
        }

        .input-area::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0, 191, 255, 0.5), transparent);
        }

        .input-area input {
          flex: 1;
          padding: 12px 15px;
          font-size: 15px;
          border-radius: 24px;
          outline: none;
          border: 2px solid rgba(0, 191, 255, 0.3);
          background: rgba(26, 26, 26, 0.8);
          color: white;
          transition: all 0.3s ease;
          min-width: 0;
          backdrop-filter: blur(10px);
        }

        .input-area input:focus {
          border: 2px solid #00bfff;
          box-shadow: 0 0 15px rgba(0, 191, 255, 0.3);
          transform: scale(1.02);
          background: rgba(26, 26, 26, 0.9);
        }

        .input-area input:hover {
          border-color: rgba(187, 187, 187, 0.5);
        }

        .input-area input::placeholder {
          color: #bbb;
          font-style: italic;
          transition: opacity 0.3s ease;
        }

        .input-area input:focus::placeholder {
          opacity: 0.7;
        }

        .input-area button {
          padding: 12px 20px;
          border: none;
          border-radius: 50%;
          background: linear-gradient(135deg, #00bfff, #00ff99);
          color: #000;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 44px;
          min-height: 44px;
          box-shadow: 0 4px 15px rgba(0, 191, 255, 0.3);
        }

        .input-area button:hover {
          background: linear-gradient(135deg, #00ff99, #00bfff);
          transform: scale(1.1);
          box-shadow: 0 8px 25px rgba(0, 191, 255, 0.4);
        }

        .input-area button:active {
          transform: scale(0.95);
        }



        .voice-button {
          margin-left: 10px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff4d4d, #ff6b6b);
          font-size: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 44px;
          min-height: 44px;
          color: #ffffff;
          box-shadow: 0 4px 15px rgba(255, 77, 77, 0.3);
        }

        .voice-button:hover {
          background: linear-gradient(135deg, #ff6b6b, #ff4d4d);
          transform: scale(1.1);
          box-shadow: 0 8px 25px rgba(255, 77, 77, 0.4);
        }

        .voice-button.listening {
          animation: pulse 0.6s infinite;
          background: linear-gradient(135deg, #4CAF50, #45a049);
          color: white;
          transform: scale(1.1);
          box-shadow: 0 0 20px rgba(76, 175, 80, 0.5);
        }

        .voice-button.listening:hover {
          background: linear-gradient(135deg, #45a049, #4CAF50);
          transform: scale(1.15);
          box-shadow: 0 0 25px rgba(76, 175, 80, 0.6);
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
          }
          80% {
            box-shadow: 0 0 0 15px rgba(76, 175, 80, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
          }
        }

        /* Enhanced thinking animation */
        .thinking-dots {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 8px 16px;
          background: linear-gradient(135deg, rgba(0, 191, 255, 0.1), rgba(0, 255, 153, 0.1));
          border-radius: 20px;
          border: 1px solid rgba(0, 191, 255, 0.3);
        }

        .thinking-dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00bfff, #00ff99);
          animation: thinkingBounce 1.4s infinite ease-in-out;
        }

        .thinking-dots span:nth-child(1) {
          animation-delay: 0s;
        }

        .thinking-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .thinking-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes thinkingBounce {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1.2);
            opacity: 1;
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .main-content {
            padding: 10px;
          }

          .top-bar {
            margin-bottom: 15px;
          }

          .logo_text {
            font-size: 40px;
          }

          .top-bar span {
            font-size: 40px;
          }

          .chatbot-container {
            border-radius: 24px;
          }

          .chat-window {
            border-top-left-radius: 24px;
            border-top-right-radius: 24px;
            padding: 12px;
          }

          .chat-window.expanded {
            height: 250px;
          }

          .input-area {
            padding: 12px;
            border-bottom-left-radius: 24px;
            border-bottom-right-radius: 24px;
            gap: 8px;
          }

          .input-area input {
            padding: 10px 12px;
            font-size: 14px;
          }

          .input-area button,
          .voice-button {
            padding: 8px 12px;
            min-width: 40px;
            min-height: 40px;
          }

          .message {
            font-size: 16px;
            padding: 10px 14px;
          }
        }

        @media (max-width: 480px) {
          .logo_text {
            font-size: 32px;
          }

          .top-bar span {
            font-size: 32px;
          }

          .chat-window.expanded {
            height: 200px;
          }

          .input-area {
            flex-wrap: wrap;
          }

          .input-area input {
            order: 1;
            width: 100%;
            margin-bottom: 8px;
          }

          .input-area button {
            order: 2;
          }

          .voice-button {
            order: 3;
            margin-left: 0;
          }

          .message {
            max-width: 90%;
            font-size: 15px;
          }
        }

        @media (max-width: 360px) {
          .logo_text {
            font-size: 28px;
          }

          .top-bar span {
            font-size: 28px;
          }

          .chat-window.expanded {
            height: 180px;
          }

          .input-area {
            padding: 10px;
          }

          .input-area input {
            padding: 8px 10px;
            font-size: 13px;
          }

          .input-area button,
          .voice-button {
            padding: 6px 10px;
            min-width: 36px;
            min-height: 36px;
          }
        }

        /* Enhanced Accessibility */
        .input-area button:focus,
        .voice-button:focus {
          outline: 2px solid #bbb;
          outline-offset: 2px;
        }

        .input-area input:focus {
          outline: none;
        }

        /* Smooth transitions for all interactive elements */
        * {
          transition: all 0.2s ease;
        }


      `}</style>

      <div className="top-bar">
        <h1 className="logo_text">FINANCOGRAM</h1>
        <span>AI</span>
      </div>

      <div className="chatbot-container">
        <div className={`chat-window ${expanded ? 'expanded' : 'collapsed'}`} ref={chatRef}>
          {!expanded && (
            <div className="placeholder-text">
              We are here to help you with your financial queries. Start chatting!
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
          {loading && (
            <div className="message bot">
              <span className="thinking-dots">
                <span>.</span><span>.</span><span>.</span>
              </span>
            </div>
          )}
        </div>

        <div className="input-area">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask your query here..."
            aria-label="Chat input"
          />
          <button 
            onClick={() => sendMessage()} 
            aria-label="Send message"
            title="Send message"
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>
          <button
            onClick={handleVoiceInput}
            className={`voice-button ${listening ? 'listening' : ''}`}
            title={listening ? 'Stop Listening' : 'Start Voice Input'}
            aria-label={listening ? 'Stop voice recognition' : 'Start voice recognition'}
          >
            <i className="fa-solid fa-microphone-lines"></i>
          </button>
          <audio id="clickSound" src='https://cdn.pixabay.com/audio/2025/03/14/audio_ca4a3becec.mp3' preload="auto"></audio>
        </div>
      </div>
    </>
  );
};

export default Chatbot;
