"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Plus,
  Check,
  AlertCircle,
  ExternalLink,
  Car,
  FileSpreadsheet,
} from "lucide-react";
import { parseISO, isWithinInterval, startOfDay, format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { useAppStore } from "@/stores/app-store";
import { externalSalesEntries, branches, orders } from "@/data/seed";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function PlatformsPage() {
  const { dateRange, selectedBranchId } = useAppStore();
  const [manualEntryOpen, setManualEntryOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<"uber_eats" | "doordash">("uber_eats");

  // Filter external sales
  const filteredExternalSales = useMemo(() => {
    return externalSalesEntries.filter((entry) => {
      const entryDate = parseISO(entry.date);
      const inDateRange = isWithinInterval(entryDate, {
        start: startOfDay(dateRange.from),
        end: dateRange.to,
      });
      const inBranch = !selectedBranchId || entry.branchId === selectedBranchId;
      return inDateRange && inBranch;
    });
  }, [dateRange, selectedBranchId]);

  // Filter orders from external platforms
  const externalOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = parseISO(order.createdAt);
      const inDateRange = isWithinInterval(orderDate, {
        start: startOfDay(dateRange.from),
        end: dateRange.to,
      });
      const inBranch = !selectedBranchId || order.branchId === selectedBranchId;
      const isExternal = order.source === "uber_eats" || order.source === "doordash";
      return inDateRange && inBranch && isExternal;
    });
  }, [dateRange, selectedBranchId]);

  // Platform stats
  const platformStats = useMemo(() => {
    const uberOrders = externalOrders.filter((o) => o.source === "uber_eats");
    const doordashOrders = externalOrders.filter((o) => o.source === "doordash");
    const uberExternal = filteredExternalSales.filter((e) => e.platform === "uber_eats");
    const doordashExternal = filteredExternalSales.filter((e) => e.platform === "doordash");

    return {
      uber: {
        orderTotal: uberOrders.reduce((s, o) => s + o.total, 0),
        orderCount: uberOrders.length,
        importedTotal: uberExternal.reduce((s, e) => s + e.totalSales, 0),
        importedCount: uberExternal.reduce((s, e) => s + e.orderCount, 0),
      },
      doordash: {
        orderTotal: doordashOrders.reduce((s, o) => s + o.total, 0),
        orderCount: doordashOrders.length,
        importedTotal: doordashExternal.reduce((s, e) => s + e.totalSales, 0),
        importedCount: doordashExternal.reduce((s, e) => s + e.orderCount, 0),
      },
    };
  }, [externalOrders, filteredExternalSales]);

  const getBranchName = (branchId: string) => {
    return branches.find((b) => b.id === branchId)?.name.replace("Caffissimo", "").trim() || "Unknown";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="External Platforms"
        description="Manage Uber Eats and DoorDash integrations"
        actions={
          <div className="flex gap-2">
            <Dialog open={importOpen} onOpenChange={setImportOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Sales Data</DialogTitle>
                  <DialogDescription>
                    Upload a CSV file with sales data from Uber Eats or DoorDash
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Platform</Label>
                    <Select
                      value={selectedPlatform}
                      onValueChange={(v) => setSelectedPlatform(v as "uber_eats" | "doordash")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="uber_eats">Uber Eats</SelectItem>
                        <SelectItem value="doordash">DoorDash</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <FileSpreadsheet className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drop your CSV file here or click to browse
                    </p>
                    <Button variant="outline" size="sm">
                      Select File
                    </Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setImportOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setImportOpen(false)}>
                    Import
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={manualEntryOpen} onOpenChange={setManualEntryOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Manual Entry
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Manual Sales Entry</DialogTitle>
                  <DialogDescription>
                    Enter daily sales totals from external platforms
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Platform</Label>
                    <Select
                      value={selectedPlatform}
                      onValueChange={(v) => setSelectedPlatform(v as "uber_eats" | "doordash")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="uber_eats">Uber Eats</SelectItem>
                        <SelectItem value="doordash">DoorDash</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Branch</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Total Sales</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                        <Input type="number" step="0.01" placeholder="0.00" className="pl-7" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Order Count</Label>
                      <Input type="number" placeholder="0" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setManualEntryOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setManualEntryOpen(false)}>
                    Add Entry
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Platform Status Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-violet-600 flex items-center justify-center">
                  <Car className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Uber Eats</CardTitle>
                  <CardDescription>Connected</CardDescription>
                </div>
              </div>
              <Badge variant="success">
                <Check className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order Sales</p>
                  <p className="text-xl font-bold">{formatCurrency(platformStats.uber.orderTotal)}</p>
                  <p className="text-xs text-muted-foreground">{platformStats.uber.orderCount} orders</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Imported Sales</p>
                  <p className="text-xl font-bold">{formatCurrency(platformStats.uber.importedTotal)}</p>
                  <p className="text-xs text-muted-foreground">{platformStats.uber.importedCount} orders</p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Uber Eats Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-red-500 flex items-center justify-center">
                  <Car className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">DoorDash</CardTitle>
                  <CardDescription>Connected</CardDescription>
                </div>
              </div>
              <Badge variant="success">
                <Check className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order Sales</p>
                  <p className="text-xl font-bold">{formatCurrency(platformStats.doordash.orderTotal)}</p>
                  <p className="text-xs text-muted-foreground">{platformStats.doordash.orderCount} orders</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Imported Sales</p>
                  <p className="text-xl font-bold">{formatCurrency(platformStats.doordash.importedTotal)}</p>
                  <p className="text-xs text-muted-foreground">{platformStats.doordash.importedCount} orders</p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open DoorDash Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Sales History */}
      <Tabs defaultValue="entries" className="space-y-4">
        <TabsList>
          <TabsTrigger value="entries">Imported/Manual Entries</TabsTrigger>
          <TabsTrigger value="orders">Platform Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="entries">
          <Card>
            <CardHeader>
              <CardTitle>Sales Entries</CardTitle>
              <CardDescription>
                Manually entered and imported sales data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Total Sales</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExternalSales.slice(0, 20).map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>
                        <Badge variant={entry.platform === "uber_eats" ? "uber" : "doordash"}>
                          {entry.platform === "uber_eats" ? "Uber Eats" : "DoorDash"}
                        </Badge>
                      </TableCell>
                      <TableCell>{getBranchName(entry.branchId)}</TableCell>
                      <TableCell>
                        <Badge variant={entry.source === "import" ? "secondary" : "outline"}>
                          {entry.source === "import" ? "Imported" : "Manual"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{entry.orderCount}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(entry.totalSales)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Platform Orders</CardTitle>
              <CardDescription>
                Individual orders from Uber Eats and DoorDash
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>External ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {externalOrders.slice(0, 20).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>
                        <Badge variant={order.source === "uber_eats" ? "uber" : "doordash"}>
                          {order.source === "uber_eats" ? "Uber Eats" : "DoorDash"}
                        </Badge>
                      </TableCell>
                      <TableCell>{getBranchName(order.branchId)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {order.externalOrderId}
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.status === "completed" ? "success" : order.status === "cancelled" ? "destructive" : "secondary"}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(order.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
