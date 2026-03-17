"use client";

import { useState, useRef, useEffect } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  UserCircle,
  FolderOpen,
  MessageSquare,
  Receipt,
  Settings,
  Server,
  LogOut,
  KeyRound,
  ChevronLeft,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Sun,
  Moon,
  Bell,
  User,
  ChevronDown as ChevronDownIcon,
} from "lucide-react";
import { STAFF_TOKEN_KEY } from "@/lib/workspace-api";
import { useTheme } from "@/components/providers/ThemeProvider";

interface NavChild {
  key: string;
  label: string;
  href: string;
}

interface NavItem {
  key: string;
  label: string;
  icon: React.ElementType;
  href: string;
  children?: NavChild[];
}

interface NavCategory {
  label: string;
  items: NavItem[];
}

const SIDEBAR_CATEGORIES: NavCategory[] = [
  {
    label: "Principal",
    items: [
      { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/" },
    ],
  },
  {
    label: "Comercial",
    items: [
      {
        key: "comercial",
        label: "Comercial",
        icon: Users,
        href: "/customers",
        children: [
          { key: "customers", label: "Clientes", href: "/customers" },
          { key: "orders", label: "Pedidos", href: "/orders" },
          { key: "kanban", label: "Kanban", href: "/kanban" },
        ],
      },
    ],
  },
  {
    label: "CRM",
    items: [
      {
        key: "crm",
        label: "CRM",
        icon: UserCircle,
        href: "/crm/leads",
        children: [
          { key: "crm-contacts", label: "Contatos", href: "/crm/contacts" },
          { key: "crm-leads", label: "Leads", href: "/crm/leads" },
          { key: "crm-funil", label: "Funil", href: "/crm/funil" },
        ],
      },
    ],
  },
  {
    label: "Projetos",
    items: [
      {
        key: "projetos",
        label: "Projetos",
        icon: FolderOpen,
        href: "/briefings",
        children: [
          { key: "briefings", label: "Briefings", href: "/briefings" },
          { key: "projects", label: "Projetos", href: "/projects" },
        ],
      },
    ],
  },
  {
    label: "Suporte",
    items: [
      {
        key: "suporte",
        label: "Suporte",
        icon: MessageSquare,
        href: "/support/tickets",
        children: [
          { key: "support-tickets", label: "Tickets", href: "/support/tickets" },
        ],
      },
    ],
  },
  {
    label: "Financeiro",
    items: [
      {
        key: "billing",
        label: "Billing",
        icon: Receipt,
        href: "/billing/invoices",
        children: [
          { key: "invoices", label: "Faturas", href: "/billing/invoices" },
          { key: "products", label: "Produtos", href: "/billing/products" },
          { key: "price-plans", label: "Planos de preço", href: "/billing/price-plans" },
        ],
      },
    ],
  },
  {
    label: "Infraestrutura",
    items: [
      {
        key: "hestia",
        label: "Hestia",
        icon: Server,
        href: "/hestia",
        children: [
          { key: "hestia-overview", label: "Visão geral", href: "/hestia" },
          { key: "hestia-users", label: "Usuários", href: "/hestia/users" },
          { key: "hestia-domains", label: "Domínios", href: "/hestia/domains" },
          { key: "hestia-packages", label: "Pacotes", href: "/hestia/packages" },
        ],
      },
    ],
  },
  {
    label: "Configurações",
    items: [
      {
        key: "config",
        label: "Configurações",
        icon: Settings,
        href: "/config/integrations",
        children: [
          { key: "integrations", label: "Integrações", href: "/config/integrations" },
          { key: "hestia", label: "Hestia", href: "/config/hestia" },
        ],
      },
    ],
  },
];

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    billing: true,
    config: false,
    hestia: true,
    comercial: true,
    projetos: true,
    suporte: true,
  });
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const headerMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        headerMenuRef.current &&
        !headerMenuRef.current.contains(e.target as Node)
      ) {
        setHeaderMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setHeaderMenuOpen(false);
    localStorage.removeItem(STAFF_TOKEN_KEY);
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" || pathname === "";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const subOpen = (key: string) => openSections[key] ?? false;

  const setSubOpen = (key: string, value: boolean) => {
    setOpenSections((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="workspace-root min-h-screen" style={{ background: "var(--bg)" }}>
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width: sidebarOpen ? 280 : 80,
          x:
            mobileMenuOpen
              ? 0
              : typeof window !== "undefined" && window.innerWidth < 1024
                ? -280
                : 0,
        }}
        className={`fixed top-0 left-0 h-full backdrop-blur-xl z-50 flex flex-col border-r transition-colors
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <div
          className="h-20 flex items-center justify-between px-6 border-b shrink-0"
          style={{ borderColor: "var(--border)" }}
        >
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--cyan-500)", color: "#fff" }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-bold whitespace-nowrap truncate"
                  style={{ color: "var(--foreground)" }}
                >
                  Workspace
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex min-w-[44px] min-h-[44px] w-11 h-11 items-center justify-center rounded-lg transition-colors hover:opacity-80"
            style={{ background: "var(--border)" }}
            aria-label={sidebarOpen ? "Recolher menu" : "Expandir menu"}
          >
            <motion.div animate={{ rotate: sidebarOpen ? 0 : 180 }}>
              <ChevronLeft className="w-4 h-4" style={{ color: "var(--foreground-muted)" }} />
            </motion.div>
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-lg transition-colors hover:opacity-80"
            style={{ background: "var(--border)" }}
            aria-label="Fechar menu"
          >
            <X className="w-4 h-4" style={{ color: "var(--foreground-muted)" }} />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          {SIDEBAR_CATEGORIES.map((cat) => (
            <div key={cat.label} className="mb-6">
              {sidebarOpen && (
                <p
                  className="px-4 mb-2 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  {cat.label}
                </p>
              )}
              <ul className="space-y-1">
                {cat.items.map((item) => {
                  const Icon = item.icon;
                  const hasChildren = item.children && item.children.length > 0;
                  const open = subOpen(item.key);

                  if (hasChildren && sidebarOpen) {
                    return (
                      <li key={item.key}>
                        <button
                          type="button"
                          onClick={() => setSubOpen(item.key, !open)}
                          className="w-full group flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left hover:opacity-90"
                          style={{
                            color: "var(--foreground-muted)",
                            background: "transparent",
                          }}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          <span className="flex-1 font-medium">
                            {item.label}
                          </span>
                          <motion.div animate={{ rotate: open ? 180 : 0 }}>
                            <ChevronDown className="w-4 h-4" />
                          </motion.div>
                        </button>
                        <AnimatePresence>
                          {open && item.children && (
                            <motion.ul
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden pl-4 mt-1 space-y-1 border-l ml-5"
                              style={{ borderColor: "var(--border)" }}
                            >
                              {item.children.map((child) => (
                                <li key={child.key}>
                                  <Link
                                    href={child.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block py-2 px-3 rounded-lg text-sm transition-all ${
                                      isActive(child.href)
                                        ? "font-medium"
                                        : ""
                                    }`}
                                    style={{
                                      color: isActive(child.href)
                                        ? "var(--cyan-500)"
                                        : "var(--foreground-muted)",
                                      background: isActive(child.href)
                                        ? "rgba(10, 143, 157, 0.08)"
                                        : "transparent",
                                    }}
                                  >
                                    {child.label}
                                  </Link>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </li>
                    );
                  }

                  if (hasChildren && !sidebarOpen) {
                    return (
                      <li key={item.key}>
                        <Link
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center justify-center px-4 py-3 rounded-xl transition-all ${
                            isActive(item.href) ? "" : ""
                          }`}
                          style={{
                            color: isActive(item.href)
                              ? "var(--cyan-500)"
                              : "var(--foreground-muted)",
                            background: isActive(item.href)
                              ? "rgba(10, 143, 157, 0.08)"
                              : "transparent",
                          }}
                        >
                          <Icon className="w-5 h-5" />
                        </Link>
                      </li>
                    );
                  }

                  const active = isActive(item.href);
                  return (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                        style={{
                          color: active ? "var(--cyan-500)" : "var(--foreground-muted)",
                          background: active
                            ? "rgba(10, 143, 157, 0.08)"
                            : "transparent",
                          border: active ? "1px solid var(--border)" : "1px solid transparent",
                        }}
                      >
                        <Icon
                          className="w-5 h-5 flex-shrink-0"
                          style={{ color: "inherit" }}
                        />
                        <AnimatePresence>
                          {sidebarOpen && (
                            <motion.span
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              className="flex-1 font-medium"
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div
          className="p-3 border-t space-y-1 shrink-0"
          style={{ borderColor: "var(--border)" }}
        >
          <Link
            href="/account"
            onClick={() => setMobileMenuOpen(false)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              pathname === "/account" ? "" : ""
            }`}
            style={{
              color: pathname === "/account" ? "var(--cyan-500)" : "var(--foreground-muted)",
              background: pathname === "/account" ? "rgba(10, 143, 157, 0.08)" : "transparent",
            }}
          >
            <KeyRound className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-medium"
                >
                  Alterar senha
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 min-h-[44px] text-left hover:opacity-80"
            style={{ color: "var(--foreground-muted)" }}
            aria-label="Sair da conta"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-medium"
                >
                  Sair
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      <div
        className={`transition-all duration-300 ${sidebarOpen ? "lg:ml-[280px]" : "lg:ml-20"}`}
      >
        <header
          className="sticky top-0 z-30 h-20 backdrop-blur-xl border-b shrink-0"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          <div className="h-full px-4 lg:px-8 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-xl transition-colors hover:opacity-80"
              style={{ background: "var(--border)" }}
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" style={{ color: "var(--foreground)" }} />
            </button>
            <h1 className="text-xl font-bold truncate" style={{ color: "var(--foreground)" }}>
              Admin
            </h1>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-xl transition-colors hover:opacity-80"
                style={{ background: "var(--border)", color: "var(--foreground)" }}
                aria-label={theme === "dark" ? "Tema claro" : "Tema escuro"}
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              <div className="relative">
                <Link
                  href="/support/tickets"
                  className="min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-xl transition-colors hover:opacity-80 relative"
                  style={{ background: "var(--border)", color: "var(--foreground)" }}
                  aria-label="Notificações / Suporte"
                >
                  <Bell className="w-5 h-5" />
                </Link>
              </div>

              <div className="relative" ref={headerMenuRef}>
                <button
                  type="button"
                  onClick={() => setHeaderMenuOpen(!headerMenuOpen)}
                  className="flex items-center gap-2 min-w-[44px] min-h-[44px] pl-2 pr-3 py-2 rounded-xl transition-colors hover:opacity-80"
                  style={{ background: "var(--border)", color: "var(--foreground)" }}
                  aria-label="Menu do usuário"
                  aria-expanded={headerMenuOpen}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--cyan-500)", color: "#fff" }}
                  >
                    <User className="w-4 h-4" />
                  </div>
                  <ChevronDownIcon
                    className={`w-4 h-4 hidden sm:block transition-transform ${headerMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {headerMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 top-full mt-2 py-2 min-w-[200px] rounded-xl shadow-lg z-50"
                      style={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <Link
                        href="/account"
                        onClick={() => setHeaderMenuOpen(false)}
                        className="flex items-center gap-2 w-full px-4 py-3 text-left transition-colors hover:opacity-80"
                        style={{ color: "var(--foreground)" }}
                      >
                        <KeyRound className="w-4 h-4" />
                        Alterar senha
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-3 text-left transition-colors hover:opacity-80"
                        style={{ color: "var(--foreground-muted)" }}
                      >
                        <LogOut className="w-4 h-4" />
                        Sair
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
