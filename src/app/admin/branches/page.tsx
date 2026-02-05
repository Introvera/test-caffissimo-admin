"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  Settings,
  Store,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/shared/page-header";
import { useAppStore, canManageBranch, canAccessAllBranches } from "@/stores/app-store";
import { branches } from "@/data/seed";

export default function BranchesPage() {
  const { currentRole, selectedBranchId, assignedBranchId } = useAppStore();

  const filteredBranches = canAccessAllBranches(currentRole)
    ? branches
    : branches.filter((b) => b.id === assignedBranchId);

  const canManage = canManageBranch(currentRole);

  const getTodayHours = (branch: typeof branches[0]) => {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const today = days[new Date().getDay()];
    const hours = branch.openingHours[today];
    if (hours.closed) return "Closed";
    return `${hours.open} - ${hours.close}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Branches"
        description="Manage your coffee shop locations"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredBranches.map((branch, index) => (
          <motion.div
            key={branch.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Store className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{branch.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={branch.isOpen ? "success" : "secondary"}>
                          {branch.isOpen ? "Open" : "Closed"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {canManage && (
                    <Switch checked={branch.isOpen} />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground">{branch.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{branch.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{branch.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Today: {getTodayHours(branch)}</span>
                  </div>
                </div>

                {/* Platform Links */}
                <div className="flex gap-2">
                  {branch.uberEatsUrl && (
                    <a
                      href={branch.uberEatsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Uber Eats
                      </Button>
                    </a>
                  )}
                  {branch.doorDashUrl && (
                    <a
                      href={branch.doorDashUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        DoorDash
                      </Button>
                    </a>
                  )}
                </div>

                <Link href={`/admin/branches/${branch.id}`}>
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Branch
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
