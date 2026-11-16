import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Settings } from "lucide-react";
const demoAccounts = [
  {
    role: "Manager",
    email: "manager@demo-electronics.local",
    password: "Demo@12345",
  },
  {
    role: "Staff",
    email: "sales@demo-electronics.local",
    password: "Demo@12345",
  },
  {
    role: "Admin",
    email: "admin@demo-electronics.local",
    password: "AnotherNew@123",
  },
];

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectDemoAccount = (account: (typeof demoAccounts)[number]) => {
    setEmail(account.email);
    setPassword(account.password);
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      await login({ email, password });
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-4 py-8">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl shadow-blue-900/10">
        {/* Branding Section */}
        <div className="px-8 pb-6 pt-9 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 shadow-lg shadow-blue-500/30">
            <span className="text-2xl font-extrabold text-white">AI</span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            AI Business Assistant
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Intelligent insights. Smarter business decisions.
          </p>

          <div className="mx-auto mt-5 h-1 w-14 rounded-full bg-gradient-to-r from-blue-600 to-violet-600" />
        </div>

        {/* Login Form */}
        <div className="px-6 pb-8 sm:px-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800">Welcome Back</h2>

            <p className="mt-1 text-sm text-slate-500">
              Sign in to access your business dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                autoComplete="username"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-blue-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-blue-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                <span className="font-bold">!</span>
                <p>{error}</p>
              </div>
            )}

            {/* Submit Button */}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-700 hover:to-violet-700 hover:shadow-xl active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Settings size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Demo Login Section */}
          <div className="my-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />

            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Quick Demo Access
            </span>

            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {demoAccounts.map((account) => (
              <button
                key={account.role}
                type="button"
                onClick={() => selectDemoAccount(account)}
                className="rounded-xl border border-blue-100 bg-blue-50 py-3 text-sm font-semibold text-blue-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-100 hover:shadow-md"
              >
                {account.role}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 border-t border-slate-100 pt-5 text-center">
            <p className="text-xs font-medium text-slate-400">
              Powered by AI Technology
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Secure Business Management Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
