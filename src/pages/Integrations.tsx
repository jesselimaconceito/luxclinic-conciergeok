import { MessageSquare, Plug, Webhook, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export default function Integrations() {
  const [integrations, setIntegrations] = useState({
    whatsappUnofficial: true,
    whatsappOfficial: false,
    openai: true,
    webhook: false,
  });

  const toggleIntegration = (key: keyof typeof integrations) => {
    setIntegrations((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const integrationCards = [
    {
      id: "whatsappUnofficial",
      name: "WhatsApp API (Unofficial)",
      description: "Connect with patients via WhatsApp using the unofficial API",
      icon: MessageSquare,
      status: integrations.whatsappUnofficial,
      badge: "Popular",
    },
    {
      id: "whatsappOfficial",
      name: "WhatsApp Business API",
      description: "Official WhatsApp Business integration for verified accounts",
      icon: MessageSquare,
      status: integrations.whatsappOfficial,
      badge: "Premium",
    },
    {
      id: "openai",
      name: "OpenAI Integration",
      description: "AI-powered patient communication and automation",
      icon: Sparkles,
      status: integrations.openai,
      badge: "AI",
    },
    {
      id: "webhook",
      name: "Custom Webhooks",
      description: "Connect external services and automate workflows",
      icon: Webhook,
      status: integrations.webhook,
      badge: "Advanced",
    },
  ];

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground mb-2">
          Integrations
        </h1>
        <p className="text-lg text-muted-foreground">
          Connect your favorite tools and automate your workflow
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3 animate-fade-in-up">
        <div className="card-luxury p-6">
          <p className="text-caption mb-2">Active Integrations</p>
          <p className="font-display text-3xl font-bold text-foreground">
            {Object.values(integrations).filter(Boolean).length}
          </p>
        </div>
        <div className="card-luxury p-6">
          <p className="text-caption mb-2">Available</p>
          <p className="font-display text-3xl font-bold text-foreground">
            {Object.values(integrations).length}
          </p>
        </div>
        <div className="card-luxury p-6">
          <p className="text-caption mb-2">Coming Soon</p>
          <p className="font-display text-3xl font-bold text-foreground">5+</p>
        </div>
      </div>

      {/* Integration Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {integrationCards.map((integration, index) => (
          <div
            key={integration.id}
            className="card-luxury group p-6 animate-fade-in-up"
            style={{ animationDelay: `${0.1 * index}s` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg transition-all duration-300 ${
                    integration.status
                      ? "bg-accent/20 text-accent"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <integration.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{integration.name}</h3>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        integration.badge === "Premium"
                          ? "bg-accent/10 text-accent"
                          : integration.badge === "AI"
                          ? "bg-success/10 text-success"
                          : "bg-secondary text-foreground"
                      }`}
                    >
                      {integration.badge}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{integration.description}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border/50 pt-4">
              <span className="text-sm text-muted-foreground">
                {integration.status ? "Active" : "Inactive"}
              </span>
              <Switch
                checked={integration.status}
                onCheckedChange={() =>
                  toggleIntegration(integration.id as keyof typeof integrations)
                }
                className="data-[state=checked]:bg-accent"
              />
            </div>

            {integration.status && (
              <div className="mt-4 animate-fade-in">
                <button className="w-full rounded-lg border border-border/50 bg-secondary/50 py-2 text-sm font-medium text-foreground transition-all hover:border-accent hover:bg-accent/5">
                  Configure Settings
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Coming Soon Section */}
      <div className="card-luxury p-8 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
            <Plug className="h-5 w-5 text-accent" />
          </div>
          <h2 className="font-display text-xl font-semibold text-foreground">
            Coming Soon
          </h2>
        </div>
        <p className="text-muted-foreground mb-4">
          We're constantly adding new integrations to help you work smarter. Here's what's in the pipeline:
        </p>
        <div className="flex flex-wrap gap-2">
          {["Google Calendar", "Stripe Payments", "Zoom", "Slack", "Calendly"].map((name) => (
            <span
              key={name}
              className="rounded-full bg-secondary px-4 py-2 text-sm font-medium text-foreground"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
