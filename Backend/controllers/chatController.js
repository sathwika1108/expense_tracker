const Expense = require("../models/Expense");
const Budget = require("../models/Budget");

const MAX_CONTEXT_ITEMS = 18;
const DEFAULT_MODEL = "gpt-5";

const stopWords = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "how",
  "i",
  "in",
  "is",
  "it",
  "me",
  "my",
  "of",
  "on",
  "or",
  "show",
  "tell",
  "the",
  "to",
  "was",
  "what",
  "when",
  "where",
  "with",
  "you",
]);

const tokenize = (text = "") =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9.\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 1 && !stopWords.has(word));

const formatCurrency = (amount) => `Rs.${Number(amount || 0).toFixed(2)}`;

const monthName = (month) => {
  if (!month) return "Unknown month";
  const date = new Date(`${month}-01T00:00:00.000Z`);
  return Number.isNaN(date.getTime())
    ? month
    : date.toLocaleString("en-IN", { month: "long", year: "numeric" });
};

const buildDocuments = (expenses, budgets) => {
  const monthlyTotals = expenses.reduce((totals, expense) => {
    const month = expense.date
      ? new Date(expense.date).toISOString().slice(0, 7)
      : "unknown";
    totals[month] = (totals[month] || 0) + Number(expense.amount || 0);
    return totals;
  }, {});

  const categoryTotals = expenses.reduce((totals, expense) => {
    const category = expense.category || "Uncategorized";
    totals[category] = (totals[category] || 0) + Number(expense.amount || 0);
    return totals;
  }, {});

  const expenseDocs = expenses.map((expense) => {
    const date = expense.date
      ? new Date(expense.date).toLocaleDateString("en-IN")
      : "Unknown date";
    return {
      type: "expense",
      text: `Expense: ${expense.title}, amount ${formatCurrency(
        expense.amount
      )}, category ${expense.category}, date ${date}.`,
      date: expense.date,
      amount: Number(expense.amount || 0),
    };
  });

  const budgetDocs = budgets.map((budget) => {
    const spent = monthlyTotals[budget.month] || 0;
    const remaining = Number(budget.limit || 0) - spent;
    return {
      type: "budget",
      text: `Budget: ${monthName(budget.month)} limit ${formatCurrency(
        budget.limit
      )}, spent ${formatCurrency(spent)}, remaining ${formatCurrency(
        remaining
      )}.`,
      amount: Number(budget.limit || 0),
    };
  });

  const summaryDocs = [
    {
      type: "summary",
      text: `Overall summary: ${expenses.length} expenses, total spent ${formatCurrency(
        expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
      )}.`,
      amount: 0,
    },
    ...Object.entries(monthlyTotals).map(([month, total]) => ({
      type: "monthly-summary",
      text: `Monthly summary: ${monthName(month)} total spending ${formatCurrency(
        total
      )}.`,
      amount: total,
    })),
    ...Object.entries(categoryTotals).map(([category, total]) => ({
      type: "category-summary",
      text: `Category summary: ${category} total spending ${formatCurrency(
        total
      )}.`,
      amount: total,
    })),
  ];

  return [...summaryDocs, ...budgetDocs, ...expenseDocs];
};

const retrieveContext = (question, documents) => {
  const queryTokens = tokenize(question);

  return documents
    .map((document) => {
      const documentText = document.text.toLowerCase();
      const keywordScore = queryTokens.reduce(
        (score, token) => score + (documentText.includes(token) ? 3 : 0),
        0
      );
      const recencyScore = document.date
        ? Math.max(
            0,
            2 -
              (Date.now() - new Date(document.date).getTime()) /
                (1000 * 60 * 60 * 24 * 45)
          )
        : 0;
      const amountScore = question.toLowerCase().includes("highest")
        ? document.amount / 10000
        : 0;

      return {
        ...document,
        score: keywordScore + recencyScore + amountScore,
      };
    })
    .sort((first, second) => second.score - first.score)
    .slice(0, MAX_CONTEXT_ITEMS)
    .map((document) => document.text);
};

const buildFallbackAnswer = (question, context) => {
  const loweredQuestion = question.toLowerCase();

  if (context.length === 0) {
    return "I could not find matching expense or budget records yet. Add expenses and budgets first, then ask me about totals, categories, budgets, or trends.";
  }

  if (
    loweredQuestion.includes("summary") ||
    loweredQuestion.includes("overview") ||
    loweredQuestion.includes("total")
  ) {
    return `Here is the summary from your records:\n\n${context
      .slice(0, 6)
      .map((item) => `- ${item}`)
      .join("\n")}`;
  }

  if (
    loweredQuestion.includes("highest") ||
    loweredQuestion.includes("most") ||
    loweredQuestion.includes("category")
  ) {
    return `These are the most relevant spending details I found:\n\n${context
      .slice(0, 6)
      .map((item) => `- ${item}`)
      .join("\n")}`;
  }

  if (
    loweredQuestion.includes("budget") ||
    loweredQuestion.includes("limit") ||
    loweredQuestion.includes("remaining")
  ) {
    return `Here is what I found about your budget and spending:\n\n${context
      .slice(0, 6)
      .map((item) => `- ${item}`)
      .join("\n")}`;
  }

  return `${context
    .slice(0, 6)
    .map((item) => `- ${item}`)
    .join("\n")}`;
};

const askOpenAI = async ({ question, context, history }) => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const recentHistory = Array.isArray(history) ? history.slice(-6) : [];

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      instructions:
        "You are a helpful financial assistant inside an expense tracker. Use the retrieved context as the source of truth. If the answer is not in the context, say what data is missing. Give practical, concise advice and never invent transactions.",
      input: [
        {
          role: "user",
          content: `Recent conversation:\n${recentHistory
            .map((message) => `${message.role}: ${message.content}`)
            .join("\n")}\n\nRetrieved expense and budget context:\n${context
            .map((item, index) => `${index + 1}. ${item}`)
            .join("\n")}\n\nUser question: ${question}`,
        },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "OpenAI request failed");
  }

  return data.output_text || "I could not generate a response.";
};

const chatWithAssistant = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const [expenses, budgets] = await Promise.all([
      Expense.find({ user: req.user._id }).sort({ date: -1 }).limit(250),
      Budget.find({ user: req.user._id }).sort({ month: -1 }).limit(36),
    ]);

    const documents = buildDocuments(expenses, budgets);
    const context = retrieveContext(message, documents);
    let llmAnswer = null;
    let llmError = null;

    try {
      llmAnswer = await askOpenAI({
        question: message.trim(),
        context,
        history,
      });
    } catch (error) {
      llmError = error.message;
      console.error("Chat LLM error:", error.message);
    }

    return res.json({
      answer: llmAnswer || buildFallbackAnswer(message, context),
      sources: context.slice(0, 6),
      model: llmAnswer ? process.env.OPENAI_MODEL || DEFAULT_MODEL : "local-rag-fallback",
      warning: llmError
        ? "The LLM provider could not be reached, so a local RAG fallback was used."
        : undefined,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { chatWithAssistant };
