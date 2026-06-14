import { useState } from "react";
import {
  Brain,
  Calculator,
  ArrowUpRight,
  Info,
  AlertCircle,
  Loader2
} from "lucide-react";
import { AI_BASE } from "../api";

function AILabsPage({ currentUser, triggerToast }) {
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState(() => {
    return `### 🔮 Welcome to SplitSmart AI Labs!

I am your proactive co-pilot for financial division of shared accounts, powered by **Google Gemini AI**. Here's what we can accomplish here:
*   **Audit Saved Accounts:** Run compliance checks on your logged items.
*   **Draft Split Strategies:** Enter tricky scenarios such as unequal hotel nights, shared rental cars, or wine exclusions.
*   **Resolve Heuristics:** Input conversational values (e.g. "Priya paid 1500, Rohan paid 500") to calculate optimal transfer pathways immediately.

Select one of the **interactive quick-scenarios below** or type your own question to test the AI!`;
  });
  const [aiLoading, setAiLoading] = useState(false);

  const handleAIQuery = async (queryText) => {
    if (!queryText.trim()) {
      triggerToast("Tell me what you bought or paid for!");
      return;
    }
    setAiLoading(true);
    triggerToast("Querying Gemini AI engine...");
    try {
      const response = await fetch(`${AI_BASE}/api/ai-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryText }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "AI server returned an error.");
      }
      const data = await response.json();
      setAiResponse(data.response || "No response generated.");
      triggerToast("AI analysis complete!");
    } catch (err) {
      console.error("AI query failed:", err);
      setAiResponse(`### ⚠️ AI Query Failed\n\n${err.message}\n\nMake sure the FastAPI AI server is running on port 8000:\n\`\`\`\ncd ai && python -m uvicorn api.main:app --port 8000\n\`\`\``);
      triggerToast(`AI Error: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div
      id="ai-labs-container"
      className="space-y-8 animate-fade-in text-left max-w-7xl mx-auto px-4 md:px-12 py-4"
    >
      {/* Main Top Header */}
      <div
        id="ai-labs-banner"
        className="bg-gradient-to-r from-indigo-950/40 via-neutral-950 to-indigo-950/40 border border-neutral-900 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-0 bottom-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-2.5 max-w-2xl text-left">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-amber-400" />
            <span className="text-[10px] font-mono text-amber-400 font-extrabold uppercase tracking-widest bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
              SplitSmart Co-Pilot AI — Gemini Powered
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            AI Optimization & Compliance Audit Desk
          </h2>
          <p className="text-xs text-neutral-400 leading-relaxed font-light font-sans">
            Leverage Google Gemini AI for intelligent expense splitting. Test conversational split queries, audit your stored reports for discrepancies, and get mathematically optimal settlement paths instantly.
          </p>
        </div>

        <div
          className="bg-neutral-900/80 border border-neutral-800 p-5 rounded-2xl text-center shadow-lg min-w-[140px] shrink-0"
          id="compliance-widget"
        >
          <span className="text-[9px] font-mono text-zinc-500 uppercase font-bold block">
            AI Engine
          </span>
          <div className="text-xl font-extrabold text-emerald-400 tracking-tight mt-1">
            Gemini 2.0
          </div>
          <div className="text-[9px] font-mono text-zinc-400 mt-1 uppercase font-semibold">
            Flash Model Active
          </div>
        </div>
      </div>

      {/* Core Interactive Sandbox AI Area */}
      <div
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        id="ai-interaction-workspace"
      >
        {/* Left COLUMN: Query input */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-zinc-950 border border-neutral-900 p-5 rounded-2xl space-y-4 shadow-md text-left">
            <span className="text-xs font-mono text-zinc-400 font-bold uppercase tracking-wider block">
              Gemini AI Terminal
            </span>

            <div className="space-y-3">
              <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">
                Describe your split challenge
              </span>
              <textarea
                id="textarea-ai-query"
                rows={4}
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAIQuery(aiQuery);
                  }
                }}
                placeholder="e.g. Priya and Rohan stayed 3 nights. Kabir stayed 2 nights. Total stay cost ₹9000. Find pro-rata nightly allocations..."
                className="w-full bg-neutral-900 border border-neutral-800 p-3.5 rounded-xl text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-indigo-500 font-mono focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                id="btn-trigger-ai-query"
                style={{ minHeight: "44px" }}
                onClick={() => handleAIQuery(aiQuery)}
                disabled={aiLoading}
                className="flex-1 py-2.5 bg-white text-black hover:bg-neutral-200 disabled:opacity-50 font-extrabold text-xs tracking-wider uppercase rounded-xl cursor-pointer transition-all flex items-center justify-center space-x-1"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    <span>Thinking...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-1 text-black" />
                    <span>Query Gemini AI</span>
                  </>
                )}
              </button>

              <button
                id="btn-reset-ai-query"
                style={{ minHeight: "44px" }}
                type="button"
                onClick={() => {
                  setAiQuery("");
                  setAiResponse(`### 🔮 Welcome back!\n\nWaiting for a custom query. Select one of the preset scenarios below or type your own question.`);
                  triggerToast("AI desk reset.");
                }}
                className="px-4 py-2 bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white rounded-xl transition-all cursor-pointer font-mono text-xs font-bold"
                title="Reset Terminal"
              >
                Reset
              </button>
            </div>

            {/* Scenarios Preset Library */}
            <div
              className="space-y-2.5 pt-3 border-t border-neutral-900/60"
              id="ai-demos-scenarios"
            >
              <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">
                Quick AI Presets
              </span>

              <div className="space-y-2">
                <button
                  id="preset-scenario-stay"
                  style={{ minHeight: "44px" }}
                  onClick={() => {
                    const q =
                      "We rented an Airbnb for ₹9000. Dev and Ananya stayed 3 nights, Kabir stayed 2 nights. Show weighted nightly split strategy.";
                    setAiQuery(q);
                    handleAIQuery(q);
                  }}
                  className="w-full text-left p-3.5 bg-neutral-900/30 hover:bg-neutral-900 border border-neutral-900 hover:border-neutral-800 rounded-xl transition-all cursor-pointer text-xs flex justify-between items-center group"
                >
                  <span className="text-zinc-350 truncate max-w-[220px]">
                    🌌 Weighted Airbnb Night stay
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                </button>

                <button
                  id="preset-scenario-gas"
                  style={{ minHeight: "44px" }}
                  onClick={() => {
                    const q =
                      "Dev paid ₹900 for vehicle gas on our roadtrip, Ananya paid ₹1500 adventure packages. Add maintenance adjustment of ₹400 to Dev driver bonus.";
                    setAiQuery(q);
                    handleAIQuery(q);
                  }}
                  className="w-full text-left p-3.5 bg-neutral-900/30 hover:bg-neutral-900 border border-neutral-900 hover:border-neutral-800 rounded-xl transition-all cursor-pointer text-xs flex justify-between items-center group"
                >
                  <span className="text-zinc-350 truncate max-w-[220px]">
                    ⛽ SUV Car Gas & driver depreciations
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                </button>

                <button
                  id="preset-scenario-dinner"
                  style={{ minHeight: "44px" }}
                  onClick={() => {
                    const q =
                      "Dinner check was ₹3400. Priya drank expensive cocktails for ₹600. Rest of group (Aarav, Rohan, Sneha) drank water. Divide food subtotal equally but isolate Priya's drinks.";
                    setAiQuery(q);
                    handleAIQuery(q);
                  }}
                  className="w-full text-left p-3.5 bg-neutral-900/30 hover:bg-neutral-900 border border-neutral-900 hover:border-neutral-800 rounded-xl transition-all cursor-pointer text-xs flex justify-between items-center group"
                >
                  <span className="text-zinc-350 truncate max-w-[220px]">
                    🍷 Alcohol Segregation & proportional tax check
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right COLUMN: Output Terminal screen */}
        <div
          id="ai-logs-output-screen"
          className="lg:col-span-7 bg-zinc-950 border border-neutral-900 rounded-2xl p-6 min-h-[440px] flex flex-col justify-between shadow-md"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-900">
              <span className="text-xs font-mono text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5 text-amber-500" />
                Gemini AI Output
              </span>

              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/20 border border-emerald-900/20 px-2 py-0.5 rounded font-bold uppercase">
                {aiLoading ? "Processing..." : "Gemini 2.0 Flash"}
              </span>
            </div>

            {/* Response viewport */}
            <div
              className="text-xs leading-relaxed space-y-3 font-mono text-zinc-300 bg-black/40 border border-neutral-900/35 p-5 rounded-xl max-h-[340px] overflow-y-auto text-left whitespace-pre-line select-text"
              id="ai-response-viewport"
            >
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                  <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
                    Gemini is analyzing your query...
                  </span>
                </div>
              ) : (
                aiResponse
              )}
            </div>
          </div>

          {/* Proactive calculations Compliance Tips */}
          <div
            className="pt-4 border-t border-neutral-900/60 grid grid-cols-1 sm:grid-cols-2 gap-4"
            id="ai-compliance-tips-row"
          >
            <div className="p-3.5 bg-indigo-950/10 border border-indigo-900/20 rounded-xl flex items-start space-x-2.5 text-[11px] text-zinc-300">
              <Info className="w-4.5 h-4.5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold">
                  Consolidated Debt Compression
                </strong>
                <span className="text-neutral-400 font-light font-sans">
                  Our algorithm automatically simplifies cyclic transfers,
                  turning complex multi-party maps into the fewest cash balances
                  adjustments.
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-amber-950/10 border border-amber-900/20 rounded-xl flex items-start space-x-2.5 text-[11px] text-zinc-300">
              <AlertCircle className="w-4.5 h-4.5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold">
                  Pro-Rata Custom Surcharge Tip
                </strong>
                <span className="text-neutral-400 font-light font-sans">
                  Remember: separating premium individual consumption (like
                  alcohol) from shared products ensures fair splitting ethics.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { AILabsPage };
