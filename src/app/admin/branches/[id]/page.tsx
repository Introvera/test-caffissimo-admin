"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, ExternalLink, Eye, EyeOff, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/shared/page-header";
import { useAppSelector } from "@/stores/store";
import { useGetBranchByIdQuery, useUpdateBranchMutation } from "@/stores/api/branchApi";
import { canManageBranch } from "@/lib/rbac";
import { UserRole, Branch } from "@/types";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { ProductsTab } from "./tabs/products-tab";
import { UberMenusTab } from "./tabs/uber-menus-tab";
import { toast } from "sonner";

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
  
  const [updateBranch, { isLoading: isUpdating }] = useUpdateBranchMutation();
  const [formData, setFormData] = useState<Partial<Branch>>({});
  const [showUberApiKey, setShowUberApiKey] = useState(false);
  const [showDoorApiKey, setShowDoorApiKey] = useState(false);

  // Update local form data when branch data loads
  useEffect(() => {
    if (branch) {
      setFormData(branch);
    }
  }, [branch]);

  const handleSave = async () => {
    try {
      await updateBranch({ id: resolvedParams.id, data: formData }).unwrap();
      toast.success("Branch updated successfully");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update branch");
    }
  };

  const handleHoursChange = (dayIndex: number, field: string, value: any) => {
    const hours = [...(formData.openingHours || [])];
    const index = hours.findIndex(h => h.dayOfWeek === dayIndex);
    
    if (index > -1) {
      hours[index] = { ...hours[index], [field]: value };
    } else {
      hours.push({
        dayOfWeek: dayIndex,
        openAt: "09:00",
        closeAt: "17:00",
        isActive: true,
        isClosed: false,
        [field]: value
      } as any);
    }
    
    setFormData({ ...formData, openingHours: hours });
  };

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

  const currentBranch = { ...branch, ...formData };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title={currentBranch.branchName}
          description="Manage branch settings and information"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-background border-b rounded-none h-auto p-0 gap-6 w-full justify-start">
          <TabsTrigger 
            value="overview" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none px-1 pb-3 pt-0"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="products" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none px-1 pb-3 pt-0"
          >
            Products
          </TabsTrigger>
          <TabsTrigger 
            value="uber-menus" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none px-1 pb-3 pt-0"
          >
            Uber Menus
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="m-0">
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
                    <Input 
                      value={currentBranch.branchName} 
                      onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                      disabled={!canEdit} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input 
                      value={currentBranch.branchAddress} 
                      onChange={(e) => setFormData({ ...formData, branchAddress: e.target.value })}
                      disabled={!canEdit} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input 
                        value={currentBranch.branchPhoneNumber} 
                        onChange={(e) => setFormData({ ...formData, branchPhoneNumber: e.target.value })}
                        disabled={!canEdit} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input 
                        value={currentBranch.branchEmail} 
                        onChange={(e) => setFormData({ ...formData, branchEmail: e.target.value })}
                        disabled={!canEdit} 
                      />
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
                      const hours = currentBranch.openingHours?.find(h => h.dayOfWeek === index);
                      const isOpen = hours && !hours.isClosed && hours.isActive;
                      return (
                        <div key={index} className="flex items-center gap-4">
                          <span className="w-24 text-sm font-medium">{label}</span>
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              type="time"
                              value={hours?.openAt || ""}
                              onChange={(e) => handleHoursChange(index, "openAt", e.target.value)}
                              disabled={!canEdit || !isOpen}
                              className="w-28"
                            />
                            <span className="text-muted-foreground">to</span>
                            <Input
                              type="time"
                              value={hours?.closeAt || ""}
                              onChange={(e) => handleHoursChange(index, "closeAt", e.target.value)}
                              disabled={!canEdit || !isOpen}
                              className="w-28"
                            />
                            <div className="flex items-center gap-2 ml-4">
                              <Switch
                                checked={isOpen ?? false}
                                onCheckedChange={(v) => handleHoursChange(index, "isActive", v)}
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
                          value={currentBranch.uberEatsUrl || ""}
                          onChange={(e) => setFormData({ ...formData, uberEatsUrl: e.target.value })}
                          placeholder="https://ubereats.com/..."
                          disabled={!canEdit}
                          className="flex-1"
                        />
                        {currentBranch.uberEatsUrl && (
                          <a href={currentBranch.uberEatsUrl} target="_blank" rel="noopener noreferrer">
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
                          value={currentBranch.doorDashUrl || ""}
                          onChange={(e) => setFormData({ ...formData, doorDashUrl: e.target.value })}
                          placeholder="https://doordash.com/..."
                          disabled={!canEdit}
                          className="flex-1"
                        />
                        {currentBranch.doorDashUrl && (
                          <a href={currentBranch.doorDashUrl} target="_blank" rel="noopener noreferrer">
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
                          value={currentBranch.uberEatsApiKey || ""}
                          onChange={(e) => setFormData({ ...formData, uberEatsApiKey: e.target.value })}
                          placeholder={currentBranch.uberEatsApiKey ? "••••••••••••" : "Enter API key (optional)"}
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
                          value={currentBranch.doorDashApiKey || ""}
                          onChange={(e) => setFormData({ ...formData, doorDashApiKey: e.target.value })}
                          placeholder={currentBranch.doorDashApiKey ? "••••••••••••" : "Enter API key (optional)"}
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
                    <Switch 
                      checked={currentBranch.isOpen} 
                      onCheckedChange={(v) => setFormData({ ...formData, isOpen: v })}
                      disabled={!canEdit} 
                    />
                  </div>
                </CardContent>
              </Card>

              {canEdit && (
                <Card>
                  <CardContent className="pt-6">
                    <Button className="w-full" onClick={handleSave} disabled={isUpdating}>
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="products" className="m-0">
          <ProductsTab branchId={branch.branchId} canEdit={canEdit} />
        </TabsContent>

        <TabsContent value="uber-menus" className="m-0">
          <UberMenusTab branchId={branch.branchId} canEdit={canEdit} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
