import React from "react";



const ChatMessages = () =>{
<>
    <div className="chat-messages">
    {messages.map((message) => (
      <div key={message.id} className={`message ${message.type}`}>
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

</>



}

export default ChatMessages ;