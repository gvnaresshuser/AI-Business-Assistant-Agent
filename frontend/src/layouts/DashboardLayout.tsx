import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Bot,
  BrainCircuit,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  LogOut,
  Menu,
  X,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const DashboardLayout = () => {
  const [loggingOut, setLoggingOut] = useState(false);
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);





const handleLogout = async () => {
  if (loggingOut) return;

  // Show the logout overlay immediately
  setLoggingOut(true);

  try {
    // Keep the dashboard mounted and show animation for 4 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Now execute the actual logout
    await logout();

    // Redirect to login
    window.location.replace("/login");
  } catch (error) {
    console.error("Logout failed:", error);
    setLoggingOut(false);
  }
};



const navigation = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    allowedRoles: ["Admin", "Manager", "Staff"],
  },
  {
    name: "AI Assistant",
    path: "/agent",
    icon: Bot,
    allowedRoles: ["Admin", "Manager"],
  },
  {
    name: "RAG Knowledge",
    path: "/knowledge",
    icon: BrainCircuit,
    allowedRoles: ["Admin", "Manager"],
  },
  {
    name: "Products",
    path: "/products",
    icon: Package,
    allowedRoles: ["Admin", "Manager", "Staff"],
  },
  {
    name: "Customers",
    path: "/customers",
    icon: Users,
    allowedRoles: ["Admin", "Manager", "Staff"],
  },
  {
    name: "Sales",
    path: "/sales",
    icon: ShoppingCart,
    allowedRoles: ["Admin", "Manager", "Staff"],
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: BarChart3,
    allowedRoles: ["Admin", "Manager"],
  },
];

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 text-white transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-700 px-5">
          <h1 className="text-lg font-bold">AI Business Assistant</h1>

          <button
            type="button"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          {navigation
            .filter((item) => item.allowedRoles.includes(user?.roleName ?? ""))
            .map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/dashboard"}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >
                  <Icon size={19} />
                  {item.name}
                </NavLink>
              );
            })}
        </nav>

        <div className="border-t border-slate-700 p-4">
          <p className="mb-3 text-xs text-slate-400">
            Signed in as {user?.roleName}
          </p>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loggingOut ? (
              <>
                <Settings size={19} className="animate-spin text-blue-400" />
                Logging out...
              </>
            ) : (
              <>
                <LogOut size={19} />
                Logout
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}

        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-3 shadow-sm sm:px-5 lg:px-6">
          {/* Left Section */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="shrink-0 rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-blue-600 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={22} />
            </button>

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 shadow-md shadow-blue-500/20">
              <span className="text-sm font-bold text-white">AI</span>
            </div>

            <div className="min-w-0">
              <h2 className="whitespace-nowrap text-sm font-bold tracking-tight text-slate-800 sm:text-lg">
                AI Business Assistant
              </h2>

              <p className="hidden text-xs text-slate-500 sm:block">
                Intelligent insights for smarter business decisions
              </p>
            </div>
          </div>

          {/* Right Section - User Profile */}
          <div className="ml-2 flex shrink-0 items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-2 py-1.5 sm:gap-3 sm:px-3 sm:py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-sm font-bold text-white shadow-sm">
              {user?.roleName?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="text-right">
              <p className="text-xs font-bold text-slate-800 sm:text-sm">
                {user?.roleName}
              </p>

              <p className="hidden text-xs font-medium text-slate-500 sm:block">
                Business Account
              </p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <Outlet />
        </main>
        {loggingOut && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
            <div className="w-full max-w-xs rounded-2xl border border-white/70 bg-white p-8 text-center shadow-2xl">
              <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-violet-50 shadow-md">
                <Settings size={34} className="animate-spin text-blue-600" />
              </div>

              <h3 className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-lg font-bold text-transparent">
                Logging Out...
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Securely ending your session. Please wait...
              </p>

              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-blue-600 to-violet-600" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardLayout;
