import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Building2,
  ExternalLink,
  Pencil,
  Trash2,
  PauseCircle,
  PlayCircle,
  Loader2,
  UtensilsCrossed,
  ShieldCheck,
  Search,
  AlertTriangle,
  ClipboardList,
  IndianRupee,
  Activity,
} from "lucide-react";
import { PageHeader, Panel, SimpleTable, StatCard } from "@/components/shared/ui-bits";
import { formatINR } from "@/lib/demo-data";
import {
  platformRestaurantsQuery,
  usePlatformRestaurantMutations,
  type PlatformRestaurant,
} from "@/lib/platform-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/super-admin/")({
  component: SuperAdminDashboard,
});

function SuperAdminDashboard() {
  const { data: restaurants, isLoading, isError, error } = useQuery(platformRestaurantsQuery);
  const mutations = usePlatformRestaurantMutations();

  const [q, setQ] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<PlatformRestaurant | null>(null);
  const [deleting, setDeleting] = useState<PlatformRestaurant | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");

  const totalRestaurants = restaurants?.length ?? 0;
  const activeCount = restaurants?.filter((r) => !r.isSuspended).length ?? 0;
  const suspendedCount = restaurants?.filter((r) => r.isSuspended).length ?? 0;
  const totalOrders = restaurants?.reduce((acc, r) => acc + r.orderCount, 0) ?? 0;
  const totalRevenue = restaurants?.reduce((acc, r) => acc + r.revenue, 0) ?? 0;

  const openAdd = () => {
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setDescription("");
    setAddOpen(true);
  };

  const openEdit = (r: PlatformRestaurant) => {
    setEditing(r);
    setName(r.name);
    setPhone(r.phone === "N/A" ? "" : r.phone);
    setEmail(r.email === "N/A" ? "" : r.email);
    setAddress(r.address === "Standard Outlet" ? "" : r.address);
    setDescription(r.description);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Restaurant name is required");
      return;
    }
    try {
      await mutations.add.mutateAsync({ name, phone, email, address, description });
      toast.success(`Restaurant "${name}" created successfully`);
      setAddOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create restaurant");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !name.trim()) return;
    try {
      await mutations.edit.mutateAsync({
        id: editing.id,
        name,
        phone,
        email,
        address,
        description,
      });
      toast.success(`Restaurant "${name}" updated successfully`);
      setEditing(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update restaurant");
    }
  };

  const handleToggleSuspend = async (r: PlatformRestaurant) => {
    const nextState = !r.isSuspended;
    try {
      await mutations.toggleSuspension.mutateAsync({ id: r.id, suspend: nextState });
      toast.success(
        nextState
          ? `Suspended "${r.name}". Customer orders blocked.`
          : `Reactivated "${r.name}". Accepting orders.`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to toggle status");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await mutations.deleteRestaurant.mutateAsync(deleting.id);
      toast.success(`Restaurant "${deleting.name}" safely archived. Order history preserved.`);
      setDeleting(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete restaurant");
    }
  };

  const filtered = (restaurants ?? []).filter((r) => {
    const term = q.toLowerCase();
    return (
      r.name.toLowerCase().includes(term) ||
      r.slug.toLowerCase().includes(term) ||
      (r.email && r.email.toLowerCase().includes(term))
    );
  });

  return (
    <>
      <PageHeader
        title="Super Admin Dashboard"
        description="Platform Owner panel to monitor metrics, activate/suspend outlets, and manage all restaurants."
        actions={
          <Button
            onClick={openAdd}
            className="rounded-xl bg-forest hover:bg-forest/90 text-white font-bold shadow-xs transition-all"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Onboard Restaurant
          </Button>
        }
      />

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        <StatCard
          label="Active Restaurants"
          value={isLoading ? "…" : String(activeCount)}
          delta={suspendedCount > 0 ? `${suspendedCount} suspended` : "All active"}
          icon={Building2}
        />
        <StatCard
          label="Total Orders"
          value={isLoading ? "…" : String(totalOrders)}
          delta="Platform volume"
          icon={ClipboardList}
        />
        <StatCard
          label="Gross Revenue"
          value={isLoading ? "…" : formatINR(totalRevenue)}
          delta="Across all outlets"
          icon={IndianRupee}
        />
        <StatCard label="System Status" value="Healthy" delta="RLS Protected" icon={Activity} />
      </div>

      <Panel title={`Registered Restaurants (${filtered.length})`}>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by restaurant name, slug, or email…"
              className="pl-9 h-10 rounded-xl"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Active
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Suspended
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-3 text-forest" />
            <p className="text-sm font-medium">Loading platform restaurants from database…</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-destructive">
            <AlertTriangle className="h-8 w-8 mb-2" />
            <p className="font-semibold text-sm">Error loading restaurants</p>
            <p className="text-xs text-muted-foreground mt-1">
              {error instanceof Error ? error.message : "Database query failed"}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-muted-foreground">
            {q
              ? "No restaurants matching your search filter."
              : "No restaurants found. Click 'Onboard Restaurant' to register one."}
          </div>
        ) : (
          <SimpleTable
            head={[
              "Restaurant & Slug",
              "Operating Status",
              "Menu Data",
              "Orders & Revenue",
              "Actions",
            ]}
            rows={filtered.map((r) => [
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest/10 font-bold text-sm text-forest uppercase">
                  {r.name.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground text-sm">{r.name}</p>
                    <a
                      href={`/menu/${r.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground hover:text-forest transition-colors"
                      title="Open Customer QR Menu"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">/menu/{r.slug}</p>
                </div>
              </div>,

              <div>
                {r.isSuspended ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    <PauseCircle className="h-3 w-3" /> Suspended
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    <ShieldCheck className="h-3 w-3" /> Active
                  </span>
                )}
              </div>,

              <div className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{r.itemCount}</span> items in{" "}
                <span className="font-semibold text-foreground">{r.categoryCount}</span> categories
              </div>,

              <div>
                <p className="font-semibold text-xs text-foreground">{r.orderCount} orders</p>
                <p className="text-xs text-muted-foreground font-mono">{formatINR(r.revenue)}</p>
              </div>,

              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEdit(r)}
                  className="h-8 px-2.5 rounded-lg text-xs"
                >
                  <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleToggleSuspend(r)}
                  className={cn(
                    "h-8 px-2 rounded-lg text-xs",
                    r.isSuspended
                      ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                      : "text-amber-600 hover:text-amber-700 hover:bg-amber-50",
                  )}
                  title={r.isSuspended ? "Reactivate outlet" : "Suspend outlet"}
                >
                  {r.isSuspended ? (
                    <PlayCircle className="h-4 w-4" />
                  ) : (
                    <PauseCircle className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeleting(r)}
                  className="h-8 px-2 rounded-lg text-destructive hover:bg-destructive/10"
                  title="Archive restaurant"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>,
            ])}
          />
        )}
      </Panel>

      {/* Onboard Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display font-bold">Onboard New Restaurant</DialogTitle>
            <DialogDescription>
              Register a new restaurant franchise onto the platform.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div>
              <Label htmlFor="add-name">Restaurant Name *</Label>
              <Input
                id="add-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Olive & Thyme"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="add-phone">Phone</Label>
                <Input
                  id="add-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <Label htmlFor="add-email">Email</Label>
                <Input
                  id="add-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@outlet.com"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="add-address">Address</Label>
              <Input
                id="add-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 45 Connaught Place, New Delhi"
              />
            </div>
            <div>
              <Label htmlFor="add-desc">Tagline / Description</Label>
              <Textarea
                id="add-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Authentic Mediterranean dining"
                rows={2}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-forest text-white"
                disabled={mutations.add.isPending}
              >
                {mutations.add.isPending && <Loader2 className="animate-spin h-4 w-4 mr-1.5" />}
                Create Restaurant
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display font-bold">Edit Restaurant</DialogTitle>
            <DialogDescription>Update business details for {editing?.name}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 py-2">
            <div>
              <Label htmlFor="edit-name">Restaurant Name *</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input id="edit-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-desc">Tagline / Description</Label>
              <Textarea
                id="edit-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-forest text-white"
                disabled={mutations.edit.isPending}
              >
                {mutations.edit.isPending && <Loader2 className="animate-spin h-4 w-4 mr-1.5" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete / Archive Alert */}
      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Restaurant?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive <strong>{deleting?.name}</strong>? Past orders and
              financial data will be safely preserved for reporting, but customer ordering will be
              disabled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={mutations.deleteRestaurant.isPending}
            >
              {mutations.deleteRestaurant.isPending ? "Archiving…" : "Archive Restaurant"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
