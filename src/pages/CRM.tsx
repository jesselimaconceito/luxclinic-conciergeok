import { Search, UserPlus, Mail, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function CRM() {
  const patients = [
    {
      name: "Maria Santos",
      email: "maria.santos@email.com",
      phone: "+351 912 345 678",
      lastVisit: "2024-01-15",
      status: "active",
      visits: 12,
    },
    {
      name: "João Silva",
      email: "joao.silva@email.com",
      phone: "+351 913 456 789",
      lastVisit: "2024-01-18",
      status: "active",
      visits: 8,
    },
    {
      name: "Ana Costa",
      email: "ana.costa@email.com",
      phone: "+351 914 567 890",
      lastVisit: "2023-12-20",
      status: "inactive",
      visits: 5,
    },
    {
      name: "Pedro Oliveira",
      email: "pedro.oliveira@email.com",
      phone: "+351 915 678 901",
      lastVisit: "2024-01-20",
      status: "active",
      visits: 15,
    },
  ];

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground mb-2">
            CRM
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your patient relationships with care
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-all hover:shadow-[0_0_40px_hsl(var(--accent)/0.4)] hover-scale">
          <UserPlus className="h-4 w-4" />
          Add Patient
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative animate-fade-in-up">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search patients by name, email, or phone..."
          className="pl-12 h-12 bg-card border-border/50 focus:border-accent"
        />
      </div>

      {/* Patient Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {patients.map((patient, index) => (
          <div
            key={index}
            className="card-luxury group p-6 animate-fade-in-up cursor-pointer"
            style={{ animationDelay: `${0.1 * index}s` }}
          >
            {/* Patient Header */}
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 font-display text-lg font-semibold text-accent">
                  {patient.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{patient.name}</h3>
                  <span
                    className={`text-xs font-medium ${
                      patient.status === "active"
                        ? "text-success"
                        : "text-muted-foreground"
                    }`}
                  >
                    {patient.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                {patient.visits} visits
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 border-t border-border/50 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="truncate">{patient.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{patient.phone}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
              <span className="text-xs text-muted-foreground">
                Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
              </span>
              <button className="text-sm font-medium text-accent transition-colors hover:text-accent/80">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
