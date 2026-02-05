"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Phone, Mail, Save, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { useAppStore, canManageBranch } from "@/stores/app-store";
import { branches } from "@/data/seed";

interface BranchDetailPageProps {
  params: Promise<{ id: string }>;
}

const DAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

export default function BranchDetailPage({ params }: BranchDetailPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { currentRole } = useAppStore();

  const branch = branches.find((b) => b.id === resolvedParams.id);
  const canEdit = canManageBranch(currentRole);

  if (!branch) {
    return (
      <div className="space-y-6">
        <PageHeader title="Branch Not Found" />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              The branch you're looking for doesn't exist.
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
          title={branch.name}
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
                <Input defaultValue={branch.name} disabled={!canEdit} />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input defaultValue={branch.address} disabled={!canEdit} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input defaultValue={branch.phone} disabled={!canEdit} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue={branch.email} disabled={!canEdit} />
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
                {DAYS.map(({ key, label }) => {
                  const hours = branch.openingHours[key];
                  return (
                    <div key={key} className="flex items-center gap-4">
                      <span className="w-24 text-sm font-medium">{label}</span>
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          type="time"
                          defaultValue={hours.open}
                          disabled={!canEdit || hours.closed}
                          className="w-28"
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input
                          type="time"
                          defaultValue={hours.close}
                          disabled={!canEdit || hours.closed}
                          className="w-28"
                        />
                        <div className="flex items-center gap-2 ml-4">
                          <Switch
                            checked={!hours.closed}
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
              <CardTitle>Delivery Platform Links</CardTitle>
              <CardDescription>External delivery platform URLs for this branch</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
