import { Outlet, useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { useState } from "react";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Plug, 
  Moon,
  Sun,
  Menu,
  X,
  LogOut,
  ChevronDown,
  ChevronRight,
  Kanban as KanbanIcon,
  Bot
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const navigation = [
  { name: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
  { name: "Agenda", href: "/app/agenda", icon: Calendar },
  { 
    name: "Clientes", 
    href: "/app/clientes", 
    icon: Users,
    subItems: [
      { name: "CRM", href: "/app/clientes/crm", icon: Users },
      { name: "Kanban", href: "/app/clientes/kanban", icon: KanbanIcon }
    ]
  },
  { name: "Agent IA", href: "/app/agent-ia", icon: Bot },
  { name: "Integração", href: "/app/integrations", icon: Plug },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { profile, organization, signOut } = useAuth();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      // Erro já tratado no AuthContext
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo & Organization */}
      <div className="border-b border-border/50 px-4 md:px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          {/* Logo ou Nome */}
          {organization?.logo_url ? (
            <img
              src={organization.logo_url}
              alt={organization.name}
              className="h-10 md:h-12 w-auto max-w-[160px] object-contain"
            />
          ) : (
            <h1 className="font-display text-xl md:text-2xl font-bold tracking-tight text-foreground">
              Lux<span className="text-accent">Clinic</span>
            </h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 shrink-0"
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
            <span className="sr-only">Alternar tema</span>
          </Button>
        </div>
        {organization && (
          <div className="px-2">
            <p className="text-xs font-medium text-muted-foreground">Organização</p>
            <p className="text-sm font-semibold text-foreground truncate">{organization.name}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 md:px-4 py-6 md:py-8 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const hasSubItems = 'subItems' in item && item.subItems && item.subItems.length > 0;
          const isSubItemActive = hasSubItems && item.subItems?.some(sub => location.pathname === sub.href);
          const isOpen = openMenus[item.name] ?? (isActive || isSubItemActive);

          if (hasSubItems) {
            return (
              <Collapsible 
                key={item.name} 
                open={isOpen} 
                onOpenChange={(open) => setOpenMenus(prev => ({ ...prev, [item.name]: open }))}
              >
                <CollapsibleTrigger asChild>
                  <div
                    className={cn(
                      "group flex items-center justify-between gap-3 rounded-lg px-3 md:px-4 py-2.5 md:py-3 text-sm font-medium transition-all duration-200 cursor-pointer",
                      isActive || isSubItemActive
                        ? "bg-accent/10 text-accent"
                        : "text-foreground/70 hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        className={cn(
                          "h-5 w-5 shrink-0 transition-all duration-200",
                          isActive || isSubItemActive ? "text-accent" : "text-foreground/50 group-hover:text-foreground"
                        )}
                      />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0" />
                    )}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 pl-6 mt-1">
                  {item.subItems?.map((subItem) => {
                    const isSubActive = location.pathname === subItem.href;
                    return (
                      <NavLink
                        key={subItem.name}
                        to={subItem.href}
                        onClick={onNavigate}
                        className={cn(
                          "group flex items-center gap-3 rounded-lg px-3 md:px-4 py-2 md:py-2.5 text-sm font-medium transition-all duration-200",
                          isSubActive
                            ? "bg-accent/10 text-accent"
                            : "text-foreground/70 hover:bg-secondary hover:text-foreground"
                        )}
                      >
                        <subItem.icon
                          className={cn(
                            "h-4 w-4 shrink-0 transition-all duration-200",
                            isSubActive ? "text-accent" : "text-foreground/50 group-hover:text-foreground"
                          )}
                        />
                        <span className="truncate">{subItem.name}</span>
                      </NavLink>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          }

          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 md:px-4 py-2.5 md:py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-foreground/70 hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-all duration-200",
                  isActive ? "text-accent" : "text-foreground/50 group-hover:text-foreground"
                )}
              />
              <span className="truncate">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-border/50 p-3 md:p-4 space-y-2">
        <div className="flex items-center gap-3 rounded-lg bg-secondary/50 px-3 md:px-4 py-2.5 md:py-3">
          <div className="flex h-9 w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full bg-accent/20">
            <span className="font-display text-xs md:text-sm font-semibold text-accent">
              {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {profile?.full_name || 'Usuário'}
            </p>
            <p className="text-xs text-muted-foreground truncate capitalize">
              {profile?.role || 'doctor'}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );
}

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:left-0 lg:top-0 lg:z-40 lg:flex lg:h-screen lg:w-64 lg:border-r lg:border-border/50 lg:bg-card">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-border/50 bg-card/95 backdrop-blur-sm px-4 lg:hidden">
        <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
          Lux<span className="text-accent">Clinic</span>
        </h1>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
            <span className="sr-only">Alternar tema</span>
          </Button>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] p-0">
              <SidebarContent onNavigate={() => setMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full lg:ml-64 h-screen pt-16 lg:pt-0 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
