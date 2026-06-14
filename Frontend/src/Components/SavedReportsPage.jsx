import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  FolderOpen,
  Calendar,
  Plus,
  Trash2,
  ArrowUpRight,
  CircleDollarSign,
  PiggyBank,
  Coins,
  TrendingUp
} from "lucide-react";
import { convertAmount } from "./groupUtils";
import { billsApi } from "../api";
function SavedReportsPage({
  currentUser,
  onLoadBill,
  onDeleteBill,
  onGoToWorkspace,
  prefCurrency,
  setPrefCurrency,
  rates,
  setRates,
  triggerToast
}) {
  const [showRatesConfig, setShowRatesConfig] = useState(false);
  const [savedBills, setSavedBills] = useState([]);
  const [loadingBills, setLoadingBills] = useState(true);

  const fetchBills = () => {
    setLoadingBills(true);
    billsApi.getAll()
      .then((res) => {
        const bills = (res.data.bills || []).map((b) => ({
          id: b.id,
          title: b.title,
          date: b.created_at,
          grandTotal: parseFloat(b.grand_total) || 0,
          ...(b.data || {}),
        }));
        setSavedBills(bills);
      })
      .catch((err) => console.error('Failed to fetch bills', err))
      .finally(() => setLoadingBills(false));
  };

  useEffect(() => {
    fetchBills();
  }, []);
  const handlePrefCurrencyChange = (cur) => {
    setPrefCurrency(cur);
    localStorage.setItem("splitsmart_pref_currency", cur);
    triggerToast(`Preferred analytics currency switched to ${cur}!`);
  };
  const handleRateChange = (key, value) => {
    if (isNaN(value) || value <= 0) return;
    const nextRates = { ...rates, [key]: value };
    setRates(nextRates);
    localStorage.setItem("splitsmart_fx_rates", JSON.stringify(nextRates));
  };
  const convert = (amount, from, to) => {
    return convertAmount(amount, from, to, rates);
  };
  const totalBills = savedBills.length;
  const totalInPrefCurrency = savedBills.reduce((sum, b) => {
    const fromSymbol = b.currency || "$";
    const converted = convert(b.grandTotal, fromSymbol, prefCurrency);
    return sum + converted;
  }, 0);
  const hasBills = totalBills > 0;
  return <div id="saved-reports-page" className="space-y-10 animate-fade-in text-left max-w-7xl mx-auto px-4 md:px-12 py-4">
      {
    /* Welcome & Overview Header */
  }
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-white/10 gap-4" id="saved-reports-header">
        <div>
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-bold">SplitSmart Dashboard</span>
          <h2 className="text-3xl font-bold tracking-tight text-white mt-1">
            Welcome back, {currentUser.username}!
          </h2>
          <p className="text-sm text-neutral-400 mt-1 font-light">
            Monitor and recover your split expenses, stored securely in your cloud account.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
    id="btn-new-split-bill-header"
    style={{ minHeight: "44px" }}
    onClick={onGoToWorkspace}
    className="px-5 py-2.5 bg-white text-black text-xs font-extrabold tracking-widest uppercase rounded-xl hover:bg-neutral-200 transition-all cursor-pointer flex items-center space-x-1.5"
  >
            <Plus className="w-4 h-4" />
            <span>New Split Bill</span>
          </button>
        </div>
      </div>

      {
    /* Overview Analytics Bento Cards */
  }
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="saved-reports-analytics-row">
        {
    /* Card 1: Total Reports */
  }
        <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: "easeOut" }}
    className="bg-zinc-950 border border-neutral-900 p-6 rounded-2xl flex items-center justify-between shadow-md relative overflow-hidden"
  >
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider font-bold">Total Saved Reports</span>
            <div className="text-4xl font-extrabold text-white tracking-tight">
              {totalBills}
            </div>
            <p className="text-xs text-neutral-400 font-light">
              Active bill states loaded
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-neutral-400" />
          </div>
        </motion.div>

        {
    /* Card 2: Cumulative Expense Volume */
  }
        <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
    className="bg-zinc-950 border border-neutral-900 p-6 rounded-2xl flex items-center justify-between shadow-md relative overflow-hidden"
  >
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider font-bold">Converted Combined Total ({prefCurrency})</span>
            <div className="text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-1">
              <span>{prefCurrency}</span>
              <span>{totalInPrefCurrency.toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-neutral-400 leading-snug font-light">
              Combined volume updated with daily rates
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <CircleDollarSign className="w-6 h-6 text-neutral-400" />
          </div>
        </motion.div>

        {
    /* Card 3: Database Encryption */
  }
        <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
    className="bg-zinc-950 border border-neutral-900 p-6 rounded-2xl flex items-center justify-between shadow-md relative overflow-hidden"
  >
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider font-bold">Cloud Database Shield</span>
            <div className="text-lg font-bold text-emerald-400 tracking-tight flex items-center gap-1.5 uppercase mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Cloud Vault Active
            </div>
            <p className="text-xs text-neutral-500 font-light leading-relaxed">
              Fully private, cloud-synced Supabase database is active.
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <PiggyBank className="w-6 h-6 text-emerald-500" />
          </div>
        </motion.div>
      </div>

      {
    /* Dynamic Preferred Currency Picker & Exchange rates panel */
  }
      <div className="bg-zinc-950 border border-neutral-900 rounded-2xl p-6 space-y-6" id="currency-exchange-config-box">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-neutral-900">
          <div className="space-y-1">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                Interactive FX Optimizer Active
              </span>
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-wide">
              Preferred Display Currency
            </h3>
            <p className="text-xs text-neutral-400 font-light max-w-xl">
              Select your dashboard analytics currency. Saving splits in different local symbols ($ / € / £) automatically normalizes their grand total values using live simulator exchange rates below.
            </p>
          </div>

          <div className="flex flex-wrap bg-neutral-900/60 p-1.5 rounded-xl border border-neutral-800 gap-1.5 self-start lg:self-center">
            {["₹", "$", "€", "£", "¥", "C$"].map((cur) => <button
    key={cur}
    id={`pref-currency-btn-${cur}`}
    onClick={() => handlePrefCurrencyChange(cur)}
    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${prefCurrency === cur ? "bg-white text-black font-extrabold shadow-md" : "text-neutral-400 hover:text-white"}`}
  >
                {cur === "₹" ? "₹ INR" : cur === "$" ? "$ USD" : cur === "€" ? "€ EUR" : cur === "£" ? "£ GBP" : cur === "¥" ? "¥ JPY" : "C$ CAD"}
              </button>)}
          </div>
        </div>

        {
    /* Expandable FX Index Panel */
  }
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 text-neutral-400">
              <Coins className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono uppercase tracking-widest font-bold">
                Daily exchange rates (Relative to $1.00 USD base)
              </span>
            </div>
            <button
    id="btn-toggle-fx-rates-adjust"
    style={{ minHeight: "34px" }}
    onClick={() => setShowRatesConfig(!showRatesConfig)}
    className="text-[10px] font-mono text-zinc-400 hover:text-white uppercase font-bold px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-lg transition-all cursor-pointer flex items-center space-x-1"
  >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{showRatesConfig ? "Hide Adjustments" : "Adjust FX Rates"}</span>
            </button>
          </div>

          {showRatesConfig ? <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 text-neutral-300">
              {Object.entries(rates).map(([key, val]) => {
    if (key === "$") return null;
    const numVal = val;
    const longName = key === "₹" ? "INR" : key === "€" ? "EUR" : key === "£" ? "GBP" : key === "¥" ? "JPY" : "CAD";
    return <div key={key} className="bg-black/80 border border-neutral-900 rounded-xl p-3.5 space-y-1.5 text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase">{longName} ({key})</span>
                      <span className="text-[10px] font-mono text-emerald-500 font-bold">Base = $1.00</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-neutral-950 rounded px-2.5 py-1.5 border border-neutral-900">
                      <span className="text-xs font-mono text-zinc-500">{key}</span>
                      <input
      id={`input-rate-${key}`}
      type="number"
      step="0.01"
      min="0.01"
      value={numVal}
      onChange={(e) => {
        const nextVal = parseFloat(e.target.value);
        if (!isNaN(nextVal)) {
          handleRateChange(key, nextVal);
        }
      }}
      className="w-full bg-transparent text-xs font-mono text-white focus:outline-none"
    />
                    </div>
                  </div>;
  })}
            </div> : <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-zinc-555">
              <span className="uppercase text-zinc-400 font-bold">Standard Rates Index:</span>
              {Object.entries(rates).map(([key, val]) => {
    if (key === "$") return null;
    const numVal = val;
    return <span key={key} className="bg-white/5 border border-white/5 px-2.5 py-1 rounded-full text-white/80">
                    $1.00 = <strong className="text-emerald-400">{key}{numVal.toFixed(2)}</strong> {key === "€" ? "EUR" : key === "£" ? "GBP" : key === "¥" ? "JPY" : "CAD"}
                  </span>;
  })}
            </div>}
        </div>
      </div>

      {
    /* SAVED REPORTS LIST */
  }
      <div className="space-y-4 text-left" id="historical-saved-reports-grid">
        <div className="flex justify-between items-center pb-2 border-b border-neutral-900">
          <h3 className="text-sm font-mono text-neutral-400 uppercase tracking-wider font-bold">
            History Ledger Sessions ({totalBills})
          </h3>
          {hasBills && <span className="text-[10px] font-mono text-neutral-500 block">
              Sorted by most recent session
            </span>}
        </div>

        {!hasBills ? (
    /* Empty state */
    <div className="border border-dashed border-neutral-800 rounded-2xl p-12 text-center space-y-6 bg-zinc-950/40">
            <div className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center mx-auto border border-neutral-800">
              <FolderOpen className="w-6 h-6 text-neutral-500" />
            </div>
            <div className="space-y-2 max-w-sm mx-auto">
              <h4 className="text-base font-bold text-white uppercase">No reports found</h4>
              <p className="text-xs text-neutral-500 leading-relaxed font-light">
                To start tracking files, head over to the main **SplitSmart Workspace**, customize receipt text, add allocations and click **"Save Bill Report"**.
              </p>
            </div>
            <button
      id="btn-workspace-navigation-empty"
      style={{ minHeight: "44px" }}
      onClick={onGoToWorkspace}
      className="px-6 py-3 bg-white text-black font-extrabold text-xs tracking-widest uppercase rounded hover:bg-neutral-200 transition-all cursor-pointer inline-flex items-center space-x-1"
    >
              <span>Build First Split Report</span>
            </button>
          </div>
  ) : (
    /* Bills Grid */
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="saved-reports-list-grid">
            {savedBills.map((bill, index) => {
      const formattedDate = new Date(bill.date).toLocaleDateString(void 0, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
      return <motion.div
        key={bill.id}
        id={`saved-bill-card-${bill.id}`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut", delay: index * 0.04 }}
        className="bg-zinc-950 border border-neutral-900 rounded-2xl p-6 space-y-5 hover:border-white/10 transition-all flex flex-col justify-between group shadow-lg"
      >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <h4 className="text-lg font-bold text-white leading-snug group-hover:text-white/95 transition-colors">
                          {bill.title || "Untitled Split Report"}
                        </h4>
                        <div className="flex items-center space-x-1.5 text-[10px] font-mono text-neutral-500 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formattedDate}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <span className="text-xl font-extrabold text-white tracking-tight shrink-0 bg-white/5 border border-white/10 px-3 py-1 rounded-lg">
                          {bill.currency}{bill.grandTotal.toFixed(2)}
                        </span>
                        {bill.currency !== prefCurrency && <span className="text-[10px] font-mono text-emerald-400 mt-1.5 whitespace-nowrap bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/35 font-bold">
                            ≈ {prefCurrency}{convert(bill.grandTotal, bill.currency || "$", prefCurrency).toFixed(2)}
                          </span>}
                      </div>
                    </div>

                    {
        /* Breakdown Details */
      }
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-900 text-xs text-left">
                      <div className="space-y-1">
                        <span className="block text-[9px] font-mono text-neutral-500 uppercase tracking-wider font-bold">Parser Settings</span>
                        <span className="font-medium text-white/80 uppercase tracking-widest text-[10px] font-mono">
                          {bill.activeTab === "editor" ? "📝 Natural Parser" : "⚡ Interactive Form"}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="block text-[9px] font-mono text-neutral-500 uppercase tracking-wider font-bold">Group Size ({bill.participants.length})</span>
                        <div className="text-neutral-400 truncate font-mono text-[10px]">
                          {bill.participants.map((p) => p.name).join(", ") || "None"}
                        </div>
                      </div>
                    </div>

                    {
        /* Visual bar */
      }
                    <div className="w-full bg-neutral-900/40 rounded-full h-1 overflow-hidden">
                      <div
        className="bg-white h-full"
        style={{ width: `${Math.min(100, Math.max(12, bill.grandTotal / 500 * 100))}%` }}
      />
                    </div>
                  </div>

                  {
        /* Actions Bar */
      }
                  <div className="flex gap-2.5 pt-3 border-t border-neutral-900/50">
                    <button
        id={`btn-load-bill-${bill.id}`}
        style={{ minHeight: "38px" }}
        onClick={() => onLoadBill(bill)}
        className="flex-1 py-2.5 bg-white text-black hover:bg-neutral-200 transition-all font-extrabold text-[10px] tracking-wider uppercase rounded-xl cursor-pointer flex items-center justify-center space-x-1"
      >
                      <ArrowUpRight className="w-3.5 h-3.5 text-black" />
                      <span>Load Sandbox Context</span>
                    </button>
                    
                    <button
        id={`btn-delete-bill-${bill.id}`}
        style={{ minHeight: "38px" }}
        onClick={() => {
          if (confirm(`Remove the saved bill report "${bill.title}" from your account?`)) {
            onDeleteBill(bill.id);
            setSavedBills((prev) => prev.filter((b) => b.id !== bill.id));
          }
        }}
        className="px-3.5 py-2.5 bg-neutral-900 hover:bg-red-950/40 hover:border-red-950 text-neutral-400 hover:text-red-400 border border-neutral-800 transition-all rounded-xl cursor-pointer flex items-center justify-center"
        title="Purge session"
      >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>;
    })}
          </div>
  )}
      </div>
    </div>;
}
export {
  SavedReportsPage
};
