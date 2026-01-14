import React, { useState } from 'react'
import './style/ChatBot.css'
import mascotte from '../../media/mascotte.svg'

function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Bonjour! 👋 Je suis BuddyCoach, votre assistant IA. Comment puis-je vous aider?",
      sender: 'bot'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const toggleChat = () => {
    setIsOpen(!isOpen)
    setError(null)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    // Ajouter le message de l'utilisateur
    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user'
    }
    setMessages([...messages, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      // Appel à l'API backend
                  const response = await fetch('/api/chatbot/chat', {        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la communication avec le chatbot')
      }

      // Ajouter la réponse du bot
      const botResponse = {
        id: messages.length + 2,
        text: data.reply,
        sender: 'bot'
      }
      setMessages(prev => [...prev, botResponse])
    } catch (err) {
      console.error('Erreur:', err)
      setError(err.message)
      
      // Ajouter un message d'erreur
      const errorMessage = {
        id: messages.length + 2,
        text: `❌ ${err.message}`,
        sender: 'bot'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button 
        className="chatbot-icon"
        onClick={toggleChat}
        title="Ouvrir l'assistant BuddyCoach"
      >
        <img src={mascotte} alt="Mascotte BuddyCoach" className="chatbot-mascotte-icon" />
      </button>

      {/* Fenêtre du chat */}
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <h3>BuddyCoach Assistant IA</h3>
            <button 
              className="close-btn"
              onClick={toggleChat}
            >
              ✕
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                <div className="message-content">
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message bot">
                <div className="message-content typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="chatbot-input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question..."
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
            >
              Envoyer
            </button>
          </form>
        </div>
      )}
    </>
  )
}

export default ChatBot
