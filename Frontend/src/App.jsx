/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Users,
  Sparkles,
  Clipboard,
  Check,
  RefreshCw,
  Info,
  DollarSign,
  ArrowRightLeft,
  Receipt,
  PiggyBank,
  Share2,
  QrCode,
  Sun,
  Moon,
  Menu,
  X
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { AuthView } from "./Components/AuthView";
import { SavedReportsPage } from "./Components/SavedReportsPage";
import { GroupsPage } from "./Components/GroupsPage";
import { ExpensesSettlementsPage } from "./Components/ExpensesSettlementsPage";
import { AILabsPage } from "./Components/AILabsPage";
import { authApi, billsApi, groupsApi, getToken, setToken, clearToken } from "./api";
function App() {
  const PRESETS = {
    sushi: `# Friday Biryani & Drinks Night Out (Presets Ready)
Priya paid ₹1600 for Biryani Platter
Aarav paid ₹400 for Auto and Extra Lassi
Rohan paid ₹0

# Direct item assignments:
Tikka Platter ₹900: Priya, Aarav, Rohan
Mocktails ₹400: Priya, Rohan
Auto ₹200: Aarav, Rohan
Sweet ₹300 split all`,
    trip: `# Lonavala Weekend Road Trip
Kabir paid ₹2400 for Villa Booking
Ananya paid ₹800 for Groceries
Dev paid ₹600 for Petrol Refuel

# Allocations:
Villa Rent ₹2400 split Kabir, Ananya, Dev
Groceries ₹800 split Dev, Ananya, Kabir
Petrol ₹600: Ananya, Dev`,
    apartment: `# Mumbai Roomies Monthly Bills
Sneha paid ₹1800 for Wifi & broadband
Amit paid ₹600 for Cleaning Supplies

# Allocation breakdown:
Gigabit Fibre ₹1200 split Sneha, Amit
Setup Fee ₹600 split Sneha
Supplies ₹600: Sneha, Amit`
  };
  const [activePreset, setActivePreset] = useState("sushi");
  const [rawText, setRawText] = useState(PRESETS.sushi);
  const [participants, setParticipants] = useState([
    { id: "1", name: "Priya" },
    { id: "2", name: "Aarav" },
    { id: "3", name: "Rohan" }
  ]);
  const [taxPercent, setTaxPercent] = useState(8);
  const [tipPercent, setTipPercent] = useState(15);
  const [currency, setCurrency] = useState("₹");
  const [newParticipantName, setNewParticipantName] = useState("");
  const [heroBill, setHeroBill] = useState(3600);
  const [heroPeopleCount, setHeroPeopleCount] = useState(4);
  const [heroTipSel, setHeroTipSel] = useState(10);
  const [heroDryDiner, setHeroDryDiner] = useState(true);
  const [activeTab, setActiveTab] = useState("editor");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState("");
  const [copiedState, setCopiedState] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [receiptImage, setReceiptImage] = useState(null);
  const [scanStatus, setScanStatus] = useState("");
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
      ctx.fillText("VAT Sales Registered: 894029", 200, 80);
      ctx.fillText("--------------------------------------", 200, 100);
      ctx.textAlign = "left";
      ctx.fillText("1x Woodfired Margherita    420.00", 45, 130);
      ctx.fillText("1x Spicy Pepperoni Feast   580.00", 45, 155);
      ctx.fillText("1x Creamy Garlic Dip        80.00", 45, 180);
      ctx.fillText("2x Lemon House Mocktails   190.00", 45, 205);
      ctx.fillText("--------------------------------------", 45, 230);
      ctx.fillText("Net Food Sales Total:     1270.00", 45, 260);
      ctx.fillText("VAT Sales Charge (12%):    152.40", 45, 285);
      ctx.fillText("Staff Gratuity (15%):      190.50", 45, 310);
      ctx.font = "bold 13px Courier New";
      ctx.fillText("NET REVENUE DUE SUMMARY:  1612.90", 45, 345);
    } else {
      ctx.font = "bold 16px Courier New";
      ctx.fillText("NATURE PLUS SUPERMARKET", 200, 45);
      ctx.font = "11px Courier New";
      ctx.fillText("Plaza Suite, High Road Central", 200, 65);
      ctx.fillText("Thank you for shopping clean!", 200, 80);
      ctx.fillText("--------------------------------------", 200, 100);
      ctx.textAlign = "left";
      ctx.fillText("4x Green Organic Apples    180.00", 45, 130);
      ctx.fillText("1x Artisan Organic Honey   350.00", 45, 155);
      ctx.fillText("2x Walnut Milk Sugarfree   260.00", 45, 180);
      ctx.fillText("1x Sourdough Whole Loaf    110.00", 45, 205);
      ctx.fillText("--------------------------------------", 45, 230);
      ctx.fillText("Items Combined Total:       900.00", 45, 260);
      ctx.fillText("GST Admin Surcharge (5%):    45.00", 45, 285);
      ctx.fillText("Local Delivery Surcharge:     0.00", 45, 310);
      ctx.font = "bold 13px Courier New";
      ctx.fillText("SUPERMARKET CHECKOUT DUE:   945.00", 45, 345);
    }
    ctx.textAlign = "center";
    ctx.font = "9px Courier New";
    ctx.fillText("*** No Math, No Tension ***", 200, 415);
    ctx.fillText("Powered under SplitSmart AI Studio", 200, 430);
    ctx.fillText("Token ID: SSPM-894-023-A", 200, 445);
    return canvas.toDataURL("image/png");
  };
  const handleReceiptScan = async (base64Data) => {
    setIsScanning(true);
    setScanStatus("Running deep OCR parsing via Gemini multimodal AI...");
    try {
      const response = await fetch("/api/scan-receipt", {
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
      if (result.rawText) {
        setRawText(result.rawText);
      }
      if (typeof result.taxPercent === "number") {
        setTaxPercent(result.taxPercent);
      }
      if (typeof result.tipPercent === "number") {
        setTipPercent(result.tipPercent);
      }
      if (result.currency) {
        setCurrency(result.currency);
      }
      triggerToast(`AI Scanned & Loaded: "${result.title || "Receipt Data"}"!`);
      setReceiptImage(null);
      setShowScanner(false);
    } catch (err) {
      console.error(err);
      triggerToast(`OCR Scan Failed: ${err.message || "Ensure receipt text is visible."}`);
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
          setReceiptImage(reader.result);
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
          setReceiptImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const [manualPayments, setManualPayments] = useState([
    { id: "p1", payer: "Priya", amount: 1600, description: "Biryani Platter" },
    { id: "p2", payer: "Aarav", amount: 400, description: "Auto and Extra Lassi" }
  ]);
  const [manualAllocations, setManualAllocations] = useState([
    { id: "a1", description: "Tikka Platter", amount: 900, assignees: ["Priya", "Aarav", "Rohan"] },
    { id: "a2", description: "Mocktails", amount: 400, assignees: ["Priya", "Rohan"] },
    { id: "a3", description: "Auto", amount: 200, assignees: ["Aarav", "Rohan"] },
    { id: "a4", description: "Sweet", amount: 300, assignees: ["Priya", "Aarav", "Rohan"] }
  ]);
  const [formPayer, setFormPayer] = useState("Priya");
  const [formPaymentAmount, setFormPaymentAmount] = useState("");
  const [formPaymentDesc, setFormPaymentDesc] = useState("");
  const [formItemDesc, setFormItemDesc] = useState("");
  const [formItemAmount, setFormItemAmount] = useState("");
  const [formItemAssignees, setFormItemAssignees] = useState([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [copiedLinkState, setCopiedLinkState] = useState(false);
  const [currentView, setCurrentView] = useState("workspace");
  const [dashboardTab, setDashboardTab] = useState("saved");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [prefCurrency, setPrefCurrency] = useState(() => {
    return localStorage.getItem("splitsmart_pref_currency") || "₹";
  });
  const [rates, setRates] = useState(() => {
    const saved = localStorage.getItem("splitsmart_fx_rates");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
      }
    }
    return {
      "₹": 83.3,
      // INR
      "$": 1,
      // USD
      "€": 0.92,
      // EUR
      "£": 0.79,
      // GBP
      "¥": 156.4,
      // JPY
      "C$": 1.37
      // CAD
    };
  });
  const [redirectPathAfterLogin, setRedirectPathAfterLogin] = useState(null);
  const [redirectTabAfterLogin, setRedirectTabAfterLogin] = useState(null);
  const handleNavClick = (view, subTab) => {
    setMobileMenuOpen(false);
    if (view === "workspace") {
      setCurrentView("workspace");
      return;
    }
    if (currentUser) {
      setCurrentView("dashboard");
      if (subTab) {
        setDashboardTab(subTab);
      }
    } else {
      setRedirectPathAfterLogin("dashboard");
      if (subTab) {
        setRedirectTabAfterLogin(subTab);
      }
      setCurrentView("auth");
      triggerToast(`Please log in or sign up to access the interactive dashboard.`);
    }
  };
  useEffect(() => {
    if (currentUser) {
      groupsApi.getAll()
        .then((res) => {
          const fetchedGroups = (res.data.groups || []).map((g) => ({
            ...g,
            category: g.category || "General",
            members: g.members || [],
            expenses: g.expenses || [],
          }));
          setGroups(fetchedGroups);
          if (fetchedGroups.length > 0) {
            setSelectedGroupId(fetchedGroups[0].id);
          } else {
            setSelectedGroupId("");
          }
        })
        .catch((err) => {
          console.warn("Could not retrieve groups from server", err);
          setGroups([]);
          setSelectedGroupId("");
        });
    } else {
      setGroups([]);
      setSelectedGroupId("");
    }
  }, [currentUser]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("splitsmart_theme") || "dark";
  });
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
      document.body.classList.remove("dark");
      document.body.classList.add("light");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
      document.body.classList.remove("light");
      document.body.classList.add("dark");
    }
    localStorage.setItem("splitsmart_theme", theme);
  }, [theme]);
  useEffect(() => {
    const token = getToken();
    if (token) {
      authApi.getCurrentUser()
        .then((res) => {
          const u = res.data;
          setCurrentUser({
            id: u.id,
            username: u.first_name ? `${u.first_name} ${u.last_name || ''}`.trim() : u.email,
            email: u.email,
          });
        })
        .catch(() => {
          clearToken();
        });
    }
  }, []);
  const handleSaveBill = async (titleToSave) => {
    if (!currentUser) {
      triggerToast("Please register or log in first to save your bill report!");
      setCurrentView("auth");
      return;
    }
    const trimmedTitle = titleToSave.trim() || `Split Report (${new Date().toLocaleDateString()})`;
    const currentCalculatedData = getCalculatedData();
    const billData = {
      activeTab,
      rawText,
      participants: currentCalculatedData.names.map((name, idx) => ({ id: `${idx}-${Date.now()}`, name })),
      taxPercent,
      tipPercent,
      currency,
      manualPayments: currentCalculatedData.sourcePayments,
      manualAllocations: currentCalculatedData.sourceAllocations,
    };
    try {
      await billsApi.save(trimmedTitle, billData, currentCalculatedData.computedGrandTotal || 0.01);
      triggerToast(`Saved "${trimmedTitle}" into history log!`);
      setShowSaveModal(false);
      setSaveTitle("");
    } catch (err) {
      console.error("Failed to commit split", err);
      triggerToast(err.response?.data?.error || "Failed to save report.");
    }
  };
  const handleDeleteBill = async (billId) => {
    if (!currentUser) return;
    try {
      await billsApi.delete(billId);
      triggerToast("Split report removed from history log.");
    } catch (err) {
      console.error("Failed to remove bill", err);
      triggerToast("Error removing report.");
    }
  };
  const handleLoadBill = (bill) => {
    setIsProcessing(true);
    setActiveTab(bill.activeTab);
    setRawText(bill.rawText || "");
    setParticipants(bill.participants || []);
    setTaxPercent(bill.taxPercent ?? 8);
    setTipPercent(bill.tipPercent ?? 15);
    setCurrency(bill.currency || "$");
    setManualPayments(bill.manualPayments || []);
    setManualAllocations(bill.manualAllocations || []);
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentView("workspace");
      triggerToast(`Successfully loaded "${bill.title}" workspace context!`);
    }, 400);
  };
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (redirectPathAfterLogin) {
      setCurrentView(redirectPathAfterLogin);
      setRedirectPathAfterLogin(null);
      if (redirectTabAfterLogin) {
        setDashboardTab(redirectTabAfterLogin);
        setRedirectTabAfterLogin(null);
      }
    } else {
      setCurrentView("dashboard");
      setDashboardTab("saved");
    }
  };
  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.warn("Logout API call failed", e);
    }
    clearToken();
    setCurrentUser(null);
    setCurrentView("workspace");
    triggerToast("Logged out successfully. You are now a Guest.");
  };
  const serializeState = () => {
    try {
      const payload = {
        tab: activeTab,
        raw: activeTab === "editor" ? rawText : "",
        parts: activeTab === "form" ? participants : [],
        pays: activeTab === "form" ? manualPayments : [],
        allocs: activeTab === "form" ? manualAllocations : [],
        curr: currency,
        tax: taxPercent,
        tip: tipPercent
      };
      const json = JSON.stringify(payload);
      return btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      }));
    } catch (err) {
      console.error("Failed to serialize", err);
      return "";
    }
  };
  const deserializeState = (encoded) => {
    try {
      const decoded = decodeURIComponent(Array.from(atob(encoded)).map((c) => {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(""));
      return JSON.parse(decoded);
    } catch (err) {
      console.error("Failed to deserialize", err);
      return null;
    }
  };
  const getShareUrl = () => {
    const encoded = serializeState();
    if (!encoded) return window.location.href;
    const url = new URL(window.location.href);
    url.searchParams.set("data", encoded);
    return url.href;
  };
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const encodedData = params.get("data");
      if (encodedData) {
        const state = deserializeState(encodedData);
        if (state) {
          if (state.tab) {
            setActiveTab(state.tab);
          }
          if (state.curr) {
            setCurrency(state.curr);
          }
          if (typeof state.tax === "number") {
            setTaxPercent(state.tax);
          }
          if (typeof state.tip === "number") {
            setTipPercent(state.tip);
          }
          if (state.tab === "editor") {
            if (state.raw !== void 0) {
              setRawText(state.raw);
            }
          } else {
            if (state.parts && state.parts.length > 0) {
              setParticipants(state.parts);
            }
            if (state.pays) {
              setManualPayments(state.pays);
            }
            if (state.allocs) {
              setManualAllocations(state.allocs);
            }
          }
          setTimeout(() => {
            triggerToast("Imported shared bill report successfully!");
          }, 300);
        }
      }
    } catch (err) {
      console.error("Failed to parse shared data on load", err);
    }
  }, []);
  const triggerToast = (msg) => {
    setNotificationMsg(msg);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3e3);
  };
  const handlePresetChange = (presetKey) => {
    setIsProcessing(true);
    setActivePreset(presetKey);
    setRawText(PRESETS[presetKey]);
    if (presetKey === "sushi") {
      setParticipants([
        { id: "1", name: "Priya" },
        { id: "2", name: "Aarav" },
        { id: "3", name: "Rohan" }
      ]);
      setManualPayments([
        { id: "p1", payer: "Priya", amount: 1600, description: "Biryani Platter" },
        { id: "p2", payer: "Aarav", amount: 400, description: "Auto and Extra Lassi" }
      ]);
      setManualAllocations([
        { id: "a1", description: "Tikka Platter", amount: 900, assignees: ["Priya", "Aarav", "Rohan"] },
        { id: "a2", description: "Mocktails", amount: 400, assignees: ["Priya", "Rohan"] },
        { id: "a3", description: "Auto", amount: 200, assignees: ["Aarav", "Rohan"] },
        { id: "a4", description: "Sweet", amount: 300, assignees: ["Priya", "Aarav", "Rohan"] }
      ]);
      setFormPayer("Priya");
    } else if (presetKey === "trip") {
      setParticipants([
        { id: "1", name: "Kabir" },
        { id: "2", name: "Ananya" },
        { id: "3", name: "Dev" }
      ]);
      setManualPayments([
        { id: "p1", payer: "Kabir", amount: 2400, description: "Villa Booking" },
        { id: "p2", payer: "Ananya", amount: 800, description: "Groceries" },
        { id: "p3", payer: "Dev", amount: 600, description: "Petrol Refuel" }
      ]);
      setManualAllocations([
        { id: "a1", description: "Villa Rent", amount: 2400, assignees: ["Kabir", "Ananya", "Dev"] },
        { id: "a2", description: "Groceries", amount: 800, assignees: ["Kabir", "Ananya", "Dev"] },
        { id: "a3", description: "Petrol", amount: 600, assignees: ["Ananya", "Dev"] }
      ]);
      setFormPayer("Kabir");
    } else if (presetKey === "apartment") {
      setParticipants([
        { id: "1", name: "Sneha" },
        { id: "2", name: "Amit" }
      ]);
      setManualPayments([
        { id: "p1", payer: "Sneha", amount: 1800, description: "Wifi & broadband" },
        { id: "p2", payer: "Amit", amount: 600, description: "Cleaning Supplies" }
      ]);
      setManualAllocations([
        { id: "a1", description: "Gigabit Fibre", amount: 1200, assignees: ["Sneha", "Amit"] },
        { id: "a2", description: "Setup Fee", amount: 600, assignees: ["Sneha"] },
        { id: "a3", description: "Supplies", amount: 600, assignees: ["Sneha", "Amit"] }
      ]);
      setFormPayer("Sneha");
    }
    setTimeout(() => {
      setIsProcessing(false);
      triggerToast(`Loaded ${presetKey.toUpperCase()} preset successfully.`);
    }, 450);
  };
  const handleAddParticipant = (e) => {
    e?.preventDefault();
    const nameTrimmed = newParticipantName.trim();
    if (!nameTrimmed) return;
    if (participants.some((p) => p.name.toLowerCase() === nameTrimmed.toLowerCase())) {
      triggerToast(`${nameTrimmed} is already in the list.`);
      return;
    }
    const newP = {
      id: Date.now().toString(),
      name: nameTrimmed
    };
    setParticipants([...participants, newP]);
    setNewParticipantName("");
    triggerToast(`Added ${nameTrimmed} to the group list.`);
  };
  const handleRemoveParticipant = (id, name) => {
    if (participants.length <= 1) {
      triggerToast(`You need at least one participant to split.`);
      return;
    }
    setParticipants(participants.filter((p) => p.id !== id));
    setManualAllocations(manualAllocations.map((item) => ({
      ...item,
      assignees: item.assignees.filter((a) => a !== name)
    })));
    triggerToast(`Removed ${name}.`);
  };
  const triggerAIParsingSim = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      triggerToast("AI Engine: Receipt lines aligned, duplicates sanitized!");
    }, 600);
  };
  const parseBillEngine = () => {
    const lines = rawText.split("\n");
    const parsedParticipantsSet = /* @__PURE__ */ new Set();
    const parsedPayments = [];
    const parsedAllocations = [];
    const paymentRegex = /^([A-Za-z0-9_-]+)\s+paid\s+[\$₹€£]?([0-9.]+)(?:\s+for\s+(.*))?/i;
    const itemRegex = /^([A-Za-z0-9\s#_-]+?)\s+[\$₹€£]?([0-9.]+)\s*(?:[:|for|split])\s*([A-Za-z0-9,;\s]+)/i;
    const genericItemRegex = /^([A-Za-z0-9\s#_]+?)\s+[\$₹€£]?([0-9.]+)$/i;
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("//")) {
        return;
      }
      const mPay = trimmed.match(paymentRegex);
      if (mPay) {
        const name = mPay[1].charAt(0).toUpperCase() + mPay[1].slice(1).toLowerCase();
        const value = parseFloat(mPay[2]);
        const desc = mPay[3]?.trim() || "Payment";
        parsedParticipantsSet.add(name);
        parsedPayments.push({
          id: `p-${index}`,
          payer: name,
          amount: value,
          description: desc
        });
        return;
      }
      const mItem = trimmed.match(itemRegex);
      if (mItem) {
        const itemDesc = mItem[1].trim();
        const value = parseFloat(mItem[2]);
        const rawAssignees = mItem[3].trim();
        let assignees = [];
        if (rawAssignees.toLowerCase() === "all" || rawAssignees.toLowerCase() === "everyone") {
          assignees = [];
        } else {
          assignees = rawAssignees.split(/[,;\s]+/).filter((n) => n.toLowerCase() !== "split" && n.toLowerCase() !== "and" && n.trim() !== "").map((n) => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase());
        }
        assignees.forEach((name) => parsedParticipantsSet.add(name));
        parsedAllocations.push({
          id: `item-${index}`,
          description: itemDesc,
          amount: value,
          assignees
        });
        return;
      }
      const mGeneric = trimmed.match(genericItemRegex);
      if (mGeneric) {
        const itemDesc = mGeneric[1].trim();
        const value = parseFloat(mGeneric[2]);
        parsedAllocations.push({
          id: `item-${index}`,
          description: itemDesc,
          amount: value,
          assignees: []
          // splits among everybody
        });
      }
    });
    let activeParticipants = parsedParticipantsSet.size > 0 ? Array.from(parsedParticipantsSet).map((name, idx) => ({ id: idx.toString(), name })) : participants;
    return {
      activeParticipants,
      payments: parsedPayments,
      allocations: parsedAllocations
    };
  };
  const getCalculatedData = () => {
    let sourceParticipants = [];
    let sourcePayments = [];
    let sourceAllocations = [];
    if (activeTab === "editor") {
      const parsed = parseBillEngine();
      sourceParticipants = parsed.activeParticipants;
      sourcePayments = parsed.payments;
      sourceAllocations = parsed.allocations;
    } else {
      sourceParticipants = participants;
      sourcePayments = manualPayments;
      sourceAllocations = manualAllocations;
    }
    const names = sourceParticipants.map((p) => p.name);
    let parsedSubtotal = 0;
    sourceAllocations.forEach((item) => {
      parsedSubtotal += item.amount;
    });
    let totalDirectPaid = 0;
    sourcePayments.forEach((pay) => {
      totalDirectPaid += pay.amount;
    });
    const debtShare = {};
    names.forEach((name) => {
      debtShare[name] = 0;
    });
    sourceAllocations.forEach((item) => {
      const activeAssignees = item.assignees.length > 0 ? item.assignees.filter((n) => names.includes(n)) : names;
      if (activeAssignees.length === 0) return;
      const share = item.amount / activeAssignees.length;
      activeAssignees.forEach((name) => {
        debtShare[name] = (debtShare[name] || 0) + share;
      });
    });
    const unallocatedDifference = Math.max(0, totalDirectPaid - parsedSubtotal);
    if (unallocatedDifference > 0.01 && names.length > 0) {
      const equalRestShare = unallocatedDifference / names.length;
      names.forEach((name) => {
        debtShare[name] = (debtShare[name] || 0) + equalRestShare;
      });
    }
    const taxFactor = taxPercent / 100;
    const tipFactor = tipPercent / 100;
    const baseToProportionalRatio = parsedSubtotal > 0 ? totalDirectPaid / parsedSubtotal : 1;
    const finalAllocatedTotalTaxAndTip = {};
    let computedSubtotal = 0;
    let computedTaxAmount = 0;
    let computedTipAmount = 0;
    let computedGrandTotal = 0;
    names.forEach((name) => {
      const baseShare = debtShare[name] || 0;
      const taxPart = baseShare * taxFactor;
      const tipPart = baseShare * tipFactor;
      finalAllocatedTotalTaxAndTip[name] = baseShare + taxPart + tipPart;
      computedSubtotal += baseShare;
      computedTaxAmount += taxPart;
      computedTipAmount += tipPart;
    });
    computedGrandTotal = computedSubtotal + computedTaxAmount + computedTipAmount;
    const paymentsPaid = {};
    names.forEach((name) => {
      paymentsPaid[name] = 0;
    });
    sourcePayments.forEach((pay) => {
      if (names.includes(pay.payer)) {
        paymentsPaid[pay.payer] = (paymentsPaid[pay.payer] || 0) + pay.amount;
      }
    });
    const netBalances = {};
    names.forEach((name) => {
      netBalances[name] = paymentsPaid[name] - (finalAllocatedTotalTaxAndTip[name] || 0);
    });
    const settlements = [];
    const tempBalances = { ...netBalances };
    const EPSILON = 0.01;
    let iterations = 0;
    const maxIterations = 50;
    while (iterations < maxIterations) {
      let maxDebtor = null;
      let maxCreditor = null;
      let minValByPayer = EPSILON;
      let maxValByCreditor = -EPSILON;
      names.forEach((name) => {
        const bal = tempBalances[name] || 0;
        if (bal < minValByPayer && bal < -EPSILON) {
          minValByPayer = bal;
          maxDebtor = name;
        }
        if (bal > maxValByCreditor && bal > EPSILON) {
          maxValByCreditor = bal;
          maxCreditor = name;
        }
      });
      if (!maxDebtor || !maxCreditor) {
        break;
      }
      const amountToSettle = Math.min(-minValByPayer, maxValByCreditor);
      if (amountToSettle < EPSILON) {
        break;
      }
      settlements.push({
        from: maxDebtor,
        to: maxCreditor,
        amount: parseFloat(amountToSettle.toFixed(2))
      });
      tempBalances[maxDebtor] += amountToSettle;
      tempBalances[maxCreditor] -= amountToSettle;
      iterations++;
    }
    return {
      names,
      debtShare,
      finalAllocatedTotalTaxAndTip,
      paymentsPaid,
      netBalances,
      settlements,
      computedSubtotal,
      computedTaxAmount,
      computedTipAmount,
      computedGrandTotal,
      sourceAllocations,
      sourcePayments
    };
  };
  const calculated = getCalculatedData();
  const handleAddManualPayment = (e) => {
    e.preventDefault();
    const amountVal = parseFloat(formPaymentAmount);
    if (!formPayer || isNaN(amountVal) || amountVal <= 0) {
      triggerToast("Please select a payer and provide a valid positive amount.");
      return;
    }
    const newPay = {
      id: `p-${Date.now()}`,
      payer: formPayer,
      amount: amountVal,
      description: formPaymentDesc.trim() || "Custom Bill"
    };
    setManualPayments([...manualPayments, newPay]);
    setFormPaymentAmount("");
    setFormPaymentDesc("");
    triggerToast(`Recorded payment: ${formPayer} paid ${currency}${amountVal}`);
  };
  const handleAddManualAllocation = (e) => {
    e.preventDefault();
    const amountVal = parseFloat(formItemAmount);
    if (!formItemDesc.trim() || isNaN(amountVal) || amountVal <= 0) {
      triggerToast("Please fill out item description and enter a valid positive amount.");
      return;
    }
    const assignees = formItemAssignees.length > 0 ? formItemAssignees : [];
    const newAlloc = {
      id: `a-${Date.now()}`,
      description: formItemDesc.trim(),
      amount: amountVal,
      assignees
    };
    setManualAllocations([...manualAllocations, newAlloc]);
    setFormItemAmount("");
    setFormItemDesc("");
    setFormItemAssignees([]);
    triggerToast(`Added item ${formItemDesc.trim()} (${currency}${amountVal})`);
  };
  const toggleFormAssignee = (name) => {
    if (formItemAssignees.includes(name)) {
      setFormItemAssignees(formItemAssignees.filter((n) => n !== name));
    } else {
      setFormItemAssignees([...formItemAssignees, name]);
    }
  };
  const removeManualPayment = (id) => {
    setManualPayments(manualPayments.filter((p) => p.id !== id));
    triggerToast("Payment record removed.");
  };
  const removeManualAllocation = (id) => {
    setManualAllocations(manualAllocations.filter((a) => a !== id));
    triggerToast("Item allocation removed.");
  };
  const handleCopySummary = () => {
    let summaryText = `📊 SplitSmart AI — Bill Settlement Report
`;
    summaryText += `====================================

`;
    summaryText += `💰 Settle Summary:
`;
    if (calculated.settlements.length === 0) {
      summaryText += `   No settlement needed. All balances are perfectly even!
`;
    } else {
      calculated.settlements.forEach((s) => {
        summaryText += `   👉 ${s.from} owes ${s.to} : ${currency}${s.amount.toFixed(2)}
`;
      });
    }
    summaryText += `
💵 Individual Breakdown (Paid vs Owed):
`;
    calculated.names.forEach((name) => {
      const paid = calculated.paymentsPaid[name] || 0;
      const owed = calculated.finalAllocatedTotalTaxAndTip[name] || 0;
      const net = calculated.netBalances[name] || 0;
      summaryText += `   • ${name}: Paid ${currency}${paid.toFixed(2)} | Share ${currency}${owed.toFixed(2)} | Net: ${net >= 0 ? "+" : ""}${currency}${net.toFixed(2)}
`;
    });
    summaryText += `
🧾 Bill Statistics:
`;
    summaryText += `   Subtotal: ${currency}${calculated.computedSubtotal.toFixed(2)}
`;
    summaryText += `   Tax (${taxPercent}%): ${currency}${calculated.computedTaxAmount.toFixed(2)}
`;
    summaryText += `   Tip (${tipPercent}%): ${currency}${calculated.computedTipAmount.toFixed(2)}
`;
    summaryText += `   Grand Total: ${currency}${calculated.computedGrandTotal.toFixed(2)}

`;
    summaryText += `Shared via SplitSmart AI Studio — No math, no tension.`;
    navigator.clipboard.writeText(summaryText);
    setCopiedState(true);
    triggerToast("Settlement report copied directly to clipboard!");
    setTimeout(() => setCopiedState(false), 2e3);
  };
  return <div id="splitsmart-app" className="min-h-screen relative bg-black text-white flex flex-col selection:bg-white/10 selection:text-white transition-colors duration-200">
      


      {
    /* Toast Notification HUD Banner */
  }
      <div
    id="toast-notification-hud"
    className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full bg-neutral-900 border border-white/10 shadow-2xl flex items-center justify-center space-x-3 transition-all duration-300 ${showNotification ? "translate-y-0 opacity-100 scale-100" : "-translate-y-4 opacity-0 scale-95 pointer-events-none"}`}
  >
        <Sparkles className="w-4 h-4 text-white" />
        <span className="text-xs font-mono font-medium tracking-wide text-white/80">{notificationMsg}</span>
      </div>

      {
    /* Sleek, Minimal Glass Navbar - Styled in Sophisticated Dark style */
  }
      <nav id="main-navigation" className="sticky top-0 z-45 bg-black/95 backdrop-blur-md border-b border-white/10 px-4 py-4 md:px-12 md:py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {
    /* Theme custom logo with rotated square */
  }
          <button onClick={() => { setCurrentView("workspace"); setMobileMenuOpen(false); }} className="flex items-center gap-2 focus:outline-none cursor-pointer">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-black rotate-45" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white select-none">SplitSmart</span>
          </button>
        </div>
        
        <div className="hidden md:flex gap-6 text-sm font-medium items-center">
          <button
    id="nav-workspace-tab"
    onClick={() => handleNavClick("workspace")}
    className={`transition bg-transparent border-0 focus:outline-none cursor-pointer font-semibold ${currentView === "workspace" ? "text-white border-b-2 border-white pb-0.5" : "text-white/60 hover:text-white"}`}
  >
            Workspace
          </button>

          <button
    id="nav-dashboard-tab"
    onClick={() => handleNavClick("dashboard")}
    className={`transition bg-transparent border-0 focus:outline-none cursor-pointer font-semibold ${currentView === "dashboard" ? "text-white border-b-2 border-white pb-0.5" : "text-white/60 hover:text-white"}`}
  >
            My Dashboard
          </button>

          <button
    style={{ minHeight: "44px" }}
    onClick={() => { setShowInfoModal(true); setMobileMenuOpen(false); }}
    className="text-white/60 hover:text-white transition bg-transparent border-0 focus:outline-none cursor-pointer text-left font-semibold"
  >
            System Guide
          </button>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          {currentUser && <div className="hidden lg:inline-flex items-center space-x-1 text-xs font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-full select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-white font-bold uppercase tracking-wider">{currentUser.username}</span>
            </div>}

          <div className="hidden md:flex bg-white/5 border border-white/10 rounded-full p-0.5">
            <button
    onClick={() => setCurrency("₹")}
    className={`px-2.5 py-1 text-xs font-mono font-bold rounded-full cursor-pointer ${currency === "₹" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/80"}`}
  >
              ₹
            </button>
            <button
    onClick={() => setCurrency("$")}
    className={`px-2.5 py-1 text-xs font-mono font-bold rounded-full cursor-pointer ${currency === "$" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/80"}`}
  >
              $
            </button>
            <button
    onClick={() => setCurrency("€")}
    className={`px-2.5 py-1 text-xs font-mono font-bold rounded-full cursor-pointer ${currency === "€" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/80"}`}
  >
              €
            </button>
            <button
    onClick={() => setCurrency("£")}
    className={`px-2.5 py-1 text-xs font-mono font-bold rounded-full cursor-pointer ${currency === "£" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/80"}`}
  >
              £
            </button>
          </div>

          {
    /* Theme Toggle Button */
  }
          <button
    id="theme-toggle-btn"
    onClick={() => {
      const nextTheme = theme === "dark" ? "light" : "dark";
      setTheme(nextTheme);
      triggerToast(`Theme switched to ${nextTheme === "dark" ? "Sophisticated Dark" : "Clean Light"}!`);
    }}
    title={theme === "dark" ? "Switch to Clean Light Theme" : "Switch to Sophisticated Dark Theme"}
    className="p-2 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-all cursor-pointer flex items-center justify-center h-8 w-8"
  >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>
          
          <div className="hidden md:block">
            {currentUser ? <button
      onClick={handleLogout}
      className="px-4 py-2 border border-neutral-800 rounded-full text-xs font-mono text-neutral-400 hover:text-red-400 hover:border-red-950 transition bg-neutral-950/40 cursor-pointer"
    >
                Logout
              </button> : <button
      onClick={() => setCurrentView("auth")}
      className="px-5 py-2 rounded-full bg-white text-black text-xs font-extrabold tracking-wider uppercase hover:bg-neutral-200 transition-colors cursor-pointer"
    >
                Login
              </button>}
          </div>

          {/* Hamburger Menu Icon for Mobile view */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-white/80 hover:text-white transition-all cursor-pointer flex items-center justify-center w-8 h-8 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden sticky top-[65px] z-35 bg-zinc-950/98 backdrop-blur-md border-b border-white/10 p-5 space-y-4 animate-fade-in text-left">
          {currentUser && (
            <div className="flex items-center space-x-2 text-xs font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 px-3 py-2.5 rounded-xl justify-center select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white font-bold uppercase tracking-wider">USER: {currentUser.username}</span>
            </div>
          )}
          
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => handleNavClick("workspace")}
              className={`w-full py-3 text-center text-xs font-mono font-extrabold rounded-xl transition-all border ${currentView === "workspace" ? "bg-white text-black border-transparent" : "bg-neutral-900 text-white/80 border-white/10 hover:border-white/20"}`}
            >
              WORKSPACE TERMINAL
            </button>
            <button
              onClick={() => handleNavClick("dashboard")}
              className={`w-full py-3 text-center text-xs font-mono font-extrabold rounded-xl transition-all border ${currentView === "dashboard" ? "bg-white text-black border-transparent" : "bg-neutral-900 text-white/80 border-white/10 hover:border-white/20"}`}
            >
              MY DASHBOARD VAULT
            </button>
            <button
              onClick={() => { setShowInfoModal(true); setMobileMenuOpen(false); }}
              className="w-full py-3 text-center text-xs font-mono font-extrabold rounded-xl transition-all border bg-neutral-900 text-white/80 border-white/10 hover:border-white/20"
            >
              SYSTEM USAGE GUIDE
            </button>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/5">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block text-center font-bold">Select App Base Currency</span>
            <div className="grid grid-cols-4 gap-2 bg-neutral-900 p-1 border border-white/5 rounded-xl">
              <button
                onClick={() => setCurrency("₹")}
                className={`py-2 text-xs font-mono font-bold rounded-lg transition-all text-center ${currency === "₹" ? "bg-white text-black font-extrabold" : "text-white/60 hover:text-white"}`}
              >
                ₹
              </button>
              <button
                onClick={() => setCurrency("$")}
                className={`py-2 text-xs font-mono font-bold rounded-lg transition-all text-center ${currency === "$" ? "bg-white text-black font-extrabold" : "text-white/60 hover:text-white"}`}
              >
                $
              </button>
              <button
                onClick={() => setCurrency("€")}
                className={`py-2 text-xs font-mono font-bold rounded-lg transition-all text-center ${currency === "€" ? "bg-white text-black font-extrabold" : "text-white/60 hover:text-white"}`}
              >
                €
              </button>
              <button
                onClick={() => setCurrency("£")}
                className={`py-2 text-xs font-mono font-bold rounded-lg transition-all text-center ${currency === "£" ? "bg-white text-black font-extrabold" : "text-white/60 hover:text-white"}`}
              >
                £
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5">
            {currentUser ? (
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="w-full py-2.5 border border-red-950 hover:border-red-800 hover:bg-red-950/10 rounded-xl text-xs font-mono font-bold text-red-400 transition"
              >
                LOGOUT SECURELY
              </button>
            ) : (
              <button
                onClick={() => { setCurrentView("auth"); setMobileMenuOpen(false); }}
                className="w-full py-3 rounded-xl bg-white text-black text-xs font-mono font-extrabold tracking-widest uppercase hover:bg-neutral-200 transition-colors"
              >
                LOG IN / SIGN UP
              </button>
            )}
          </div>
        </div>
      )}

      {
    /* Main Container */
  }
      <main className="flex-1">
        
        {currentView === "auth" && <div className="py-12 px-6 flex justify-center items-center bg-black min-h-[70vh]">
            <AuthView
    onLoginSuccess={handleLoginSuccess}
    onCancel={() => setCurrentView("workspace")}
    triggerToast={triggerToast}
  />
          </div>}

        {
    /* Unified Dashboard Console/Desk */
  }
        {currentView === "dashboard" && (currentUser ? <div className="bg-black min-h-[85vh] py-8">
              <div className="max-w-7xl mx-auto px-4 md:px-12">
                {
    /* Header Greeting within page */
  }
                <div className="mb-8 p-6 bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full">
                        Secure Client Sandbox
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                      Welcome, <span className="text-indigo-400">{currentUser.username}</span>!
                    </h2>
                    <p className="text-xs text-zinc-400 font-sans">
                      Manage your saved split reports, multi-user groups vault, expenditures, and query the AI Assistant.
                    </p>
                  </div>
                  
                  {
    /* Dashboard stats/pills inside dashboard page */
  }
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-center min-w-[100px]">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Saved Reports</div>
                      <div className="text-sm font-bold text-white font-mono">—</div>
                    </div>
                    <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-center min-w-[100px]">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Active Groups</div>
                      <div className="text-sm font-bold text-white font-mono">{groups.length}</div>
                    </div>
                    <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-center min-w-[100px]">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Currency</div>
                      <div className="text-sm font-bold text-indigo-400 font-mono">{prefCurrency}</div>
                    </div>
                  </div>
                </div>

                {
    /* Inline Inner Tabs inside the Dashboard page (Not in the Header!) */
  }
                <div className="flex flex-wrap border-b border-zinc-800 mb-8 gap-2">
                  <button
    onClick={() => setDashboardTab("saved")}
    className={`pb-4 px-4 text-sm font-medium transition cursor-pointer flex items-center gap-2 bg-transparent border-0 focus:outline-none ${dashboardTab === "saved" ? "border-b-2 border-white text-white font-bold" : "text-zinc-400 hover:text-white"}`}
  >
                    <Receipt className="w-4 h-4 text-zinc-400" />
                    <span>Saved Reports</span>
                  </button>
                  <button
    onClick={() => setDashboardTab("groups")}
    className={`pb-4 px-4 text-sm font-medium transition cursor-pointer flex items-center gap-2 bg-transparent border-0 focus:outline-none ${dashboardTab === "groups" ? "border-b-2 border-white text-white font-bold" : "text-zinc-400 hover:text-white"}`}
  >
                    <Users className="w-4 h-4 text-zinc-400" />
                    <span>Groups Vault</span>
                  </button>
                  <button
    onClick={() => setDashboardTab("expenses")}
    className={`pb-4 px-4 text-sm font-medium transition cursor-pointer flex items-center gap-2 bg-transparent border-0 focus:outline-none ${dashboardTab === "expenses" ? "border-b-2 border-white text-white font-bold" : "text-zinc-400 hover:text-white"}`}
  >
                    <ArrowRightLeft className="w-4 h-4 text-zinc-400" />
                    <span>Expenses & Settlements</span>
                  </button>
                  <button
    onClick={() => setDashboardTab("ai")}
    className={`pb-4 px-4 text-sm font-medium transition cursor-pointer flex items-center gap-2 bg-transparent border-0 focus:outline-none ${dashboardTab === "ai" ? "border-b-2 border-white text-white font-bold" : "text-zinc-400 hover:text-white"}`}
  >
                    <Sparkles className="w-4 h-4 text-zinc-400" />
                    <span>AI Labs Assistant</span>
                  </button>
                </div>

                {
    /* Subpage Contents */
  }
                {dashboardTab === "saved" && <SavedReportsPage
    currentUser={currentUser}
    onLoadBill={handleLoadBill}
    onDeleteBill={handleDeleteBill}
    onGoToWorkspace={() => setCurrentView("workspace")}
    prefCurrency={prefCurrency}
    setPrefCurrency={setPrefCurrency}
    rates={rates}
    setRates={setRates}
    triggerToast={triggerToast}
  />}

                {dashboardTab === "groups" && <GroupsPage
    currentUser={currentUser}
    groups={groups}
    setGroups={setGroups}
    selectedGroupId={selectedGroupId}
    setSelectedGroupId={setSelectedGroupId}
    prefCurrency={prefCurrency}
    triggerToast={triggerToast}
    navigateToExpenses={() => setDashboardTab("expenses")}
  />}

                {dashboardTab === "expenses" && <ExpensesSettlementsPage
    currentUser={currentUser}
    groups={groups}
    setGroups={setGroups}
    selectedGroupId={selectedGroupId}
    setSelectedGroupId={setSelectedGroupId}
    prefCurrency={prefCurrency}
    triggerToast={triggerToast}
    navigateToGroups={() => setDashboardTab("groups")}
    navigateToWorkspace={() => setCurrentView("workspace")}
  />}

                {dashboardTab === "ai" && <AILabsPage
    currentUser={currentUser}
    triggerToast={triggerToast}
  />}

              </div>
            </div> : <div className="py-12 px-6 flex flex-col justify-center items-center bg-black min-h-[70vh] space-y-6">
              <div className="text-center space-y-2 max-w-sm">
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block">Access Restricted</span>
                <h3 className="text-xl font-bold text-white uppercase">Protected Area</h3>
                <p className="text-xs text-zinc-400 font-light leading-relaxed font-sans">
                  Please log in or sign up to view your private financial dashboard, saved split reports, multi-user groups vault, expenditures, and query the AI Assistant.
                </p>
              </div>
              <AuthView
    onLoginSuccess={handleLoginSuccess}
    onCancel={() => setCurrentView("workspace")}
    triggerToast={triggerToast}
  />
            </div>)}

        {currentView === "workspace" && <>
            {
    /* HERO SECTION — Styled in Sophisticated Dark 2-Column Responsive Layout */
  }
            <section id="splitsmart-hero" className="relative bg-black border-b border-white/10 overflow-hidden py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
            
            {
    /* Left Content */
  }
            <div className="pr-0 lg:pr-8 text-left">
              <div
    id="hero-ai-badge"
    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/70 mb-6 uppercase tracking-widest"
  >
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                AI-Powered Precision
              </div>

              <h1
    id="hero-header-title"
    className="text-5xl sm:text-7xl font-semibold leading-[0.95] tracking-tighter mb-8 text-white"
  >
                Expenses,<br />
                Intelligently<br />
                <span className="text-white/40">Divided.</span>
              </h1>

              <p
    id="hero-lead-description"
    className="text-lg text-white/50 leading-relaxed mb-10 max-w-md font-light"
  >
                The world's first AI-driven expense engine that scans receipts, formats bill logs, and settles group debts dynamically with zero discrepancies.
              </p>

              {
    /* Action Buttons */
  }
              <div id="hero-ctas" className="flex flex-col sm:flex-row gap-4">
                <a
    id="cta-try-sandbox"
    href="#splitsmart-sandbox-section"
    className="px-8 py-4 rounded-xl bg-white text-black font-bold text-base hover:bg-white/90 transition-colors text-center tracking-tight"
  >
                  Get Started Free
                </a>
                
                <button
    id="cta-how-it-works"
    onClick={() => setShowInfoModal(true)}
    className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-base hover:bg-white/10 transition-colors text-center tracking-tight"
  >
                  View Documentation
                </button>
              </div>
            </div>

            {
    /* Right Structural Overlay — High-Fidelity Interactive Quick-Calculator Widget */
  }
            <div className="relative flex justify-center items-center h-full">
              {(() => {
    const calculatedGrandTotal = heroBill + heroBill * (heroTipSel / 100);
    const mockSimNames = ["Priya", "Aarav", "Rohan", "Sneha", "Dev", "Ananya"];
    const activeSimNames = mockSimNames.slice(0, heroPeopleCount);
    let distribution = [];
    const emojis = ["👤", "🦸", "🧙", "🥷", "🧑‍🚀", "🦁"];
    if (heroDryDiner && heroPeopleCount > 1) {
      const dryDinerBase = Math.round(heroBill * 0.15);
      const remainingBase = heroBill - dryDinerBase;
      const standardBase = remainingBase / (heroPeopleCount - 1);
      const tipMultiplier = 1 + heroTipSel / 100;
      activeSimNames.forEach((name, idx) => {
        const isDry = idx === heroPeopleCount - 1;
        const individualBase = isDry ? dryDinerBase : standardBase;
        const finalShare = individualBase * tipMultiplier;
        distribution.push({
          name,
          amount: idx === heroPeopleCount - 1 ? Math.round(dryDinerBase * tipMultiplier) : Math.round(standardBase * tipMultiplier),
          percentage: Math.round(individualBase / heroBill * 100),
          emoji: emojis[idx % emojis.length]
        });
      });
    } else {
      const equalBaseShare = heroBill / heroPeopleCount;
      const finalShare = equalBaseShare * (1 + heroTipSel / 100);
      activeSimNames.forEach((name, idx) => {
        distribution.push({
          name,
          amount: Math.round(finalShare),
          percentage: Math.round(1 / heroPeopleCount * 100),
          emoji: emojis[idx % emojis.length]
        });
      });
    }
    const averageShare = Math.round(calculatedGrandTotal / heroPeopleCount);
    return <div className="w-full max-w-md bg-stone-950/85 backdrop-blur-xl rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.05)] p-6 space-y-5 text-left relative overflow-hidden">
                    
                    {
      /* Glass Glowing Accent Border */
    }
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    
                    {
      /* Widget Header Info */
    }
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400/95 font-bold">
                          Quick Split Live Estimator
                        </span>
                      </div>
                      <span className="bg-white/5 border border-white/10 text-[9px] font-mono px-2 py-0.5 rounded-full text-white/50">
                        Interactive Sandbox
                      </span>
                    </div>

                    {
      /* Instant Calculated Result Block */
    }
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex justify-between items-center">
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Calculated Group Share</span>
                        <div className="text-2xl font-black font-sans text-white tracking-tight flex items-baseline">
                          <span>{currency}{averageShare.toLocaleString()}</span>
                          <span className="text-xs font-normal text-white/40 ml-1">/ person avg</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-white/40 block uppercase tracking-widest">Grand Total</span>
                        <span className="text-sm font-mono font-bold text-white/80">
                          {currency}{Math.round(calculatedGrandTotal).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {
      /* Dynamic Sliders Container */
    }
                    <div className="space-y-4">
                      {
      /* Bill Slider */
    }
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-white/60">Bill Amount:</span>
                          <span className="text-white font-bold">{currency}{heroBill}</span>
                        </div>
                        <input
      type="range"
      min="500"
      max="15000"
      step="100"
      value={heroBill}
      onChange={(e) => setHeroBill(Number(e.target.value))}
      className="w-full h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white focus:outline-none focus:ring-0"
    />
                      </div>

                      {
      /* Controls Row (Friends count + Tip) */
    }
                      <div className="grid grid-cols-2 gap-4">
                        {
      /* Friends selection */
    }
                        <div className="space-y-2">
                          <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider block">Split Across</span>
                          <div className="flex items-center justify-between bg-white/5 border border-white/5 rounded-xl p-1">
                            <button
      onClick={() => setHeroPeopleCount(Math.max(2, heroPeopleCount - 1))}
      className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/15 hover:text-white transition-all text-xs font-bold cursor-pointer"
    >
                              -
                            </button>
                            <span className="text-xs font-mono font-bold text-white/80">{heroPeopleCount} Friends</span>
                            <button
      onClick={() => setHeroPeopleCount(Math.min(6, heroPeopleCount + 1))}
      className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/15 hover:text-white transition-all text-xs font-bold cursor-pointer"
    >
                              +
                            </button>
                          </div>
                        </div>

                        {
      /* Tip selection */
    }
                        <div className="space-y-2">
                          <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider block">Add Tip %</span>
                          <div className="grid grid-cols-4 gap-1 antialiased">
                            {[0, 10, 15, 20].map((t) => <button
      key={t}
      onClick={() => setHeroTipSel(t)}
      className={`py-1.5 rounded-lg text-[9px] font-mono font-semibold border transition-all cursor-pointer text-center ${heroTipSel === t ? "bg-white text-black border-white" : "bg-white/5 text-white/60 border-white/5 hover:bg-white/10"}`}
    >
                                {t}%
                              </button>)}
                          </div>
                        </div>
                      </div>

                      {
      /* Advanced Unequal dry-diner toggle switcher */
    }
                      {heroPeopleCount > 2 && <div className="flex items-center justify-between bg-white/[0.01] border border-white/5 rounded-xl p-3">
                          <div className="space-y-0.5 pr-4">
                            <span className="text-[10px] font-mono font-semibold text-white/85 flex items-center gap-1.5">
                              <span>🍷 Dry Diner Offset Mode</span>
                            </span>
                            <p className="text-[9px] text-white/40 leading-relaxed font-light">
                              Assumes last participant ({mockSimNames[heroPeopleCount - 1]}) consumed 85% less cost.
                            </p>
                          </div>
                          <button
      onClick={() => setHeroDryDiner(!heroDryDiner)}
      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${heroDryDiner ? "bg-indigo-500" : "bg-neutral-800"}`}
    >
                            <span
      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${heroDryDiner ? "translate-x-[20px]" : "translate-x-0"}`}
    />
                          </button>
                        </div>}
                    </div>

                    {
      /* Live Progress visualizer shares list */
    }
                    <div className="space-y-2 bg-white/[0.01] border border-white/5 rounded-2xl p-4">
                      <span className="text-[9px] font-mono text-white/40 block uppercase tracking-widest mb-1">Real-Time Distribution Map</span>
                      <div className="space-y-3">
                        {distribution.map((item, idx) => <div key={item.name} className="space-y-1">
                            <div className="flex justify-between items-center text-[11px]">
                              <div className="flex items-center gap-1.5 font-medium">
                                <span className="text-xs">{item.emoji}</span>
                                <span className="text-white/80">{item.name}</span>
                                {heroDryDiner && heroPeopleCount > 1 && idx === heroPeopleCount - 1 && <span className="text-[8px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1 py-0.2 rounded font-mono uppercase">
                                    Dry Diner
                                  </span>}
                              </div>
                              <span className="font-mono font-bold text-white">
                                {currency}{item.amount}
                              </span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                              <div
      style={{ width: `${item.percentage}%` }}
      className={`h-full rounded-full transition-all duration-300 ${heroDryDiner && heroPeopleCount > 1 && idx === heroPeopleCount - 1 ? "bg-amber-400" : "bg-white"}`}
    />
                            </div>
                          </div>)}
                      </div>
                    </div>

                    {
      /* Proactive Audit Banner note */
    }
                    <div className="text-[9px] font-mono text-white/30 flex items-center justify-between">
                      <span>Proportional precision split rules active</span>
                      <span className="text-[8px] uppercase font-bold tracking-widest text-emerald-400">
                        ● Live simulated
                      </span>
                    </div>

                  </div>;
  })()}
            </div>

          </div>
        </section>

        {
    /* INTERACTIVE WORKSPACE/SANDBOX SECTION — Coordinated with Sophisticated Dark theme elements */
  }
        <section id="splitsmart-sandbox-section" className="bg-black py-16 px-4 sm:px-6 md:px-12 relative scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            
            {
    /* Section Header */
  }
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-white flex items-center space-x-2">
                  <span className="p-1 rounded bg-white/5 border border-white/10 text-white leading-none text-base">✨</span>
                  <span>Interactive Split Engine Workspace</span>
                </h2>
                <p className="text-sm text-white/50 mt-1">
                  Adjust raw receipts, edit preset scenarios, or add manual items. Watch the settlement graph calculate instantly.
                </p>
              </div>

              {
    /* Preset Switcher Pills */
  }
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-white/40 mr-2 font-bold select-none">PRESETS:</span>
                <button
    onClick={() => handlePresetChange("sushi")}
    className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${activePreset === "sushi" ? "bg-white text-black border-white font-bold" : "bg-white/5 text-white/60 border-white/10 hover:text-white"}`}
  >
                  🍣 SUSHI DAFU
                </button>
                <button
    onClick={() => handlePresetChange("trip")}
    className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${activePreset === "trip" ? "bg-white text-black border-white font-bold" : "bg-white/5 text-white/60 border-white/10 hover:text-white"}`}
  >
                  🌲 WOODS CABIN
                </button>
                <button
    onClick={() => handlePresetChange("apartment")}
    className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${activePreset === "apartment" ? "bg-white text-black border-white font-bold" : "bg-white/5 text-white/60 border-white/10 hover:text-white"}`}
  >
                  🏢 APT UTILITIES
                </button>
              </div>
            </div>

            {
    /* THE CENTRAL BENTO GRID CONTAINER CARD */
  }
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white/[0.01] border border-white/10 rounded-3xl overflow-hidden p-6 md:p-8 relative">
              
              {
    /* Left Workspace Panel — Input Terminal & Settings (Col-span 7) */
  }
              <div className="lg:col-span-7 flex flex-col space-y-6 text-left">
                
                {
    /* Mode Selector Header */
  }
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex space-x-1 bg-white/5 p-1 rounded-xl">
                    <button
    onClick={() => {
      setActiveTab("editor");
      triggerToast("Switched to Natural Text Parsing Mode");
    }}
    className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all ${activeTab === "editor" ? "bg-black text-white border border-white/10" : "text-white/60 hover:text-white"}`}
  >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Natural Text Parser</span>
                    </button>
                    <button
    onClick={() => {
      setActiveTab("form");
      triggerToast("Switched to Manual Form Builder Mode");
    }}
    className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all ${activeTab === "form" ? "bg-black text-white border border-white/10" : "text-white/60 hover:text-white"}`}
  >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Visual Form Builder</span>
                    </button>
                  </div>

                  {activeTab === "editor" && <button
    onClick={triggerAIParsingSim}
    className="text-[10px] font-mono tracking-wider bg-white/5 border border-white/10 hover:bg-white/10 px-2 py-1 text-white/80 rounded-md flex items-center space-x-1 transition-all"
  >
                      <RefreshCw className={`w-3 h-3 ${isProcessing ? "animate-spin" : ""}`} />
                      <span>AUTO-FORMAT</span>
                    </button>}
                </div>

                {
    /* TAB 1: Natural Text Sandbox Area */
  }
                {activeTab === "editor" && <div className="flex flex-col space-y-3">
                    
                    {
    /* Expandable AI Receipt Scanner Banner/Widget */
  }
                    <div className="bg-stone-900/40 border border-white/10 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Receipt className="w-4 h-4 text-emerald-400 animate-pulse" />
                          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            AI Receipt Scanner
                            <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.2 rounded font-sans uppercase">Gemini 3.5</span>
                          </span>
                        </div>
                        <button
    onClick={() => setShowScanner(!showScanner)}
    className={`text-[9.5px] font-mono px-3 py-1 rounded-full border transition-all cursor-pointer ${showScanner ? "bg-white text-black border-white hover:bg-neutral-200" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"}`}
  >
                          {showScanner ? "CLOSE SCANNER" : "SCAN BILL WITH AI ✨"}
                        </button>
                      </div>

                      {showScanner && <div className="space-y-4 pt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                          
                          {
    /* File drop zone OR preview */
  }
                          {!receiptImage ? <div
    onDragOver={handleDragOver}
    onDragLeave={handleDragLeave}
    onDrop={handleDrop}
    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all flex flex-col items-center justify-center space-y-2 cursor-pointer ${dragActive ? "border-white bg-white/10" : "border-white/10 bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.02]"}`}
    onClick={() => document.getElementById("receipt-file-input")?.click()}
  >
                              <input
    id="receipt-file-input"
    type="file"
    accept="image/*"
    onChange={handleFileChange}
    className="hidden"
  />
                              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/15">
                                <Receipt className="w-5 h-5 text-emerald-400" />
                              </div>
                              <div className="space-y-1 select-none pointer-events-none">
                                <p className="text-xs font-mono font-bold text-white/90">
                                  Drag & drop your receipt image here, or <span className="underline text-emerald-400">browse</span>
                                </p>
                                <p className="text-[10px] font-mono text-white/40">
                                  Supports JPG, PNG, WEBP (Server-side Multimodal Extraction)
                                </p>
                              </div>
                            </div> : <div className="border border-white/10 rounded-xl p-4 bg-black/50 space-y-4 flex flex-col sm:flex-row items-center gap-4">
                              <div className="relative w-32 h-32 rounded-lg border border-white/10 bg-stone-950 overflow-hidden shrink-0 flex items-center justify-center">
                                <img
    src={receiptImage}
    alt="Receipt preview"
    className="object-contain w-full h-full"
    referrerPolicy="no-referrer"
  />
                                <button
    type="button"
    disabled={isScanning}
    onClick={() => setReceiptImage(null)}
    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/85 border border-white/20 text-white flex items-center justify-center text-xs hover:bg-black transition-colors"
  >
                                  ×
                                </button>
                              </div>
                              
                              <div className="flex-1 space-y-2.5 w-full text-center sm:text-left">
                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  Receipt Image Loaded
                                </span>
                                <h4 className="text-xs font-mono font-bold text-white/95 leading-relaxed">
                                  Pixel matrix converted dynamically. Ready to analyze.
                                </h4>
                                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                  <button
    type="button"
    disabled={isScanning}
    onClick={() => handleReceiptScan(receiptImage)}
    className="px-4 py-2 bg-white text-black hover:bg-neutral-200 rounded-lg text-xs font-mono font-black uppercase transition-all cursor-pointer flex items-center justify-center space-x-1"
  >
                                    {isScanning ? <>
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                        <span>Analyzing...</span>
                                      </> : <>
                                        <Sparkles className="w-3.5 h-3.5 mr-1.5 text-black animate-pulse" />
                                        <span>Start AI Scan</span>
                                      </>}
                                  </button>
                                  <button
    type="button"
    disabled={isScanning}
    onClick={() => setReceiptImage(null)}
    className="px-4 py-2 bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white rounded-lg text-xs font-mono transition-all cursor-pointer"
  >
                                    Clear Image
                                  </button>
                                </div>
                              </div>
                            </div>}

                          {
    /* Interactive Sample Receipts Selector */
  }
                          {!isScanning && <div className="space-y-2 pt-1 border-t border-white/5">
                              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block font-bold">
                                Or try an instant simulated sample receipt scan
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <button
    type="button"
    onClick={() => {
      const base64 = generateSampleReceiptImage("cafe");
      setReceiptImage(base64);
      handleReceiptScan(base64);
    }}
    className="py-2.5 px-3 rounded-xl bg-stone-900/60 border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all cursor-pointer text-left font-mono"
  >
                                  <div className="font-bold text-white text-[11px] mb-0.5 flex items-center justify-between">
                                    <span>☕ Stardust Coffee</span>
                                    <span className="text-[8px] text-emerald-400 font-bold bg-emerald-400/10 px-1 rounded">SCAN</span>
                                  </div>
                                  <div className="text-white/40 text-[9px] leading-normal font-light">4 items • 18% Tax • ₹1,305.60</div>
                                </button>
                                <button
    type="button"
    onClick={() => {
      const base64 = generateSampleReceiptImage("pizza");
      setReceiptImage(base64);
      handleReceiptScan(base64);
    }}
    className="py-2.5 px-3 rounded-xl bg-stone-900/60 border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all cursor-pointer text-left font-mono"
  >
                                  <div className="font-bold text-white text-[11px] mb-0.5 flex items-center justify-between">
                                    <span>🍕 Bella Trattoria</span>
                                    <span className="text-[8px] text-emerald-400 font-bold bg-emerald-400/10 px-1 rounded">SCAN</span>
                                  </div>
                                  <div className="text-white/40 text-[9px] leading-normal font-light">4 items • 12% Tax • ₹1,612.90</div>
                                </button>
                                <button
    type="button"
    onClick={() => {
      const base64 = generateSampleReceiptImage("supermarket");
      setReceiptImage(base64);
      handleReceiptScan(base64);
    }}
    className="py-2.5 px-3 rounded-xl bg-stone-900/60 border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all cursor-pointer text-left font-mono"
  >
                                  <div className="font-bold text-white text-[11px] mb-0.5 flex items-center justify-between">
                                    <span>🍏 Nature Grocery</span>
                                    <span className="text-[8px] text-emerald-400 font-bold bg-emerald-400/10 px-1 rounded">SCAN</span>
                                  </div>
                                  <div className="text-white/40 text-[9px] leading-normal font-light">4 items • 5% Tax • ₹945.00</div>
                                </button>
                              </div>
                            </div>}

                          {
    /* Loading Status Indicator */
  }
                          {isScanning && <div className="bg-emerald-500/5 border border-emerald-500/25 rounded-xl p-3.5 flex items-center space-x-3 text-xs font-mono text-emerald-400 animate-pulse">
                              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400 shrink-0" />
                              <div className="space-y-1">
                                <p className="font-bold text-[11px]">{scanStatus}</p>
                                <p className="text-[9px] text-white/40 font-light leading-relaxed">Extracting store, currency, items, taxes, and service charges directly into the text editor...</p>
                              </div>
                            </div>}

                        </div>}
                    </div>

                    <div className="flex justify-between items-center text-xs font-mono text-white/60 font-bold uppercase tracking-wider">
                      <label htmlFor="raw-bill-textarea" className="flex items-center space-x-1">
                        <span>⌨ Edit conversational log info</span>
                        <span className="text-xs text-white/45 font-normal italic">(Real-time parsed)</span>
                      </label>
                      <span className="text-[11px] text-white/80 bg-white/10 px-2 py-0.5 rounded-full font-semibold">Live parsing active</span>
                    </div>

                    <div className="relative">
                      <textarea
    id="raw-bill-textarea"
    value={rawText}
    onChange={(e) => setRawText(e.target.value)}
    placeholder={`Priya paid ₹1000
Aarav paid ₹200

Tikka ₹400: Priya, Aarav`}
    className="w-full h-80 bg-black text-white p-4 rounded-2xl font-mono text-sm leading-6 border border-white/10 focus:border-white/30 focus:outline-none focus:ring-0 resize-y transition-all"
    spellCheck="false"
  />
                      {isProcessing && <div className="absolute inset-0 bg-black/80 rounded-2xl flex items-center justify-center">
                          <div className="flex flex-col items-center space-y-2">
                            <RefreshCw className="w-8 h-8 text-white animate-spin" />
                            <span className="text-xs font-mono text-white/50">Processing with ParseEngine...</span>
                          </div>
                        </div>}
                    </div>
                    
                    {
    /* Grammar quick lookup tips */
  }
                    <p className="text-[10px] font-mono text-white/40 leading-normal">
                      💡 <strong className="text-white/60">Syntax Tip:</strong> Use <code className="text-white/80 font-bold bg-white/5 px-1 py-0.5 rounded">Name paid $Value</code> for cash payments, and <code className="text-white/80 font-bold bg-white/5 px-1 py-0.5 rounded">ItemName $Value: Name1, Name2</code> to allocate items explicitly.
                    </p>
                  </div>}

                {
    /* TAB 2: Custom Manual Form Input Area */
  }
                {activeTab === "form" && <div className="space-y-6">
                    
                    {
    /* Step 1: Record Cash Payments */
  }
                    <div className="bg-white/[0.01] p-4 border border-white/10 rounded-2xl space-y-4">
                      <h3 className="text-xs font-mono font-extrabold uppercase tracking-widest text-white/80 flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        <span>Step 1: Track Payments Made</span>
                      </h3>
                      
                      <form onSubmit={handleAddManualPayment} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-mono text-white/40 mb-1">SELECT PAYER</label>
                          <select
    value={formPayer}
    onChange={(e) => setFormPayer(e.target.value)}
    className="w-full bg-black border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white/30"
  >
                            {participants.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                          </select>
                        </div>
                        <div className="sm:col-span-4">
                          <label className="block text-[10px] font-mono text-white/40 mb-1">DESCRIPTION</label>
                          <input
    type="text"
    placeholder="e.g. Car Rental, Wine"
    value={formPaymentDesc}
    onChange={(e) => setFormPaymentDesc(e.target.value)}
    className="w-full bg-black border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white/30"
  />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-mono text-white/40 mb-1">AMOUNT ({currency})</label>
                          <input
    type="number"
    step="any"
    placeholder="0.00"
    value={formPaymentAmount}
    onChange={(e) => setFormPaymentAmount(e.target.value)}
    className="w-full bg-black border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white/30"
  />
                        </div>
                        <div className="sm:col-span-2 flex items-end">
                          <button
    type="submit"
    className="w-full bg-white hover:bg-neutral-200 text-black rounded-lg py-1.5 text-xs font-mono font-bold uppercase transition-all cursor-pointer"
  >
                            Add
                          </button>
                        </div>
                      </form>

                      {
    /* Cash Payments Table list */
  }
                      <div className="max-h-36 overflow-y-auto border border-white/5 rounded-xl bg-black/50 p-2 space-y-1">
                        {manualPayments.length === 0 ? <div className="text-center py-4 text-xs font-mono text-white/30">No payments added yet.</div> : manualPayments.map((pay) => <div key={pay.id} className="flex justify-between items-center text-xs font-mono bg-white/[0.01] p-2 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                              <span className="text-white/80">
                                <strong className="text-white">{pay.payer}</strong> paid <span className="text-white">{currency}{pay.amount.toFixed(2)}</span> ({pay.description})
                              </span>
                              <button
    onClick={() => removeManualPayment(pay.id)}
    className="text-white/40 hover:text-white transition-colors cursor-pointer"
  >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>)}
                      </div>
                    </div>

                    {
    /* Step 2: Custom Item Allocation Block */
  }
                    <div className="bg-white/[0.01] p-4 border border-white/10 rounded-xl space-y-4">
                      <h3 className="text-xs font-mono font-extrabold uppercase tracking-widest text-white/80 flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        <span>Step 2: Allocate Bill Items Specific Shares</span>
                      </h3>

                      <form onSubmit={handleAddManualAllocation} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-5">
                          <label className="block text-[10px] font-mono text-white/40 mb-1">ITEM (e.g. Ribeye, Wine)</label>
                          <input
    type="text"
    placeholder="e.g. Steak"
    value={formItemDesc}
    onChange={(e) => setFormItemDesc(e.target.value)}
    className="w-full bg-black border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white/30"
  />
                        </div>
                        <div className="sm:col-span-4">
                          <label className="block text-[10px] font-mono text-white/40 mb-1">COST ({currency})</label>
                          <input
    type="number"
    step="any"
    placeholder="0.00"
    value={formItemAmount}
    onChange={(e) => setFormItemAmount(e.target.value)}
    className="w-full bg-black border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white/30"
  />
                        </div>
                        <div className="sm:col-span-3 flex items-end">
                          <button
    type="submit"
    className="w-full bg-white hover:bg-neutral-200 text-black rounded-lg py-1.5 text-xs font-mono font-bold uppercase transition-all cursor-pointer"
  >
                            Book Item
                          </button>
                        </div>
                        
                        {
    /* Selector of which participants specifically share it */
  }
                        <div className="sm:col-span-12">
                          <label className="block text-[10px] font-mono text-white/40 mb-1.5 uppercase">SPECIFIC SPLIT ASSIGNEES (Deselect all to split equally among everyone)</label>
                          <div className="flex flex-wrap gap-1.5">
                            {participants.map((p) => {
    const isChecked = formItemAssignees.includes(p.name);
    return <button
      type="button"
      key={p.id}
      onClick={() => toggleFormAssignee(p.name)}
      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${isChecked ? "bg-white text-black border-white font-bold" : "bg-black text-white/40 border-white/10 hover:text-white hover:border-white/30"}`}
    >
                                  {p.name} {isChecked ? "✓" : ""}
                                </button>;
  })}
                          </div>
                        </div>
                      </form>

                      {
    /* Item allocation table database list */
  }
                      <div className="max-h-40 overflow-y-auto border border-white/5 rounded-xl bg-black/50 p-2 space-y-1">
                        {manualAllocations.length === 0 ? <div className="text-center py-4 text-xs font-mono text-white/30">No allocated split items added.</div> : manualAllocations.map((item) => <div key={item.id} className="flex justify-between items-center text-xs font-mono bg-white/[0.01] p-2 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                              <span className="text-white/80">
                                <span className="text-white/40">{item.description}</span> — <span className="text-white font-semibold">{currency}{item.amount.toFixed(2)}</span>
                                <span className="text-[10px] text-white/30 ml-2">
                                  for: {item.assignees.length === 0 ? "All Group Members" : item.assignees.join(", ")}
                                </span>
                              </span>
                              <button
    onClick={() => removeManualAllocation(item.id)}
    className="text-white/40 hover:text-white transition-colors cursor-pointer"
  >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>)}
                      </div>
                    </div>

                  </div>}

                {
    /* Surcharges Adjustments: Tip & Tax (Proportional controls) */
  }
                <div className="bg-white/5 p-4 border border-white/10 rounded-2xl space-y-4">
                  <h3 className="text-xs font-mono font-bold text-white/80 tracking-wider uppercase flex items-center space-x-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-white/50" />
                    <span>Real-time Surcharges (Proportional Added Costs)</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {
    /* Tax percent slider */
  }
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <label htmlFor="tax-percent-slider" className="text-white/50">VAT/Tax</label>
                        <span className="font-bold text-white font-mono">{taxPercent}%</span>
                      </div>
                      <input
    id="tax-percent-slider"
    type="range"
    min="0"
    max="30"
    value={taxPercent}
    onChange={(e) => setTaxPercent(parseInt(e.target.value))}
    className="w-full accent-white bg-neutral-900 h-1 cursor-pointer rounded-lg"
  />
                    </div>
                    {
    /* Tip percent slider */
  }
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <label htmlFor="tip-percent-slider" className="text-white/50">Tip/Service Charge</label>
                        <span className="font-bold text-white font-mono">{tipPercent}%</span>
                      </div>
                      <input
    id="tip-percent-slider"
    type="range"
    min="0"
    max="35"
    value={tipPercent}
    onChange={(e) => setTipPercent(parseInt(e.target.value))}
    className="w-full accent-white bg-neutral-900 h-1 cursor-pointer rounded-lg"
  />
                    </div>
                  </div>
                </div>

                {
    /* Group Participant Management badge list */
  }
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label htmlFor="add-participant-input" className="text-xs font-mono text-white/50 uppercase tracking-widest font-bold">
                      👥 Group Members ({participants.length})
                    </label>
                  </div>
                  
                  {
    /* Participant fast creation input */
  }
                  <form onSubmit={handleAddParticipant} className="flex gap-2">
                    <input
    id="add-participant-input"
    type="text"
    placeholder="Enter new friend name..."
    value={newParticipantName}
    onChange={(e) => setNewParticipantName(e.target.value)}
    className="flex-1 bg-black border border-white/10 hover:border-white/25 focus:border-white focus:outline-none rounded-lg px-3 py-2 text-xs font-mono text-white transition-all"
  />
                    <button
    type="submit"
    className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider flex items-center space-x-1 cursor-pointer transition-all"
  >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Member</span>
                    </button>
                  </form>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {participants.map((p) => <div
    key={p.id}
    className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg hover:border-white/20 transition-all font-mono text-xs select-none"
  >
                        <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
                        <span className="text-white/80">{p.name}</span>
                        <button
    onClick={() => handleRemoveParticipant(p.id, p.name)}
    className="text-white/30 hover:text-white transition-all font-sans pl-1 text-[13px] leading-none focus:outline-none cursor-pointer"
    aria-label={`Remove ${p.name}`}
  >
                          ×
                        </button>
                      </div>)}
                    {participants.length === 0 && <p className="text-xs text-white/30 font-mono italic">No participants in list. Parse text or add above.</p>}
                  </div>
                </div>

              </div>

              {
    /* Right Output Panel — Real-Time Calculations (Col-span 5) */
  }
              <div className="lg:col-span-5 flex flex-col space-y-6 lg:border-l lg:border-white/10 lg:pl-8 text-left">
                
                {
    /* Header overview totals */
  }
                <div className="bg-white/[0.02] rounded-2xl p-5 border border-white/10 space-y-3.5">
                  <div className="flex justify-between items-center pb-2.5 border-b border-white/5">
                    <span className="text-xs font-mono text-white/55 tracking-wider font-semibold">RUNNING GRAND TOTAL</span>
                    <span className="text-[10px] font-mono font-bold bg-white/10 text-white border border-white/15 px-2 py-0.5 rounded-full uppercase">
                      Proportional Settle
                    </span>
                  </div>
                  
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-4xl font-mono font-extrabold tracking-tight text-white mb-2 leading-none">
                      {currency}{calculated.computedGrandTotal.toFixed(2)}
                    </span>
                    <span className="text-xs font-mono text-white/40">Total Settled</span>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono border-t border-white/5 pt-3">
                    <div className="flex justify-between text-white/50">
                      <span>Subtotal of Items:</span>
                      <span className="font-semibold text-white">{currency}{calculated.computedSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white/50">
                      <span>Proportional Tax ({taxPercent}%):</span>
                      <span className="font-semibold text-white">{currency}{calculated.computedTaxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white/50">
                      <span>Proportional Tip ({tipPercent}%):</span>
                      <span className="font-semibold text-white">{currency}{calculated.computedTipAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {
    /* Settle Debts visual flow diagram */
  }
                <div className="space-y-3">
                  <span className="text-xs font-mono text-white/50 uppercase tracking-widest font-bold block">
                    ⚡ Debt Clearance Path (Settlement)
                  </span>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {calculated.settlements.length === 0 ? <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 text-center">
                        <PiggyBank className="w-8 h-8 text-white/20 mx-auto mb-2" />
                        <span className="text-xs font-mono text-white/40 block">All balances are perfectly clear. None owe anything!</span>
                      </div> : calculated.settlements.map((s, idx) => <div
    key={idx}
    className="bg-white/[0.02] border border-white/10 rounded-xl p-3 flex items-center justify-between font-mono text-xs transition-colors hover:border-white/20"
  >
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-white">{s.from}</span>
                            <span className="text-[10px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded-full border border-white/5">Transfer</span>
                            <span className="font-semibold text-white">{s.to}</span>
                          </div>
                          
                          <div className="text-right flex items-center space-x-1">
                            <span className="text-white font-extrabold text-sm">{currency}{s.amount.toFixed(2)}</span>
                          </div>
                        </div>)}
                  </div>
                </div>

                {
    /* Individual ledger report meters */
  }
                <div className="space-y-3">
                  <span className="text-xs font-mono text-white/50 uppercase tracking-widest font-bold block">
                    📊 Individual Net balance Ledger
                  </span>

                  <div className="space-y-2.5 max-h-60 overflow-y-auto">
                    {calculated.names.map((name) => {
    const net = calculated.netBalances[name] || 0;
    const paid = calculated.paymentsPaid[name] || 0;
    const share = calculated.finalAllocatedTotalTaxAndTip[name] || 0;
    const isCredit = net >= 0.01;
    const isDebt = net <= -0.01;
    const maxNetAbs = Math.max(...calculated.names.map((n) => Math.abs(calculated.netBalances[n] || 0)), 1);
    const barWidthPercent = Math.min(100, Math.round(Math.abs(net) / maxNetAbs * 100));
    return <div key={name} className="bg-white/[0.01] p-3 rounded-xl border border-white/5 space-y-2 hover:border-white/10 transition-colors">
                          <div className="flex justify-between items-center text-xs font-mono">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-semibold text-white">{name}</span>
                              <span className="text-[10px] text-white/40">
                                (Spent {currency}{paid.toFixed(1)})
                              </span>
                            </div>

                            <span className={`font-mono font-bold ${isCredit ? "text-white" : isDebt ? "text-white/40" : "text-white/20"}`}>
                              {isCredit ? "+" : ""}{currency}{net.toFixed(2)}
                            </span>
                          </div>

                          {
      /* Progressive ledger visualizer bar in monochrome style */
    }
                          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <div
      className={`h-full rounded-full transition-all duration-500 ${isCredit ? "bg-white" : isDebt ? "bg-white/40" : "bg-white/10"}`}
      style={{ width: `${barWidthPercent}%` }}
    />
                          </div>

                          <div className="flex justify-between text-[10px] font-mono text-white/30">
                            <span>Adjusted Share: {currency}{share.toFixed(2)}</span>
                            <span>{isCredit ? "Receives Money" : isDebt ? "Owes Money" : "Sufficiently Paid"}</span>
                          </div>
                        </div>;
  })}
                  </div>
                </div>

                {
    /* AI Smart Audit Briefing (No external APIs, extremely crisp) */
  }
                <div className="bg-white/[0.02] border border-white/10 p-4 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-white/80">
                      <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                      <span>Smart Split Audit Summary</span>
                    </div>
                    <span className="text-[10px] font-mono text-white/40">Optimized</span>
                  </div>

                  <p className="text-xs text-white/50 font-light leading-relaxed">
                    🌟 <strong>Audit Verdict:</strong> Calculated a group total of <strong>{currency}{calculated.computedGrandTotal.toFixed(2)}</strong> across <strong>{calculated.names.length} members</strong>. 
                    {calculated.names.length > 0 && <>
                        {" "}The largest single contributor was <strong>{calculated.names.reduce((a, b) => (calculated.paymentsPaid[a] || 0) > (calculated.paymentsPaid[b] || 0) ? a : b, calculated.names[0])}</strong>.
                      </>}
                    {calculated.settlements.length > 0 ? <>
                        {" "}The debt engine successfully minimized the balance clearance into <strong>{calculated.settlements.length} streamlined transaction{calculated.settlements.length > 1 ? "s" : ""}</strong>. All decimals are perfectly balanced to zero-discrepancy.
                      </> : " No transaction records are necessary as everyone is perfectly balanced."}
                  </p>
                </div>

                {
    /* Settle / Share actions */
  }
                <div className="space-y-2 pt-2">
                  <button
    onClick={handleCopySummary}
    className="w-full py-3 bg-white hover:bg-neutral-200 text-black transition-all rounded-lg font-mono font-extrabold text-xs tracking-widest uppercase flex items-center justify-center space-x-2 shadow-md cursor-pointer"
  >
                    {copiedState ? <Check className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                    <span>{copiedState ? "COPIED SUMMARY!" : "COPY SETTLEMENT REPORT"}</span>
                  </button>

                  <button
    onClick={() => {
      setShowQRModal(true);
      triggerToast("Generated scannable QR Code link!");
    }}
    className="w-full py-3 bg-neutral-900 border border-white/15 hover:bg-neutral-800 hover:border-white/30 text-white transition-all rounded-lg font-mono font-extrabold text-xs tracking-widest uppercase flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
  >
                    <QrCode className="w-4 h-4 text-white" />
                    <span>SHARE BILL WITH QR</span>
                  </button>

                  <button
    onClick={() => {
      if (!currentUser) {
        triggerToast("Please sign up or log in first to save your bill split!");
        setRedirectPathAfterLogin("dashboard");
        setRedirectTabAfterLogin("saved");
        setCurrentView("auth");
      } else {
        setShowSaveModal(true);
        setSaveTitle(`Split Bill - ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`);
      }
    }}
    className="w-full py-3 bg-black border border-white/10 hover:border-white/20 hover:bg-neutral-950 text-neutral-200 hover:text-white transition-all rounded-lg font-mono font-extrabold text-xs tracking-widest uppercase flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
  >
                    <PiggyBank className="w-4 h-4 text-white" />
                    <span>SAVE BILL TO DASHBOARD</span>
                  </button>

                  <div className="flex justify-between items-center text-[10px] font-mono text-white/40">
                    <span className="flex items-center gap-1">🟢 Standard logic applied</span>
                    <button
    onClick={() => triggerToast("Simulated linking database - exported")}
    className="hover:text-white cursor-pointer transition-colors flex items-center space-x-0.5 text-[10px]"
  >
                      <span>Export Database Ledger</span>
                      <Share2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </section>

        {
    /* FEATURES GRID SECTION — Built in Sophisticated Dark aesthetic, solid black backplane */
  }
        <section id="features-anchor" className="bg-black py-16 border-t border-b border-white/10 px-4 sm:px-6 md:px-12">
          <div className="max-w-6xl mx-auto space-y-12 text-center">
            
            <div className="max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-mono font-bold tracking-widest text-white/30 uppercase">Engine Capabilities</span>
              <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">Structured to clear bill tension</h2>
              <p className="text-xs md:text-sm text-white/50 leading-relaxed font-light">
                SplitSmart is engineered to minimize group debt transactions with absolute transparency. Built for modern fast-splitting without signups.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              
              {
    /* Feature 1 */
  }
              <div className="bg-white/[0.01] p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors flex flex-col space-y-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white flex items-center justify-center font-mono font-bold text-xs">
                  01
                </div>
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">Natural Language Parsing</h3>
                <p className="text-xs text-white/50 font-light leading-relaxed">
                  Simply paste chat details, receipt summaries, or rough text lists. Our custom text-parse engine isolates names, payments and balances live on keystroke.
                </p>
              </div>

              {
    /* Feature 2 */
  }
              <div className="bg-white/[0.01] p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors flex flex-col space-y-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white flex items-center justify-center font-mono font-bold text-xs">
                  02
                </div>
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">Proportional Distributions</h3>
                <p className="text-xs text-white/50 font-light leading-relaxed">
                  Tax and tips are calculated dynamically on item weights. If someone had a cheap appetizer and you had a premium steak, your tip share is proportionate.
                </p>
              </div>

              {
    /* Feature 3 */
  }
              <div className="bg-white/[0.01] p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors flex flex-col space-y-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white flex items-center justify-center font-mono font-bold text-xs">
                  03
                </div>
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">Transaction Minimizer</h3>
                <p className="text-xs text-white/50 font-light leading-relaxed">
                  We use an advanced greedy graph solver to resolve debts. Instead of a mess of micro-payments, we calculate the absolute limit of transfers to clear the ledger.
                </p>
              </div>

            </div>

          </div>
        </section>

        {
    /* DETAILED ALGORITHM GUIDE SECTION */
  }
        <section id="api-reference" className="bg-black py-16 px-4 sm:px-6 md:px-12 text-left">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded bg-white/5 border border-white/10 font-mono text-xs font-bold text-white">ALG</span>
              <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wider">Settlement Math Specification</h2>
            </div>

            <div className="bg-white/[0.01] border border-white/10 rounded-2xl p-5 space-y-4 font-mono text-xs text-white/55 leading-relaxed">
              <p>
                To maintain mathematical honesty, the SplitSmart transaction optimizer runs a greedy flow balancer:
              </p>
              <ol className="list-decimal pl-5 space-y-2 text-white/60">
                <li>
                  <strong className="text-white">Calculate Gross Payments:</strong> Sum every transaction cash segment paid directly by each participant <code className="text-white/80">P[i]</code>.
                </li>
                <li>
                  <strong className="text-white">Calculate Itemized Debt:</strong> Allocate each recipe details cost <code className="text-white/80">C[j]</code> divided by number of participant assignees. Unallocated balance splits equally to maintain parity.
                </li>
                <li>
                  <strong className="text-white">Form Proportional Taxes:</strong> Adjust individual totals by multiplying with <code className="text-white/85">(1 + Tax% + Tip%)</code>.
                </li>
                <li>
                  <strong className="text-white">Perform Graph Reduction:</strong> Calculate net balance <code className="text-white/85">Balance[i] = Paid[i] - Owed[i]</code>. Sort people into Creditors (<code className="text-white/85">Balance &gt; 0</code>) and Debtors (<code className="text-white/85">Balance &lt; 0</code>). Pair the largest debtor with the largest creditor to resolve the transfer balance, repeating recursively.
                </li>
              </ol>
              <div className="bg-black/80 border border-white/5 p-3 rounded-lg text-[11px] text-white/30 flex justify-between select-none">
                <span>// Standard computational complexity: O(N log N)</span>
                <span>// Precision state factor: Decimal Rounded to .00</span>
              </div>
            </div>
          </div>
        </section>

          </>}

      </main>

      {
    /* FOOTER Proof — Styled exactly like the Sophisticated Dark footer */
  }
      <footer id="main-footer" className="px-4 py-8 md:px-12 md:py-10 border-t border-white/5 bg-black flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-white/50">
        <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Backed by global leaders</span>
        <div className="hidden sm:flex items-center gap-12 opacity-30 grayscale">
          <div className="h-4 w-24 bg-white rounded-sm" />
          <div className="h-4 w-20 bg-white rounded-sm" />
          <div className="h-4 w-28 bg-white rounded-sm" />
        </div>
        <div className="flex items-center gap-4 text-white/50 text-xs">
          <a onClick={() => triggerToast("Loaded SplitPrivacy terms.")} className="hover:text-white cursor-pointer transition-colors">Terms</a>
          <span>•</span>
          <a onClick={() => triggerToast("Loaded SplitPrivacy rules.")} className="hover:text-white cursor-pointer transition-colors">Privacy</a>
        </div>
      </footer>

      {
    /* HOW IT WORKS / DOCUMENTATION MODAL OVERLAY */
  }
      {showInfoModal && <div id="documentation-modal-backdrop" className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-neutral-800 rounded-xl max-w-xl w-full p-6 space-y-4 font-mono text-xs text-neutral-400">
            <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
              <span className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <Info className="w-4 h-4 text-emerald-400" />
                <span>SplitSmart Workspace Manual</span>
              </span>
              <button
    onClick={() => setShowInfoModal(false)}
    className="text-neutral-500 hover:text-white font-sans text-lg focus:outline-none cursor-pointer"
  >
                ×
              </button>
            </div>

            <div className="space-y-4 leading-relaxed font-light">
              <p>
                Welcome to <strong className="text-white">SplitSmart</strong>. Below is a quick structural guide on how to parse your group bills.
              </p>

              <div className="space-y-2">
                <span className="text-white font-bold block uppercase tracking-wider">1. Natural Conversational Text Syntax</span>
                <p className="text-neutral-400 text-[11px]">
                  Write line-by-line statements representing names and costs. The interactive engine automatically builds the group balances:
                </p>
                <div className="bg-black border border-neutral-900 p-2.5 rounded text-neutral-300 space-y-1 select-all font-mono leading-relaxed">
                  <div className="text-neutral-500"># Payments made first</div>
                  <div>Laura paid $150 for dinner & cabs</div>
                  <div>Tom paid $30 for snacks</div>
                  <div className="text-neutral-500"># Allocate specific items specifically</div>
                  <div>Shrimp $60: Laura, Tom, Dave</div>
                  <div>Champagne $40: Laura, Dave</div>
                  <div>Unallocated expenses split evenly!</div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-white font-bold block uppercase tracking-wider">2. Tax & Tip Proportionality</span>
                <p>
                  Dragging the sliders automatically adjusts tax and tip calculations. Tax and tips are added on top of individual shares, so a person who spent 10% of the subtotal pays exactly 10% of the tax and tips.
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-white font-bold block uppercase tracking-wider">3. visual board builder</span>
                <p>
                  Prefer forms over typing? Click the <strong className="text-white">Visual Form Builder</strong> tab. Add names, costs, and check who shared which item using buttons and toggles.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-900 flex justify-end">
              <button
    onClick={() => setShowInfoModal(false)}
    className="px-5 py-2.5 bg-white text-black font-extrabold text-[10px] tracking-wider rounded uppercase hover:bg-neutral-200 transition-all cursor-pointer"
  >
                Let's Split
              </button>
            </div>
          </div>
        </div>}

      {
    /* SAVE BILL TO DASHBOARD DIALOG MODAL */
  }
      {showSaveModal && <div id="save-bill-modal-backdrop" className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-zinc-950 border border-neutral-800 rounded-2xl max-w-sm w-full p-6 space-y-5 text-left shadow-2xl relative">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-900">
              <span className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <PiggyBank className="w-4 h-4 text-white" />
                <span>Save Bill Report</span>
              </span>
              <button
    onClick={() => setShowSaveModal(false)}
    className="text-neutral-500 hover:text-white font-sans text-lg focus:outline-none cursor-pointer"
  >
                ×
              </button>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              Name this split report so you can easily identify and load it back into your sandbox later from your personal dashboard.
            </p>

            <div className="space-y-1.5">
              <label htmlFor="save-bill-title-input" className="block text-[10px] font-mono text-neutral-500 uppercase font-bold">
                Report Title
              </label>
              <input
    id="save-bill-title-input"
    type="text"
    placeholder="Friday Sushi Night"
    value={saveTitle}
    onChange={(e) => setSaveTitle(e.target.value)}
    className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-white/40 transition-all font-mono"
    maxLength={45}
  />
            </div>

            <div className="pt-3 border-t border-neutral-900 flex justify-end space-x-2">
              <button
    onClick={() => setShowSaveModal(false)}
    className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 font-extrabold text-[10px] tracking-wider rounded uppercase transition-all cursor-pointer border border-neutral-800"
  >
                Cancel
              </button>
              <button
    onClick={() => handleSaveBill(saveTitle)}
    className="px-5 py-2 bg-white text-black font-extrabold text-[10px] tracking-wider rounded uppercase hover:bg-neutral-200 transition-all cursor-pointer"
  >
                Confirm Save
              </button>
            </div>
          </div>
        </div>}

      {
    /* SHARE QR CODE MODAL OVERLAY */
  }
      {showQRModal && <div id="share-qr-modal-backdrop" className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-zinc-950 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-6 text-left shadow-2xl relative animate-in fade-in duration-300">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-900">
              <span className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <QrCode className="w-4 h-4 text-white" />
                <span>Share Bill QR Code</span>
              </span>
              <button
    onClick={() => {
      setShowQRModal(false);
      setCopiedLinkState(false);
    }}
    className="text-neutral-500 hover:text-white font-sans text-lg focus:outline-none cursor-pointer"
    aria-label="Close QR Modal"
  >
                ×
              </button>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              Your friends can scan this QR code with any smartphone camera to load the exact state of this bill, complete with participants, items, payments, taxes, and tips.
            </p>

            {
    /* Centered QR code with standard white container for perfect scanning contrast */
  }
            <div className="flex flex-col items-center justify-center py-4 bg-white/[0.02] border border-neutral-950 rounded-xl p-4">
              <div className="p-4 bg-white rounded-xl shadow-lg border border-neutral-200">
                <QRCodeSVG
    value={getShareUrl()}
    size={200}
    level="M"
    includeMargin={true}
  />
              </div>
              <span className="text-[10px] font-mono text-neutral-500 mt-3 flex items-center gap-1.5 uppercase font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Scannable and Real-Time Synchronized
              </span>
            </div>

            {
    /* URL string with 1-click copy action */
  }
            <div className="space-y-1.5">
              <label htmlFor="share-link-input" className="block text-[10px] font-mono text-neutral-500 uppercase font-bold">Or share via direct link</label>
              <div className="flex gap-2">
                <input
    id="share-link-input"
    type="text"
    readOnly
    value={getShareUrl()}
    className="flex-1 bg-black border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-neutral-500 overflow-ellipsis select-all focus:outline-none"
  />
                <button
    onClick={() => {
      navigator.clipboard.writeText(getShareUrl());
      setCopiedLinkState(true);
      triggerToast("Direct import link copied to clipboard!");
      setTimeout(() => setCopiedLinkState(false), 2e3);
    }}
    className="px-4 py-2 bg-white text-black font-extrabold text-[10px] tracking-wider rounded uppercase hover:bg-neutral-200 transition-all cursor-pointer flex items-center space-x-1"
  >
                  {copiedLinkState ? <Check className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />}
                  <span>{copiedLinkState ? "COPIED" : "COPY"}</span>
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-900 flex justify-end">
              <button
    onClick={() => {
      setShowQRModal(false);
      setCopiedLinkState(false);
    }}
    className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-extrabold text-[10px] tracking-wider rounded uppercase transition-all cursor-pointer border border-neutral-800"
  >
                Close Window
              </button>
            </div>
          </div>
        </div>}

    </div>;
}
export {
  App as default
};
