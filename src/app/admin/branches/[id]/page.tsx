"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, ExternalLink, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/shared/page-header";
import { useAppSelector } from "@/stores/store";
import { useGetBranchByIdQuery } from "@/stores/api/branchApi";
import { canManageBranch } from "@/lib/rbac";
import { UserRole } from "@/types";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface BranchDetailPageProps {
  params: Promise<{ id: string }>;
}

const DAYS = [
  { index: 1, label: "Monday" },
  { index: 2, label: "Tuesday" },
  { index: 3, label: "Wednesday" },
  { index: 4, label: "Thursday" },
  { index: 5, label: "Friday" },
  { index: 6, label: "Saturday" },
  { index: 0, label: "Sunday" },
];

export default function BranchDetailPage({ params }: BranchDetailPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const currentRole = useAppSelector((state) => state.auth.user?.role) || UserRole.Cashier;
  
  const { data: branch, isLoading } = useGetBranchByIdQuery(resolvedParams.id);
  const canEdit = canManageBranch(currentRole);
  
  const [showUberApiKey, setShowUberApiKey] = useState(false);
  const [showDoorApiKey, setShowDoorApiKey] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[300px] w-full rounded-xl" />
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
          <Skeleton className="h-[200px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="space-y-6">
        <PageHeader title="Branch Not Found" />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              The branch you&apos;re looking for doesn&apos;t exist.
            </p>
            <Button onClick={() => router.push("/admin/branches")} className="mt-4">
              Back to Branches
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title={branch.branchName}
          description="Manage branch settings and information"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Branch Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Branch Name</Label>
                <Input defaultValue={branch.branchName} disabled={!canEdit} />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input defaultValue={branch.branchAddress} disabled={!canEdit} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input defaultValue={branch.branchPhoneNumber} disabled={!canEdit} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue={branch.branchEmail} disabled={!canEdit} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operating Hours</CardTitle>
              <CardDescription>Set the opening hours for each day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {DAYS.map(({ index, label }) => {
                  const hours = branch.openingHours?.find(h => h.dayOfWeek === index);
                  const isOpen = hours && !hours.isClosed && hours.isActive;
                  return (
                    <div key={index} className="flex items-center gap-4">
                      <span className="w-24 text-sm font-medium">{label}</span>
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          type="time"
                          defaultValue={hours?.openAt || ""}
                          disabled={!canEdit || !isOpen}
                          className="w-28"
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input
                          type="time"
                          defaultValue={hours?.closeAt || ""}
                          disabled={!canEdit || !isOpen}
                          className="w-28"
                        />
                        <div className="flex items-center gap-2 ml-4">
                          <Switch
                            checked={isOpen ?? false}
                            disabled={!canEdit}
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

          <Card>
            <CardHeader>
              <CardTitle>Delivery platform</CardTitle>
              <CardDescription>URLs and API keys for Uber Eats and DoorDash</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Uber Eats URL</Label>
                  <div className="flex gap-2">
                    <Input
                      defaultValue={branch.uberEatsUrl}
                      placeholder="https://ubereats.com/..."
                      disabled={!canEdit}
                      className="flex-1"
                    />
                    {branch.uberEatsUrl && (
                      <a href={branch.uberEatsUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="icon">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>DoorDash URL</Label>
                  <div className="flex gap-2">
                    <Input
                      defaultValue={branch.doorDashUrl}
                      placeholder="https://doordash.com/..."
                      disabled={!canEdit}
                      className="flex-1"
                    />
                    {branch.doorDashUrl && (
                      <a href={branch.doorDashUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="icon">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-4 pt-2 border-t">
                <p className="text-sm font-medium">API keys</p>
                <p className="text-sm text-muted-foreground">
                  Used to sync orders and menu. Leave blank to keep existing key.
                </p>
                <div className="space-y-2">
                  <Label>Uber Eats API key</Label>
                  <div className="relative">
                    <Input
                      type={showUberApiKey ? "text" : "password"}
                      autoComplete="off"
                      placeholder={branch.uberEatsApiKey ? "••••••••••••" : "Enter API key (optional)"}
                      disabled={!canEdit}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowUberApiKey(!showUberApiKey)}
                      disabled={!canEdit}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                      aria-label={showUberApiKey ? "Hide key" : "Show key"}
                    >
                      {showUberApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>DoorDash API key</Label>
                  <div className="relative">
                    <Input
                      type={showDoorApiKey ? "text" : "password"}
                      autoComplete="off"
                      placeholder={branch.doorDashApiKey ? "••••••••••••" : "Enter API key (optional)"}
                      disabled={!canEdit}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDoorApiKey(!showDoorApiKey)}
                      disabled={!canEdit}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                      aria-label={showDoorApiKey ? "Hide key" : "Show key"}
                    >
                      {showDoorApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Branch Open</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle to open or close the branch
                  </p>
                </div>
                <Switch checked={branch.isOpen} disabled={!canEdit} />
              </div>
            </CardContent>
          </Card>

          {canEdit && (
            <Card>
              <CardContent className="pt-6">
                <Button className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
