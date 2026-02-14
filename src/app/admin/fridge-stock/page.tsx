"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Thermometer, Calendar, FileText } from "lucide-react";
import { parseISO, format, isWithinInterval, startOfDay } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { useAppStore, canSubmitFridgeReport, canAccessAllBranches } from "@/stores/app-store";
import { fridgeStockReports, branches } from "@/data/seed";
import { formatDate } from "@/lib/utils";

const FRIDGE_UNITS = [
  "Main Fridge",
  "Milk Fridge",
  "Pastry Display Fridge",
  "Walk-in Cooler",
];

export default function FridgeStockPage() {
  const { currentRole, selectedBranchId, assignedBranchId, dateRange } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [temperatureValues, setTemperatureValues] = useState<Record<string, number>>({});

  const effectiveBranchId = selectedBranchId || assignedBranchId;
  const canSubmit = canSubmitFridgeReport(currentRole);

  const filteredReports = useMemo(() => {
    return fridgeStockReports.filter((report) => {
      const reportDate = parseISO(report.date);
      const inDateRange = isWithinInterval(reportDate, {
        start: startOfDay(dateRange.from),
        end: dateRange.to,
      });
      const inBranch = !effectiveBranchId || report.branchId === effectiveBranchId;
      const matchesSearch =
        !searchQuery ||
        report.submittedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.notes?.toLowerCase().includes(searchQuery.toLowerCase());

      return inDateRange && inBranch && matchesSearch;
    });
  }, [dateRange, effectiveBranchId, searchQuery]);

  const getBranchName = (branchId: string) => {
    return branches.find((b) => b.id === branchId)?.name.replace("Caffissimo", "").trim() || "Unknown";
  };

  const getTemperatureColor = (temp: number) => {
    if (temp < 33 || temp > 40) return "text-red-600 bg-red-100";
    if (temp < 34 || temp > 38) return "text-amber-600 bg-amber-100";
    return "text-green-600 bg-green-100";
  };

  const handleSubmit = () => {
    console.log("Submitting temperature report:", temperatureValues);
    setSubmitDialogOpen(false);
    setTemperatureValues({});
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fridge Temperature Report"
        description="Track daily fridge temperatures"
        actions={
          canSubmit && (
            <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Report
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Submit Daily Temperature Report</DialogTitle>
                  <DialogDescription>
                    Enter today&apos;s fridge temperatures (°F)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input type="date" defaultValue={format(new Date(), "yyyy-MM-dd")} />
                    </div>
                    {canAccessAllBranches(currentRole) && (
                      <div className="space-y-2">
                        <Label>Branch</Label>
                        <Select defaultValue={effectiveBranchId || branches[0].id}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {branches.map((branch) => (
                              <SelectItem key={branch.id} value={branch.id}>
                                {branch.name.replace("Caffissimo", "").trim()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label>Fridge Temperatures (°F)</Label>
                    {FRIDGE_UNITS.map((unit) => (
                      <div key={unit} className="flex items-center gap-3">
                        <span className="flex-1 text-sm">{unit}</span>
                        <div className="relative w-24">
                          <Input
                            type="number"
                            step="0.1"
                            className="pr-7"
                            placeholder="36.0"
                            value={temperatureValues[unit] || ""}
                            onChange={(e) =>
                              setTemperatureValues((prev) => ({
                                ...prev,
                                [unit]: parseFloat(e.target.value) || 0,
                              }))
                            }
                          />
                          <span className="absolute right-2.5 top-2.5 text-xs text-muted-foreground">°F</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label>Notes (optional)</Label>
                    <Textarea placeholder="Any additional notes..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSubmitDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit}>
                    Submit Report
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>Temperature Report History</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-[200px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <EmptyState
              icon={Thermometer}
              title="No reports found"
              description="Submit a temperature report to track fridge conditions"
              action={
                canSubmit && (
                  <Button onClick={() => setSubmitDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Submit Report
                  </Button>
                )
              }
            />
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {formatDate(report.date)}
                            </CardTitle>
                            <CardDescription>
                              {getBranchName(report.branchId)} &bull; Submitted by {report.submittedBy}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {report.temperatures.map((entry) => (
                          <div
                            key={entry.name}
                            className={`text-center p-3 rounded-lg ${getTemperatureColor(entry.temperature)}`}
                          >
                            <p className="text-2xl font-bold">{entry.temperature}°F</p>
                            <p className="text-xs line-clamp-2 mt-1">
                              {entry.name}
                            </p>
                          </div>
                        ))}
                      </div>
                      {report.notes && (
                        <div className="mt-4 p-3 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground">
                            <FileText className="h-4 w-4 inline mr-1" />
                            {report.notes}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
