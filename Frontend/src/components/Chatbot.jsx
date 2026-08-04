import { useMemo, useState } from "react";
import api from "../services/api";

const quickPrompts = [
  "Summarize this month's spending",
  "Which category is highest?",
  "Am I close to my budget?",
];

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I can answer questions about your expenses, categories, budgets, and spending patterns.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const isLoggedIn = useMemo(() => Boolean(localStorage.getItem("token")), []);

  if (!isLoggedIn) {
    return null;
  }

  const sendMessage = async (text = input) => {
    const trimmedMessage = text.trim();

    if (!trimmedMessage || isLoading) {
      return;
    }

    const nextMessages = [
      ...messages,
      { role: "user", content: trimmedMessage },
    ];

    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await api.post("/chat", {
        message: trimmedMessage,
        history: nextMessages.slice(-8),
      });

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          content: res.data.answer,
        },
      ]);
    } catch (error) {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          content:
            error.response?.data?.message ||
            "I could not reach the assistant right now.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot">
      {isOpen && (
        <section className="chatbot-panel" aria-label="Expense assistant">
          <header className="chatbot-header">
            <div className="chatbot-title">
              <img src="/bot-avatar.svg" alt="" aria-hidden="true" />
              <h3>Expense Assistant</h3>
            </div>
            <button
              className="chatbot-icon-button"
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close assistant"
              title="Close"
            >
              x
            </button>
          </header>

          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div
                className={`chatbot-message chatbot-message-${message.role}`}
                key={`${message.role}-${index}`}
              >
                <p>{message.content}</p>
              </div>
            ))}
            {isLoading && (
              <div className="chatbot-message chatbot-message-assistant">
                <p>Thinking...</p>
              </div>
            )}
          </div>

          <div className="chatbot-prompts">
            {quickPrompts.map((prompt) => (
              <button
                type="button"
                key={prompt}
                onClick={() => sendMessage(prompt)}
                disabled={isLoading}
              >
                {prompt}
              </button>
            ))}
          </div>

          <form
            className="chatbot-form"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about your spending..."
              aria-label="Ask the expense assistant"
            />
            <button type="submit" disabled={isLoading || !input.trim()}>
              Send
            </button>
          </form>
        </section>
      )}

      <button
        className="chatbot-launcher"
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label="Open expense assistant"
        title="Expense assistant"
      >
        <img src="/bot-avatar.svg" alt="" aria-hidden="true" />
      </button>
    </div>
  );
}

export default Chatbot;
