import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Panel } from "@/components/shared/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, CheckCircle2, ShieldCheck, Globe, Server, BellRing } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/platform/settings")({
  component: PlatformSettingsPage,
});

function PlatformSettingsPage() {
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Platform settings saved successfully");
    }, 600);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Platform Configuration" 
        description="Global system parameters, multi-tenant rules, and onboarding governance."
        actions={
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="h-10 bg-forest text-forest-foreground hover:bg-forest/90 font-bold px-5 rounded-xl shadow-soft flex items-center gap-2"
          >
            {saving ? <span className="animate-spin">⏳</span> : <Save className="h-4 w-4" />}
            <span>Save Configuration</span>
          </Button>
        } 
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Platform Identity & Contact">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-forest" /> Public Platform Name
              </Label>
              <Input 
                defaultValue="Smart Restaurant OS" 
                className="h-10 rounded-xl border-border/80 bg-background font-medium text-xs focus:border-forest focus:ring-forest/20"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                <Server className="h-3.5 w-3.5 text-forest" /> Support & Escalation Email
              </Label>
              <Input 
                defaultValue="support@smartrestaurantos.com" 
                className="h-10 rounded-xl border-border/80 bg-background font-medium text-xs focus:border-forest focus:ring-forest/20"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground/80">API Gateway Environment</Label>
              <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/40 px-3.5 py-2.5 text-xs font-mono text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>production-cluster-ap-south-1.smartos.internal</span>
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Tenant Onboarding & Compliance">
          <div className="space-y-5">
            {[
              { 
                label: "Allow self-signup for new restaurant owners", 
                desc: "Permits new restaurants to register through the portal without manual whitelist." 
              },
              { 
                label: "Require identity verification before going live", 
                desc: "Requires platform administrator approval before public QR menu opens to diners." 
              },
              { 
                label: "Automatic 14-day trial evaluation period", 
                desc: "Enables full feature sandbox mode for newly registered restaurant operators." 
              },
              { 
                label: "Enforce multi-factor authentication for admins", 
                desc: "Requires TOTP authenticator app verification for all superadmin accounts." 
              },
            ].map((item, idx) => (
              <label 
                key={idx} 
                className="flex items-start justify-between gap-4 rounded-xl border border-border/60 bg-muted/20 p-3.5 hover:bg-muted/40 transition-colors cursor-pointer"
              >
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-foreground">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
                <Switch defaultChecked={idx !== 1} className="mt-0.5" />
              </label>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
