"use client";

import { useState } from "react";
import {
  Settings,
  Upload,
  Save,
  Percent,
  DollarSign,
  Coffee,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { useAppStore, canManageSettings } from "@/stores/app-store";

export default function SettingsPage() {
  const { currentRole, devMode, setDevMode } = useAppStore();
  const [taxRate, setTaxRate] = useState("8.75");
  const [serviceFeeRate, setServiceFeeRate] = useState("0");

  const canManage = canManageSettings(currentRole);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure system preferences"
      />

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="tax">Tax & Fees</TabsTrigger>
          <TabsTrigger value="developer">Developer</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>
                Customize your brand appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Coffee className="h-10 w-10 text-primary" />
                  </div>
                  {canManage && (
                    <div>
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        Recommended: 200x200px, PNG or SVG
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input defaultValue="Caffissimo" disabled={!canManage} />
              </div>

              <div className="space-y-2">
                <Label>Support Email</Label>
                <Input
                  type="email"
                  defaultValue="support@caffissimo.com"
                  disabled={!canManage}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax Settings</CardTitle>
              <CardDescription>
                Configure tax and service fee rates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tax Rate (%)</Label>
                <div className="relative w-32">
                  <Input
                    type="number"
                    step="0.01"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    disabled={!canManage}
                    className="pr-8"
                  />
                  <Percent className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Applied to all orders
                </p>
              </div>

              <div className="space-y-2">
                <Label>Service Fee Rate (%)</Label>
                <div className="relative w-32">
                  <Input
                    type="number"
                    step="0.01"
                    value={serviceFeeRate}
                    onChange={(e) => setServiceFeeRate(e.target.value)}
                    disabled={!canManage}
                    className="pr-8"
                  />
                  <Percent className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Optional service fee for online orders
                </p>
              </div>

              {canManage && (
                <Button className="mt-4">
                  <Save className="h-4 w-4 mr-2" />
                  Save Tax Settings
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>POS Rules</CardTitle>
              <CardDescription>
                Configure point of sale behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Customer Name</Label>
                  <p className="text-sm text-muted-foreground">
                    Ask for customer name on POS orders
                  </p>
                </div>
                <Switch disabled={!canManage} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Print Receipt Automatically</Label>
                  <p className="text-sm text-muted-foreground">
                    Auto-print receipt after payment
                  </p>
                </div>
                <Switch defaultChecked disabled={!canManage} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Cash Payments</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable cash payment option at POS
                  </p>
                </div>
                <Switch defaultChecked disabled={!canManage} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="developer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Developer Mode</CardTitle>
              <CardDescription>
                Settings for development and testing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Dev Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable role switcher and debugging tools
                  </p>
                </div>
                <Switch
                  checked={devMode}
                  onCheckedChange={setDevMode}
                />
              </div>

              {devMode && (
                <>
                  <Separator />
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Dev Mode Enabled</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      When enabled, you can:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Switch between roles using the header dropdown</li>
                      <li>View components with different permission levels</li>
                      <li>Access all branches regardless of role</li>
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Information</CardTitle>
              <CardDescription>
                Mock API endpoints for development
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 font-mono text-sm">
                <div className="p-2 bg-muted rounded">
                  <span className="text-green-600">GET</span> /api/orders
                </div>
                <div className="p-2 bg-muted rounded">
                  <span className="text-green-600">GET</span> /api/products
                </div>
                <div className="p-2 bg-muted rounded">
                  <span className="text-green-600">GET</span> /api/branches
                </div>
                <div className="p-2 bg-muted rounded">
                  <span className="text-blue-600">POST</span> /api/orders
                </div>
                <div className="p-2 bg-muted rounded">
                  <span className="text-orange-600">PUT</span> /api/products/:id
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                These endpoints use local JSON seed data and can be swapped to a real backend.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
