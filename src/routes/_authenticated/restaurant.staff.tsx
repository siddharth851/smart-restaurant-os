import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { hasAnyRole, PANEL_ROLES } from "@/lib/auth";
import { UserPlus, ShieldCheck, Mail, Trash2, ChefHat, UserCheck, Loader2 } from "lucide-react";
import { PageHeader, Panel, SimpleTable } from "@/components/shared/ui-bits";
import { WithOwnerRestaurant } from "@/components/admin/owner-restaurant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/restaurant/staff")({
  beforeLoad: () => {
    throw redirect({ to: "/restaurant" });
  },
  component: () => null,
});

type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: "Kitchen Staff" | "Floor Staff" | "Shift Manager";
  status: "active" | "invited";
};

function StaffManager({ restaurant: r }: { restaurant: { id: string; name: string; slug: string } }) {
  const storageKey = `smartos_staff_list_${r.id}`;
  const [staffList, setStaffList] = useState<StaffMember[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: "1",
        name: "Chef Rajesh Kumar",
        email: "rajesh.chef@kitchen.internal",
        role: "Kitchen Staff",
        status: "active",
      },
      {
        id: "2",
        name: "Deepak Verma",
        email: "deepak.v@floor.internal",
        role: "Floor Staff",
        status: "active",
      },
    ];
  });

  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffMember["role"]>("Kitchen Staff");

  const saveList = (updated: StaffMember[]) => {
    setStaffList(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please provide both name and email");
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    const newMember: StaffMember = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: cleanEmail,
      role,
      status: "active",
    };
    const updated = [...staffList, newMember];
    saveList(updated);

    // Register active staff account in the global registry for instant sign in
    try {
      const regRaw = localStorage.getItem("smartos_staff_registry");
      const registry = regRaw ? JSON.parse(regRaw) : {};
      registry[cleanEmail] = {
        id: newMember.id,
        name: newMember.name,
        email: cleanEmail,
        role: role === "Kitchen Staff" ? "kitchen_staff" : "restaurant_staff",
        restaurantId: r.id,
        restaurantSlug: r.slug,
      };
      localStorage.setItem("smartos_staff_registry", JSON.stringify(registry));
    } catch (err) {
      console.error("Failed to register staff account", err);
    }

    toast.success(`Team member "${name}" added to ${r.name}`);
    setAddOpen(false);
    setName("");
    setEmail("");
  };

  const removeMember = (id: string, memberName: string) => {
    const target = staffList.find((m) => m.id === id);
    const updated = staffList.filter((m) => m.id !== id);
    saveList(updated);

    if (target) {
      try {
        const regRaw = localStorage.getItem("smartos_staff_registry");
        if (regRaw) {
          const registry = JSON.parse(regRaw);
          delete registry[target.email.toLowerCase()];
          localStorage.setItem("smartos_staff_registry", JSON.stringify(registry));
        }
      } catch {
        // ignore
      }
    }

    toast.success(`Removed ${memberName} from staff directory`);
  };

  return (
    <>
      <PageHeader
        title="Staff & Role Permissions"
        description={`Manage floor managers, line chefs, and service staff for ${r.name}.`}
        actions={
          <Button 
            onClick={() => setAddOpen(true)}
            className="rounded-xl bg-forest hover:bg-forest/90 text-white font-bold shadow-xs transition-all"
          >
            <UserPlus className="h-4 w-4 mr-1.5" /> Invite Team Member
          </Button>
        }
      />

      <Panel title={`Active Team (${staffList.length})`}>
        {staffList.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No team members added yet. Click 'Invite Team Member' to add kitchen and floor staff.
          </div>
        ) : (
          <SimpleTable
            head={["Team Member", "Assigned Role", "Contact Email", "Status", "Action"]}
            rows={staffList.map((s) => [
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-forest/10 font-bold text-xs text-forest">
                  {s.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <span className="font-bold text-xs text-foreground block">{s.name}</span>
                  <span className="text-[11px] text-muted-foreground">{r.name}</span>
                </div>
              </div>,
              <span className="inline-flex items-center gap-1 font-semibold text-xs text-foreground bg-muted px-2.5 py-1 rounded-lg">
                {s.role === "Kitchen Staff" ? <ChefHat className="h-3.5 w-3.5 text-forest" /> : <UserCheck className="h-3.5 w-3.5 text-forest" />}
                {s.role}
              </span>,
              <span className="font-mono text-xs text-muted-foreground">{s.email}</span>,
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
              </span>,
              <Button
                size="sm"
                variant="outline"
                onClick={() => removeMember(s.id, s.name)}
                className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-destructive"
                title="Remove staff member"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>,
            ])}
          />
        )}
      </Panel>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display font-bold">Invite Staff Member</DialogTitle>
            <DialogDescription>
              Grant kitchen ticket line or floor dining management access to a team member.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold">Full Name *</Label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sen"
                className="mt-1 h-10 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Email Address *</Label>
              <Input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@outlet.com"
                className="mt-1 h-10 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Assigned Role</Label>
              <Select value={role} onValueChange={(v: StaffMember["role"]) => setRole(v)}>
                <SelectTrigger className="mt-1 h-10 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kitchen Staff">Kitchen Staff (KDS Display line)</SelectItem>
                  <SelectItem value="Floor Staff">Floor Staff (Table service)</SelectItem>
                  <SelectItem value="Shift Manager">Shift Manager (Full dining control)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-forest text-white hover:bg-forest/90 font-bold">
                Add Team Member
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
