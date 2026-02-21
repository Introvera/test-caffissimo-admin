"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/shared/page-header";
import { canCreateBranch } from "@/stores/app-store";
import { useAppStore } from "@/stores/app-store";

const DAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
] as const;

const defaultOpeningHours: Record<string, { open: string; close: string; closed?: boolean }> = {
  monday: { open: "06:00", close: "20:00" },
  tuesday: { open: "06:00", close: "20:00" },
  wednesday: { open: "06:00", close: "20:00" },
  thursday: { open: "06:00", close: "20:00" },
  friday: { open: "06:00", close: "21:00" },
  saturday: { open: "07:00", close: "21:00" },
  sunday: { open: "07:00", close: "18:00" },
};

export default function NewBranchPage() {
  const router = useRouter();
  const { currentRole } = useAppStore();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [uberEatsApiKey, setUberEatsApiKey] = useState("");
  const [doorDashApiKey, setDoorDashApiKey] = useState("");
  const [showUberKey, setShowUberKey] = useState(false);
  const [showDoorKey, setShowDoorKey] = useState(false);
  const [openingHours, setOpeningHours] = useState<Record<string, { open: string; close: string; closed?: boolean }>>(
    () => ({ ...defaultOpeningHours })
  );

  const canCreate = canCreateBranch(currentRole);

  const updateHours = (
    day: string,
    field: "open" | "close" | "closed",
    value: string | boolean
  ) => {
    setOpeningHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        ...(field === "closed" ? { closed: !value } : { [field]: value }),
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, persist to API here. For now redirect back.
    router.push("/admin/branches");
  };

  if (!canCreate) {
    return (
      <div className="space-y-6">
        <PageHeader title="Create Branch" description="You don't have permission to create branches." />
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Link href="/admin/branches">
              <Button variant="outline">Back to Branches</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/branches">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title="Create Branch"
          description="Add a new coffee shop location"
        />
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Branch Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Branch Name</Label>
              <Input
                id="name"
                placeholder="e.g., Downtown Caffissimo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Street, City, State, ZIP"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="branch@caffissimo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label>Branch open</Label>
                <p className="text-sm text-muted-foreground">Allow orders and show as open to customers</p>
              </div>
              <Switch checked={isOpen} onCheckedChange={setIsOpen} />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Operating hours</CardTitle>
            <CardDescription>Set the opening hours for each day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {DAYS.map(({ key, label }) => {
                const hours = openingHours[key] ?? defaultOpeningHours[key];
                const closed = hours?.closed ?? false;
                return (
                  <div key={key} className="flex items-center gap-4">
                    <span className="w-24 text-sm font-medium">{label}</span>
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="time"
                        value={hours?.open ?? "06:00"}
                        onChange={(e) => updateHours(key, "open", e.target.value)}
                        disabled={closed}
                        className="w-28"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={hours?.close ?? "20:00"}
                        onChange={(e) => updateHours(key, "close", e.target.value)}
                        disabled={closed}
                        className="w-28"
                      />
                      <div className="flex items-center gap-2 ml-4">
                        <Switch
                          checked={!closed}
                          onCheckedChange={(checked) => updateHours(key, "closed", checked)}
                        />
                        <span className="text-sm text-muted-foreground">Open</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Delivery platform API keys</CardTitle>
            <p className="text-sm text-muted-foreground">
              Optional. Add API keys to integrate orders from Uber Eats and DoorDash. Keys are stored securely.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="uberEatsApiKey">Uber Eats API key</Label>
              <div className="relative">
                <Input
                  id="uberEatsApiKey"
                  type={showUberKey ? "text" : "password"}
                  autoComplete="off"
                  placeholder="Enter Uber Eats API key (optional)"
                  value={uberEatsApiKey}
                  onChange={(e) => setUberEatsApiKey(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowUberKey(!showUberKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showUberKey ? "Hide key" : "Show key"}
                >
                  {showUberKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="doorDashApiKey">DoorDash API key</Label>
              <div className="relative">
                <Input
                  id="doorDashApiKey"
                  type={showDoorKey ? "text" : "password"}
                  autoComplete="off"
                  placeholder="Enter DoorDash API key (optional)"
                  value={doorDashApiKey}
                  onChange={(e) => setDoorDashApiKey(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowDoorKey(!showDoorKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showDoorKey ? "Hide key" : "Show key"}
                >
                  {showDoorKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="mt-6 flex gap-3">
          <Link href="/admin/branches">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit">
            Create Branch
          </Button>
        </div>
      </form>
    </div>
  );
}