import { useState } from "react";
import { Mail, Lock, User, ArrowRight, ShieldCheck, HelpCircle, Loader2 } from "lucide-react";
import { authApi, setToken } from "../api";

function AuthView({ onLoginSuccess, onCancel, triggerToast }) {
  const [authMode, setAuthMode] = useState("signin");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password should be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      if (authMode === "signup") {
        if (!firstName.trim()) {
          setErrorMsg("Please provide a first name.");
          setLoading(false);
          return;
        }
        const res = await authApi.register(
          firstName.trim(),
          lastName.trim() || firstName.trim(),
          email.toLowerCase().trim(),
          password
        );
        const { user, token } = res.data;
        setToken(token);
        triggerToast(`Welcome to SplitSmart, ${user.name || firstName}!`);
        onLoginSuccess({
          id: user.id,
          username: user.name || firstName,
          email: user.email,
        });
      } else {
        const res = await authApi.login(email.toLowerCase().trim(), password);
        const { user, token } = res.data;
        setToken(token);
        triggerToast(`Welcome back, ${user.name || user.email}!`);
        onLoginSuccess({
          id: user.id,
          username: user.name || user.email,
          email: user.email,
        });
      }
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.errors?.[0]?.msg ||
        "Authentication failed. Please try again.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="splitsmart-auth-panel"
      className="max-w-md w-full mx-auto my-12 p-8 bg-zinc-950 border border-neutral-900 rounded-2xl shadow-xl space-y-8 animate-fade-in text-left"
    >
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-white text-black mx-auto rounded-xl flex items-center justify-center shadow-lg">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white uppercase mt-4">
          {authMode === "signin" ? "Sign In" : "Create Account"}
        </h2>
        <p className="text-xs text-neutral-500 font-mono tracking-wider">
          SPLITSMART ACCOUNT GATEWAY
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-neutral-900/60 p-1 rounded-lg border border-neutral-800">
        <button
          onClick={() => {
            setAuthMode("signin");
            setErrorMsg("");
          }}
          className={`flex-1 py-2 text-xs font-mono font-bold uppercase transition-all rounded cursor-pointer ${
            authMode === "signin"
              ? "bg-white text-black shadow"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => {
            setAuthMode("signup");
            setErrorMsg("");
          }}
          className={`flex-1 py-2 text-xs font-mono font-bold uppercase transition-all rounded cursor-pointer ${
            authMode === "signup"
              ? "bg-white text-black shadow"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Sign Up
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-lg text-xs font-mono text-red-400">
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleAuthSubmit} className="space-y-4">
        {authMode === "signup" && (
          <div className="flex gap-3">
            <div className="flex-1 space-y-1">
              <label className="block text-[10px] font-mono text-neutral-500 uppercase font-bold">
                First Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="auth-firstname-input"
                  type="text"
                  placeholder="Ajinkya"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/40 transition-colors"
                  required={authMode === "signup"}
                />
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <label className="block text-[10px] font-mono text-neutral-500 uppercase font-bold">
                Last Name
              </label>
              <input
                id="auth-lastname-input"
                type="text"
                placeholder="Patil"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/40 transition-colors"
              />
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-[10px] font-mono text-neutral-500 uppercase font-bold">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
              <Mail className="w-4 h-4" />
            </span>
            <input
              id="auth-email-input"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-neutral-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/40 transition-colors"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-mono text-neutral-500 uppercase font-bold">
            Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
              <Lock className="w-4 h-4" />
            </span>
            <input
              id="auth-password-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-neutral-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/40 transition-colors"
              required
            />
          </div>
        </div>

        <button
          id="auth-submit-btn"
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-white text-black font-extrabold text-xs tracking-widest uppercase rounded-lg hover:bg-neutral-200 transition-all flex items-center justify-center space-x-2 shadow cursor-pointer mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>{authMode === "signin" ? "Sign In" : "Register & Log in"}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-4 border-t border-neutral-900 flex justify-between items-center text-[11px] text-neutral-500">
        <button
          onClick={onCancel}
          className="hover:text-white transition-colors underline cursor-pointer"
        >
          Go Back as Guest
        </button>
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Supabase Secured</span>
        </div>
      </div>
    </div>
  );
}

export { AuthView };
