import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookText,
  Pill,
  Activity,
  ShoppingCart,
  Users,
  CheckCircle,
  LogOut,
  Search,
  Loader,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import api from "../api";
import NepaliDate from "nepali-datetime";

const MENU_ITEMS = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
    tags: ["home", "main", "overview", "stats"],
  },
  {
    name: "Sales & Billing",
    icon: ShoppingCart,
    path: "/billing",
    tags: ["sell", "invoice", "create bill", "sales"],
  },
  {
    name: "Daily Sell & Exp",
    icon: Activity,
    path: "/dailylog",
    tags: ["expense", "daily log", "ledger", "day", "track"],
  },
  {
    name: "Suppliers Dues",
    icon: Users,
    path: "/suppliers",
    tags: ["supplier", "due", "payables", "vendors", "purchase"],
  },
  {
    name: "Staff Salary",
    icon: CheckCircle,
    path: "/salary",
    tags: ["staff", "payroll", "wages", "employee"],
  },
  {
    name: "Ledger Book",
    icon: BookText,
    path: "/ledger",
    tags: ["accounts", "transactions", "book", "finance"],
  },
  {
    name: "Inventory",
    icon: Pill,
    path: "/medicines",
    tags: ["stock", "items", "drugs", "medicines", "products"],
  },
  {
    name: "Patients",
    icon: Users,
    path: "/patients",
    tags: ["patient", "record", "register", "history", "health"],
  },
  {
    name: "Admin Backup",
    icon: ShieldCheck,
    path: "/admin",
    tags: ["admin", "backup", "restore", "recycle bin", "trash", "deleted"],
  },
];

export default function DashboardLayout({ children, setAuth }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth(false);
  };

  const navigate = useNavigate();
  const searchInputRef = React.useRef(null);
  const searchContainerRef = React.useRef(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState({
    modules: [],
    db: [],
  });
  const [showSearch, setShowSearch] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowSearch(false);
      }
    };

    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ modules: [], db: [] });
      setShowSearch(false);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const modules = MENU_ITEMS.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerQuery) ||
        item.tags.some((tag) => tag.includes(lowerQuery)),
    );

    setSearchResults((prev) => ({ ...prev, modules }));
    setShowSearch(true);
    setIsSearching(true);

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await api.get(
          `/search?q=${encodeURIComponent(searchQuery)}`,
        );
        setSearchResults((prev) => ({ ...prev, db: res.data }));
      } catch (error) {
        console.error("Search API Error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const navigateToResult = (path) => {
    navigate(path);
    setSearchQuery("");
    setShowSearch(false);
    searchInputRef.current?.blur();
  };

  return (
    <div className="flex h-screen print:h-auto print:block print:overflow-visible bg-slate-50/50 text-slate-900 font-sans overflow-hidden selection:bg-blue-100 selection:text-blue-900">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`print:hidden fixed inset-y-0 left-0 w-64 glass border-r bg-white/95 backdrop-blur-md border-slate-200/60 flex flex-col z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-7 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-xl shadow-sm bg-white border border-slate-100 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-10 h-10 object-contain drop-shadow-sm"
              />
            </div>
            <div>
              <h4 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight">
                LAXMI HEALTH CLINIC
              </h4>
              <p className="text-[10px] font-bold text-blue-500 mt-0.5 uppercase tracking-[0.2em]">
                {user.role} PANEL
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-rose-500"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 py-6 overflow-y-auto">
          <ul className="space-y-1.5 px-4 block">
            {MENU_ITEMS.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 font-semibold hover:bg-white hover:text-blue-700 hover:shadow-sm hover:border hover:border-slate-100 transition-all border border-transparent mx-2"
                >
                  <item.icon size={20} strokeWidth={2.5} />
                  <span className="text-sm tracking-wide">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-6 mt-auto">
          <div className="bg-white rounded-2xl p-4 card-shadow mb-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 min-w-[40px] rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-black shadow-inner border border-blue-200">
                {user.name?.slice(0, 2) || "US"}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-extrabold text-slate-800 truncate">
                  {user.name}
                </p>
                <p className="text-xs font-medium text-slate-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-slate-600 bg-white hover:bg-rose-50 hover:text-rose-600 border border-slate-200 rounded-xl transition-all shadow-sm"
          >
            <LogOut size={18} strokeWidth={2.5} /> Secure Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 relative h-full print:h-auto print:overflow-visible bg-[#f8fafc]">
        {/* Ambient Top Background */}
        <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-blue-50/80 to-transparent -z-10 pointer-events-none"></div>

        {/* Search Header */}
        <header className="print:hidden sticky top-0 z-30 px-4 md:px-8 py-4 border-b border-slate-200/50 bg-[#f8fafc]/80 backdrop-blur-md flex justify-between items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden text-slate-600 p-2 bg-white rounded-xl shadow-sm border border-slate-200"
          >
            <Menu size={24} />
          </button>
          <div
            className="relative w-full max-w-md flex-1"
            ref={searchContainerRef}
          >
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-slate-400" size={18} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search features (e.g., Billing, Inventory)..."
                value={searchQuery}
                onChange={handleSearch}
                onFocus={() => {
                  if (searchQuery) setShowSearch(true);
                }}
                className="w-full pl-10 pr-12 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all text-sm font-medium"
              />
              <div className="absolute right-3 px-1.5 py-0.5 rounded border border-slate-200 text-[10px] font-bold text-slate-400 bg-slate-50 pointer-events-none">
                ⌘ K
              </div>
            </div>

            {/* Search Dropdown */}
            {showSearch && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden z-50 py-2 animate-fade-in-down">
                {searchResults.modules.length > 0 && (
                  <>
                    <div className="px-3 pb-1 mb-1 mt-1 border-b border-slate-100 flex items-center justify-between">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Sections
                      </p>
                    </div>
                    <ul className="max-h-48 overflow-y-auto">
                      {searchResults.modules.map((result) => (
                        <li key={result.path}>
                          <button
                            onClick={() => navigateToResult(result.path)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left transition-colors focus:bg-slate-50 focus:outline-none"
                          >
                            <div className="bg-slate-100 p-2 rounded-lg">
                              <result.icon
                                size={16}
                                className="text-slate-600"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-700">
                                {result.name}
                              </p>
                              <p className="text-xs font-medium text-slate-400">
                                Navigate to module
                              </p>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {searchResults.db.length > 0 && (
                  <>
                    <div className="px-3 pb-1 mb-1 mt-3 border-b border-slate-100 flex items-center justify-between">
                      <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                        Database Records
                      </p>
                    </div>
                    <ul className="max-h-64 overflow-y-auto">
                      {searchResults.db.map((rec) => (
                        <li key={rec.id}>
                          <button
                            onClick={() => navigateToResult(rec.path)}
                            className="w-full flex items-start flex-col px-4 py-3 hover:bg-slate-50 text-left transition-colors focus:bg-slate-50 focus:outline-none border-b border-slate-50 last:border-0"
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-sm font-bold text-slate-800">
                                {rec.name}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-black tracking-wide ${rec.type === "Supplier" ? "bg-orange-100 text-orange-600" : rec.type === "Medicine" ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"}`}
                              >
                                {rec.type}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 font-medium">
                              {rec.desc}
                            </p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {isSearching && (
                  <div className="py-8 text-center text-blue-600 flex flex-col items-center justify-center gap-2">
                    <Loader className="animate-spin" size={24} />
                    <p className="text-xs font-bold">Querying Records...</p>
                  </div>
                )}

                {!isSearching &&
                  searchResults.modules.length === 0 &&
                  searchResults.db.length === 0 && (
                    <div className="p-6 text-center text-slate-500">
                      <Search
                        className="mx-auto mb-2 text-slate-300"
                        size={24}
                      />
                      <p className="text-sm font-semibold text-slate-600">
                        No results found for "{searchQuery}"
                      </p>
                      <p className="text-xs mt-1 text-slate-400">
                        Double check spelling or try a different term.
                      </p>
                    </div>
                  )}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/admin"
              className="text-right hover:bg-slate-100 p-2 rounded-xl transition-colors cursor-pointer block border border-transparent hover:border-slate-200"
            >
              <p className="text-xs font-bold text-slate-800 flex justify-end gap-1 items-center">
                {new NepaliDate().format("YYYY-MM-DD")}{" "}
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              </p>
              <p className="text-[10px] text-slate-400 max-w-[120px] truncate">
                {user.email || "Admin"}
              </p>
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-auto print:overflow-visible print:p-0 p-4 md:p-8 relative scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
}
