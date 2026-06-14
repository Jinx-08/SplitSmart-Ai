import { useState } from "react";
import { motion } from "motion/react";
import {
  Receipt,
  Scale,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
  UploadCloud,
  Loader2
} from "lucide-react";
import { calculateGroupBalances } from "./groupUtils";
import { D3SpendingPieChart } from "./D3SpendingPieChart";
import { AI_BASE } from "../api";
function ExpensesSettlementsPage({
  currentUser,
  groups,
  setGroups,
  selectedGroupId,
  setSelectedGroupId,
  prefCurrency,
  triggerToast,
  navigateToGroups,
  navigateToWorkspace
}) {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpenseTitle, setNewExpenseTitle] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [newExpensePayer, setNewExpensePayer] = useState("");
  const [newExpenseCategory, setNewExpenseCategory] = useState("General");
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [showScannerSection, setShowScannerSection] = useState(false);
  const generateSampleReceiptImage = (type) => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 520;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    ctx.fillStyle = "#faf9f5";
    ctx.fillRect(0, 0, 400, 520);
    ctx.strokeStyle = "#dfdbcf";
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 8, 384, 504);
    ctx.fillStyle = "#1c1c18";
    ctx.textAlign = "center";
    if (type === "cafe") {
      ctx.font = "bold 16px Courier New";
      ctx.fillText("STARDUST COFFEE LOUNGE", 200, 45);
      ctx.font = "11px Courier New";
      ctx.fillText("104 Galaxy Towers, Outer Orbital Road", 200, 65);
      ctx.fillText("GSTIN: 27AACCS1092M1ZO", 200, 80);
      ctx.fillText("--------------------------------------", 200, 100);
      ctx.textAlign = "left";
      ctx.fillText("2x Cappuccino Special      360.00", 45, 130);
      ctx.fillText("1x Sourdough Mushroom Toast 290.00", 45, 155);
      ctx.fillText("1x Roasted Hazelnut Shake  210.00", 45, 180);
      ctx.fillText("1x Triple Choco Muffin     160.00", 45, 205);
      ctx.fillText("--------------------------------------", 45, 230);
      ctx.fillText("Subtotal:                 1020.00", 45, 260);
      ctx.fillText("CGST & SGST Tax (18%):     183.60", 45, 285);
      ctx.fillText("Service Charge (10%):      102.00", 45, 310);
      ctx.font = "bold 13px Courier New";
      ctx.fillText("GRAND RESTAURANT DUE:     1305.60", 45, 345);
    } else if (type === "pizza") {
      ctx.font = "bold 16px Courier New";
      ctx.fillText("TRATTORIA BELLA PIZZA", 200, 45);
      ctx.font = "11px Courier New";
      ctx.fillText("Arcade Shop #5, Sector-15 Metro", 200, 65);
      ctx.fillText("--------------------------------------", 200, 100);
      ctx.textAlign = "left";
      ctx.fillText("1x Woodfired Margherita    420.00", 45, 130);
      ctx.fillText("1x Spicy Pepperoni Feast   580.00", 45, 155);
      ctx.fillText("1x Creamy Garlic Dip        80.00", 45, 180);
      ctx.fillText("2x Lemon House Mocktails   190.00", 45, 205);
      ctx.fillText("--------------------------------------", 45, 230);
      ctx.fillText("Net Food Total:           1270.00", 45, 260);
      ctx.fillText("VAT Sales Charge (12%):    152.40", 45, 285);
      ctx.fillText("Staff Gratuity (15%):      190.50", 45, 310);
      ctx.font = "bold 13px Courier New";
      ctx.fillText("NET REVENUE DUE SUMMARY:  1612.90", 45, 345);
    } else {
      ctx.font = "bold 16px Courier New";
      ctx.fillText("NATURE PLUS SUPERMARKET", 200, 45);
      ctx.font = "11px Courier New";
      ctx.fillText("Plaza Suite, High Road Central", 200, 65);
      ctx.fillText("--------------------------------------", 200, 100);
      ctx.textAlign = "left";
      ctx.fillText("4x Green Organic Apples    180.00", 45, 130);
      ctx.fillText("1x Artisan Organic Honey   350.00", 45, 155);
      ctx.fillText("2x Walnut Milk Sugarfree   260.05", 45, 180);
      ctx.fillText("1x Sourdough Whole Loaf    110.00", 45, 205);
      ctx.fillText("--------------------------------------", 45, 230);
      ctx.fillText("Items Combined Total:       900.00", 45, 260);
      ctx.fillText("GST Admin Surcharge (5%):    45.00", 45, 285);
      ctx.font = "bold 13px Courier New";
      ctx.fillText("SUPERMARKET CHECKOUT DUE:   945.05", 45, 345);
    }
    ctx.textAlign = "center";
    ctx.font = "9px Courier New";
    ctx.fillText("*** No Math, No Tension ***", 200, 415);
    ctx.fillText("Powered under SplitSmart AI Studio", 200, 430);
    return canvas.toDataURL("image/png");
  };
  const estimateReceiptTotal = (rawText, taxPercent, tipPercent) => {
    let subtotal = 0;
    const lines = rawText.split("\n");
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("//")) {
        return;
      }
      const match = trimmed.match(/[\$₹€£]?([0-9.]+)$/);
      if (match) {
        const val = parseFloat(match[1]);
        if (!isNaN(val)) {
          subtotal += val;
        }
      }
    });
    const tax = subtotal * (taxPercent || 0) / 100;
    const tip = subtotal * (tipPercent || 0) / 100;
    return subtotal + tax + tip;
  };
  const handleReceiptScan = async (base64Data) => {
    setIsScanning(true);
    setScanStatus("Running deep OCR parsing via Gemini multimodal AI...");
    try {
      const response = await fetch(`${AI_BASE}/api/scan-receipt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: "image/png"
        })
      });
      if (!response.ok) {
        throw new Error("Server returned internal error during scan.");
      }
      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }
      if (result.title) {
        setNewExpenseTitle(result.title);
      }
      if (result.rawText) {
        const estimatedAmount = estimateReceiptTotal(result.rawText, result.taxPercent || 0, result.tipPercent || 0);
        setNewExpenseAmount(estimatedAmount > 0 ? estimatedAmount.toFixed(2) : "");
      }
      if (result.title) {
        const titleL = result.title.toLowerCase();
        if (titleL.includes("pizza") || titleL.includes("pasta") || titleL.includes("restaurant") || titleL.includes("cafe") || titleL.includes("coffee") || titleL.includes("lounge") || titleL.includes("food") || titleL.includes("dining")) {
          setNewExpenseCategory("Food");
        } else if (titleL.includes("supermarket") || titleL.includes("grocery") || titleL.includes("market") || titleL.includes("store") || titleL.includes("organic")) {
          setNewExpenseCategory("Food");
        } else if (titleL.includes("cab") || titleL.includes("uber") || titleL.includes("taxi") || titleL.includes("fuel") || titleL.includes("gas") || titleL.includes("transit") || titleL.includes("travel")) {
          setNewExpenseCategory("Travel");
        } else if (titleL.includes("cinema") || titleL.includes("theater") || titleL.includes("show") || titleL.includes("game") || titleL.includes("bowling")) {
          setNewExpenseCategory("Entertainment");
        }
      }
      triggerToast(`AI Auto-Filled: "${result.title || "Receipt"}"!`);
      setShowScannerSection(false);
    } catch (err) {
      console.error(err);
      triggerToast(`AI Scan Failed: ${err.message || "Please upload a readable image."}`);
    } finally {
      setIsScanning(false);
      setScanStatus("");
    }
  };
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          handleReceiptScan(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          handleReceiptScan(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const saveGroupsState = (updatedGroups) => {
    setGroups(updatedGroups);
  };
  const activeGroup = groups.find((x) => x.id === selectedGroupId);
  const calculations = activeGroup ? calculateGroupBalances(activeGroup) : null;
  return <div id="expenses-page-container" className="space-y-8 animate-fade-in text-left max-w-7xl mx-auto px-4 md:px-12 py-4">
      {
    /* Page Header */
  }
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-white/10 gap-4" id="expenses-header">
        <div>
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-extrabold">SplitSmart Ledger Room</span>
          <h2 className="text-3xl font-bold tracking-tight text-white mt-1">
            Expenses & Settlements Engine
          </h2>
          <p className="text-sm text-neutral-400 mt-1 font-light">
            Record team outlays, track balanced credit standing, and query automated least-transfer paths.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {
    /* LHS Panel: Group selector */
  }
        <div id="expenses-selector-column" className="lg:col-span-4 space-y-4">
          <h3 className="text-sm font-mono text-neutral-400 uppercase tracking-wider font-bold">
            Select Active Registry
          </h3>

          {groups.length === 0 ? <div className="p-6 text-center text-zinc-600 bg-zinc-950/40 border border-dashed border-neutral-900 rounded-2xl text-xs font-light text-left">
              <span>No persistent group directories configured. Feel free to </span>
              <button
    id="btn-nav-to-groups-prompt"
    onClick={navigateToGroups}
    className="text-indigo-400 font-bold underline hover:text-indigo-300"
  >
                Create a Group
              </button>
              <span> to unlock ledger entries.</span>
            </div> : <div className="space-y-4">
              <div className="space-y-1 text-left">
                <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">Active Group Folder</span>
                <select
    id="select-active-group-folder"
    value={selectedGroupId}
    onChange={(e) => {
      setSelectedGroupId(e.target.value);
      setShowAddExpense(false);
    }}
    className="w-full bg-neutral-900 border border-neutral-800 p-3.5 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-indigo-500 uppercase cursor-pointer"
  >
                  {groups.map((g) => <option key={g.id} value={g.id}>
                      {g.category === "Home" ? "🏠" : g.category === "Trip" ? "✈️" : g.category === "Office" ? "💼" : "🍻"} {g.name}
                    </option>)}
                </select>
              </div>

              {activeGroup && calculations && <motion.div
    key={activeGroup.id}
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-zinc-950 border border-neutral-900 p-4.5 rounded-2xl space-y-3.5 text-left"
  >
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-mono text-zinc-500 font-bold uppercase">Roster Directory</span>
                    <span className="bg-white/5 border border-white/5 px-2.5 py-1 rounded text-[9px] text-zinc-400 font-mono font-bold">
                      {activeGroup.members.length} Users
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeGroup.members.map((m) => <span key={m} className="bg-neutral-900 border border-neutral-850 px-2.5 py-1 text-[10px] rounded-lg text-white font-mono font-medium">
                        {m}
                      </span>)}
                  </div>

                  <div className="pt-3 border-t border-neutral-900 flex justify-between items-center text-xs">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Total Group Outlay:</span>
                    <span className="text-sm font-extrabold text-emerald-400 font-mono">
                      {prefCurrency}{calculations.totalExpenses.toFixed(2)}
                    </span>
                  </div>
                </motion.div>}
            </div>}
        </div>

        {
    /* RHS Panel: Billing Ledger, individual statistics, transaction logs, and settlements maps */
  }
        <div id="expenses-ledger-panel" className="lg:col-span-8 bg-zinc-950 border border-neutral-900 rounded-2xl p-6 min-h-[480px]">
          {!activeGroup || !calculations ? <div className="flex flex-col items-center justify-center p-12 text-center h-full space-y-3 mt-12">
              <Receipt className="w-8 h-8 text-neutral-700 animate-pulse" />
              <h4 className="text-sm font-bold text-white uppercase">No Group Configured</h4>
              <p className="text-xs text-zinc-555 font-light max-w-sm">
                Define an active group directory on the left sidebar to audit balance allocations or simplify settlements.
              </p>
            </div> : <div className="space-y-6 text-left">
              {
    /* Active Registry Header */
  }
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-neutral-900" id="expenses-ledger-header">
                <div className="space-y-1 text-left">
                  <span className="text-[10px] font-mono text-emerald-400 font-extrabold uppercase tracking-widest bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                    Active Registry Ledger
                  </span>
                  <h3 className="text-xl font-bold text-white tracking-tight">{activeGroup.name}</h3>
                </div>

                <div className="flex items-center space-x-2">
                  <button
    id="btn-log-group-expense"
    style={{ minHeight: "44px" }}
    onClick={() => {
      setNewExpenseTitle("");
      setNewExpenseAmount("");
      setNewExpensePayer(activeGroup.members[0] || "");
      setNewExpenseCategory("General");
      setShowAddExpense(!showAddExpense);
    }}
    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold tracking-wider uppercase rounded-xl transition-all cursor-pointer flex items-center space-x-1 shadow-md"
  >
                    <Plus className="w-4 h-4" />
                    <span>Log Bill</span>
                  </button>

                  <button
    id="btn-load-ledger-to-sandbox"
    style={{ minHeight: "44px" }}
    onClick={() => {
      let compiled = `# Group Export: ${activeGroup.name}
`;
      activeGroup.expenses.forEach((exp) => {
        compiled += `${exp.payer} paid ${exp.amount} for ${exp.title}
`;
      });
      if (activeGroup.expenses.length === 0) {
        compiled += `Priya paid 1500 for Rent
Aarav paid 500 for Utilities
`;
      }
      navigator.clipboard.writeText(compiled);
      triggerToast("Copied group ledger transcript context! Loaded to Workspace...");
      navigateToWorkspace();
    }}
    className="px-4 py-2.5 bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-white/20 text-xs font-mono font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center space-x-1"
  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Copy to Sandbox</span>
                  </button>
                </div>
              </div>

              {
    /* Add Group Expense Form */
  }
              {showAddExpense && <motion.div
    id="add-expense-form-panel"
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-neutral-900/60 border border-indigo-950 p-5 rounded-2xl space-y-4 shadow-inner text-left"
  >
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-800/40">
                    <span className="text-xs font-mono text-indigo-400 uppercase font-black font-extrabold">Record New Group Claim</span>
                    <button onClick={() => setShowAddExpense(false)} className="text-zinc-555 hover:text-white text-xs">× Cancel</button>
                  </div>

                  {
    /* AI Auto-Fill Container */
  }
                  <div className="border border-neutral-850 bg-neutral-950 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <button
    type="button"
    onClick={() => setShowScannerSection(!showScannerSection)}
    className="flex items-center gap-1.5 text-[10px] font-mono font-extrabold uppercase tracking-wide px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all cursor-pointer"
  >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                        <span>{showScannerSection ? "Hide AI Auto-Fill" : "Auto-Fill with AI Scanner ✨"}</span>
                      </button>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">Gemini powered</span>
                    </div>

                    {showScannerSection && <motion.div
    initial={{ opacity: 0, y: -4 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-3.5 pt-1.5"
  >
                        {isScanning ? <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-indigo-950 rounded-lg bg-neutral-950/80 space-y-2.5 animate-pulse">
                            <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
                            <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
                              {scanStatus || "AI is scanning your invoice..."}
                            </span>
                          </div> : <>
                            {
    /* Dropzone */
  }
                            <div
    onDragOver={handleDragOver}
    onDragLeave={handleDragLeave}
    onDrop={handleDrop}
    className={`relative flex flex-col items-center justify-center p-5 text-center border border-dashed rounded-lg cursor-pointer transition-all ${dragActive ? "border-indigo-450 bg-indigo-500/5" : "border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900/80 hover:border-neutral-700"}`}
  >
                              <input
    type="file"
    accept="image/*"
    onChange={handleFileChange}
    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
  />
                              <UploadCloud className="w-8 h-8 text-neutral-400 mb-1.5" />
                              <span className="text-[10px] font-mono text-zinc-300 font-bold uppercase">
                                Drag & drop or Click to Scan Receipt Image
                              </span>
                              <span className="text-[9px] text-zinc-555 font-light mt-0.5">
                                Supports PNG, JPEG, WEBP and modern invoice sheets.
                              </span>
                            </div>

                            {
    /* Easy Sandbox Demos */
  }
                            <div className="space-y-1.5">
                              <span className="text-[9px] font-mono text-zinc-500 uppercase block font-bold">
                                Or Choose Demo Presets (Zero-friction Testing)
                              </span>
                              <div className="grid grid-cols-3 gap-2">
                                <button
    type="button"
    onClick={() => handleReceiptScan(generateSampleReceiptImage("cafe"))}
    className="p-2 py-2 text-[10px] border border-neutral-850 bg-neutral-900 hover:bg-neutral-850 text-white font-semibold rounded-lg flex items-center justify-center gap-1 hover:border-neutral-700 transition cursor-pointer"
  >
                                  <span>☕ Café</span>
                                </button>
                                <button
    type="button"
    onClick={() => handleReceiptScan(generateSampleReceiptImage("pizza"))}
    className="p-2 py-2 text-[10px] border border-neutral-850 bg-neutral-900 hover:bg-neutral-850 text-white font-semibold rounded-lg flex items-center justify-center gap-1 hover:border-neutral-700 transition cursor-pointer"
  >
                                  <span>🍕 Pizza</span>
                                </button>
                                <button
    type="button"
    onClick={() => handleReceiptScan(generateSampleReceiptImage("supermarket"))}
    className="p-2 py-2 text-[10px] border border-neutral-850 bg-neutral-900 hover:bg-neutral-850 text-white font-semibold rounded-lg flex items-center justify-center gap-1 hover:border-neutral-700 transition cursor-pointer"
  >
                                  <span>🛒 Grocery</span>
                                </button>
                              </div>
                            </div>
                          </>}
                      </motion.div>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">Bill Outlay description</span>
                      <input
    id="input-expense-title"
    type="text"
    placeholder="Costco paper towels, grocery shopping..."
    value={newExpenseTitle}
    onChange={(e) => setNewExpenseTitle(e.target.value)}
    className="w-full bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
  />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">Amount paid ({prefCurrency})</span>
                      <input
    id="input-expense-amount"
    type="number"
    step="0.01"
    min="0.01"
    placeholder="0.00"
    value={newExpenseAmount}
    onChange={(e) => setNewExpenseAmount(e.target.value)}
    className="w-full bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
  />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-zinc-555 uppercase font-bold block">Payer Member</span>
                      <select
    id="select-expense-payer"
    value={newExpensePayer}
    onChange={(e) => setNewExpensePayer(e.target.value)}
    className="w-full bg-neutral-950 border border-neutral-850 px-3.5 py-2.5 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
  >
                        {activeGroup.members.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">Billing category</span>
                      <select
    id="select-expense-category"
    value={newExpenseCategory}
    onChange={(e) => setNewExpenseCategory(e.target.value)}
    className="w-full bg-neutral-950 border border-neutral-850 px-3.5 py-2.5 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
  >
                        <option value="Rent">🏠 Rent & Accommodation</option>
                        <option value="Food">🍔 Groceries & Foods</option>
                        <option value="Utilities">💡 Home Utilities</option>
                        <option value="Travel">🚗 Transit & Fuel</option>
                        <option value="Entertainment">🍿 Group Activities</option>
                        <option value="General">📦 General Charges</option>
                      </select>
                    </div>
                  </div>

                  <button
    id="btn-record-expense-submit"
    onClick={() => {
      const amt = parseFloat(newExpenseAmount);
      if (!newExpenseTitle.trim()) {
        triggerToast("Provide an descriptive outlay label!");
        return;
      }
      if (isNaN(amt) || amt <= 0) {
        triggerToast("Introduce a positive numeric settlement outlay!");
        return;
      }
      const newExp = {
        id: `exp-${Date.now()}`,
        title: newExpenseTitle.trim(),
        amount: amt,
        payer: newExpensePayer || activeGroup.members[0],
        date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        category: newExpenseCategory
      };
      const updatedExpenses = [...activeGroup.expenses, newExp];
      const updated = groups.map((g) => {
        if (g.id === activeGroup.id) {
          return { ...g, expenses: updatedExpenses };
        }
        return g;
      });
      saveGroupsState(updated);
      setShowAddExpense(false);
      setNewExpenseTitle("");
      setNewExpenseAmount("");
      triggerToast(`Logged successfully: ${newExp.payer} paid ${prefCurrency}${amt.toFixed(2)} for ${newExp.title}!`);
    }}
    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-extrabold uppercase rounded-lg tracking-widest cursor-pointer transition-all"
  >
                    Commit Outgoing Bill
                  </button>
                </motion.div>}

              {
    /* Individual Balance standouts */
  }
              <div id="individual-ledger-standouts" className="space-y-3">
                <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">
                  Interactive Roster Standing & Shared Split Impact
                </span>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {activeGroup.members.map((member) => {
    const balance = calculations.netBalances[member] || 0;
    const isCreditor = balance >= 5e-3;
    const isSettled = Math.abs(balance) < 0.01;
    const paidSum = activeGroup.expenses.filter((x) => x.payer === member).reduce((s, e) => s + e.amount, 0);
    return <div key={member} className="bg-neutral-900/40 border border-neutral-900 rounded-2xl p-4 text-center flex flex-col justify-between">
                        <div>
                          <span className="text-xs font-bold text-white block truncate">{member}</span>
                          <span className="text-[9px] font-mono text-zinc-500 block mt-0.5">Paid: {prefCurrency}{paidSum.toFixed(2)}</span>
                        </div>
                        <div className="mt-2.5 pt-1.5 border-t border-neutral-900/60 font-mono">
                          {isSettled ? <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase block">Settled</span> : isCreditor ? <span className="text-xs font-mono font-extrabold text-emerald-400">
                              +{prefCurrency}{balance.toFixed(2)}
                            </span> : <span className="text-xs font-mono font-extrabold text-red-400">
                              -{prefCurrency}{Math.abs(balance).toFixed(2)}
                            </span>}
                        </div>
                      </div>;
  })}
                </div>
              </div>

              {
    /* List, settlements, and D3 visualizer graph */
  }
              {(() => {
    const d3ChartData = activeGroup.members.map((member) => ({
      name: member,
      amount: activeGroup.expenses.filter((x) => x.payer === member).reduce((s, e) => s + e.amount, 0)
    }));
    return <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                    
                    {
      /* Left Column (Lists): Outlays list & Simplify Debt settlements */
    }
                    <div className="lg:col-span-7 space-y-6">
                      
                      {
      /* Outlays Ledger */
    }
                      <div className="bg-neutral-900/40 border border-neutral-900 p-5 rounded-2xl space-y-4 text-left">
                        <div className="flex justify-between items-center bg-black/10 pb-2 border-b border-neutral-900/40">
                          <span className="text-xs font-mono text-zinc-400 font-bold uppercase tracking-wider">
                            Ledger Log ({activeGroup.expenses.length})
                          </span>
                          <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase block">
                            Per Person: {prefCurrency}{calculations.sharePerPerson.toFixed(2)}
                          </span>
                        </div>

                        <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1" id="ledger-transactions-list">
                          {activeGroup.expenses.map((exp, expIdx) => <motion.div
      key={exp.id}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.015, y: -1 }}
      transition={{
        opacity: { duration: 0.15, delay: expIdx * 0.03 },
        x: { duration: 0.15, delay: expIdx * 0.03 },
        scale: { type: "spring", stiffness: 400, damping: 25 },
        y: { type: "spring", stiffness: 400, damping: 25 }
      }}
      className="flex justify-between items-center text-xs p-3 bg-black/40 border border-neutral-950 hover:border-neutral-800/80 hover:bg-zinc-900/20 rounded-xl group/exp relative transition-all duration-150 cursor-pointer"
    >
                              <div className="text-left">
                                <span className="font-bold text-white block leading-snug flex items-center gap-1.5 flex-wrap">
                                  {exp.title}
                                  {exp.category === "Settlement" && <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-mono font-bold uppercase shrink-0 tracking-wider">
                                      peer settle
                                    </span>}
                                </span>
                                <span className="text-[9px] font-mono text-zinc-500">
                                  {exp.date} • Paid by {exp.payer} {exp.recipient ? `➔ Received by ${exp.recipient}` : ""}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`font-mono font-extrabold px-2.5 py-0.5 rounded text-[10px] ${exp.category === "Settlement" ? "text-emerald-450 bg-emerald-500/5 border border-emerald-500/15 font-bold" : "text-white bg-white/5 border border-white/5"}`}>
                                  {prefCurrency}{exp.amount.toFixed(2)}
                                </span>
                                
                                <button
      id={`btn-delete-expense-${exp.id}`}
      onClick={() => {
        if (confirm(`Remove "${exp.title}" outlay?`)) {
          const nextList = activeGroup.expenses.filter((x) => x.id !== exp.id);
          const updated = groups.map((g) => {
            if (g.id === activeGroup.id) {
              return { ...g, expenses: nextList };
            }
            return g;
          });
          saveGroupsState(updated);
          triggerToast("Deleted selected transaction.");
        }
      }}
      className="text-zinc-655 hover:text-red-400 p-0.5 h-4 w-4 flex items-center justify-center rounded hover:bg-neutral-900 cursor-pointer text-xs font-bold font-mono"
    >
                                  ×
                                </button>
                              </div>
                            </motion.div>)}

                          {activeGroup.expenses.length === 0 && <div className="p-12 text-center text-xs font-light text-zinc-650 italic">
                              No transactions found inside this ledger directory. Click 'Log Bill' above to add outlays.
                            </div>}
                        </div>
                      </div>

                      {
      /* Settle Path map */
    }
                      <div className="bg-neutral-900/40 border border-neutral-900 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                        <div className="text-left">
                          <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Scale className="w-4 h-4 text-indigo-400" />
                            Simplification Output Maps
                          </span>
                          <p className="text-[10px] text-zinc-500 font-light mt-1">
                            Our balance compression algorithm models network nodes and minimizes transaction counts to settle accounts.
                          </p>
                        </div>

                        <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 flex-1 py-1" id="simplified-settlements-list">
                          {calculations.settlements.map((settle, idx) => <motion.div
      key={idx}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: idx * 0.03 }}
      className="flex justify-between items-center text-xs p-3 bg-black/40 border border-neutral-950 rounded-xl"
    >
                              <div className="flex items-center space-x-2 font-mono text-zinc-350">
                                <b className="text-red-400 font-bold">{settle.from}</b>
                                <span className="text-neutral-500 text-[9px] uppercase tracking-wide">owes</span>
                                <b className="text-emerald-400 font-bold">{settle.to}</b>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-mono font-extrabold text-emerald-400 bg-emerald-950/20 px-2.5 py-1 rounded-lg border border-emerald-900/20 text-[10px]">
                                  {prefCurrency}{settle.amount.toFixed(2)}
                                </span>
                                <button
      type="button"
      onClick={() => {
        if (confirm(`Confirm cash transfer clearance of ${prefCurrency}${settle.amount.toFixed(2)} from ${settle.from} to ${settle.to}?`)) {
          const newExp = {
            id: `settle-${Date.now()}`,
            title: "Settle Owed Balance",
            amount: settle.amount,
            payer: settle.from,
            recipient: settle.to,
            date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
            category: "Settlement"
          };
          const updatedList = [...activeGroup.expenses, newExp];
          const updated = groups.map((g) => {
            if (g.id === activeGroup.id) {
              return { ...g, expenses: updatedList };
            }
            return g;
          });
          saveGroupsState(updated);
          triggerToast(`Recorded! ${settle.from} settled up with ${settle.to}.`);
        }
      }}
      className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold font-mono rounded text-[9px] uppercase tracking-wider transition-all cursor-pointer shadow border-none shrink-0"
    >
                                  Settle
                                </button>
                              </div>
                            </motion.div>)}

                          {calculations.settlements.length === 0 && <div className="bg-emerald-950/10 border border-emerald-900/25 p-5 rounded-xl text-center space-y-2 flex flex-col items-center justify-center h-full">
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                              <h5 className="text-xs font-bold text-white uppercase tracking-wider">Perfectly Settled</h5>
                              <p className="text-[10px] text-zinc-500 max-w-xs font-light">
                                Perfect financial equity! All members have funded exactly their equal baseline share of logged ledger claims.
                              </p>
                            </div>}
                        </div>

                        {
      /* Seed button */
    }
                        {activeGroup.expenses.length === 0 && <button
      id="btn-inject-ledger-presets"
      type="button"
      style={{ minHeight: "38px" }}
      onClick={() => {
        const seed = [
          { id: "exp-s1", title: "Shared Rent Subtotal", amount: 320, payer: activeGroup.members[0], date: "2026-05-24", category: "Rent" },
          { id: "exp-s2", title: "Grocery bulk box", amount: 154.5, payer: activeGroup.members[1] || activeGroup.members[0], date: "2026-05-25", category: "Food" }
        ];
        const updated = groups.map((g) => {
          if (g.id === activeGroup.id) {
            return { ...g, expenses: seed };
          }
          return g;
        });
        saveGroupsState(updated);
        triggerToast("Imported ledger demonstration presets!");
      }}
      className="w-full py-2 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-neutral-800 text-[10px] font-mono uppercase rounded-lg transition-all cursor-pointer"
    >
                            ⚡ Inject demo outlays list preset
                          </button>}
                      </div>

                    </div>

                    {
      /* Right Column (Visualizer): Premium D3 Spending Share Map */
    }
                    <div className="lg:col-span-5 flex flex-col h-full justify-start">
                      <D3SpendingPieChart data={d3ChartData} prefCurrency={prefCurrency} />
                    </div>

                  </div>;
  })()}

            </div>}
        </div>
      </div>
    </div>;
}
export {
  ExpensesSettlementsPage
};
