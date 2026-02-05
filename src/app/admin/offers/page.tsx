"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Calendar,
  Percent,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  Tags,
} from "lucide-react";
import { format, parseISO, isBefore, isAfter } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { useAppStore, canManageOffers } from "@/stores/app-store";
import { offers, branches, categories, products } from "@/data/seed";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Offer } from "@/types";

export default function OffersPage() {
  const { currentRole, selectedBranchId } = useAppStore();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const canManage = canManageOffers(currentRole);

  const filteredOffers = selectedBranchId
    ? offers.filter((o) => !o.branchIds || o.branchIds.includes(selectedBranchId))
    : offers;

  const getOfferStatus = (offer: Offer) => {
    const now = new Date();
    const start = parseISO(offer.startDate);
    const end = parseISO(offer.endDate);

    if (!offer.isActive) return { label: "Inactive", variant: "secondary" as const };
    if (isBefore(now, start)) return { label: "Scheduled", variant: "warning" as const };
    if (isAfter(now, end)) return { label: "Expired", variant: "destructive" as const };
    return { label: "Active", variant: "success" as const };
  };

  const getAppliesTo = (offer: Offer) => {
    const parts: string[] = [];
    if (offer.categoryIds?.length) {
      const catNames = offer.categoryIds
        .map((id) => categories.find((c) => c.id === id)?.name)
        .filter(Boolean);
      parts.push(`Categories: ${catNames.join(", ")}`);
    }
    if (offer.productIds?.length) {
      const prodNames = offer.productIds
        .map((id) => products.find((p) => p.id === id)?.name)
        .filter(Boolean)
        .slice(0, 3);
      parts.push(`Products: ${prodNames.join(", ")}${offer.productIds.length > 3 ? "..." : ""}`);
    }
    if (!parts.length) return "All products";
    return parts.join(" | ");
  };

  const getBranchScope = (offer: Offer) => {
    if (!offer.branchIds?.length) return "All branches";
    return offer.branchIds
      .map((id) => branches.find((b) => b.id === id)?.name.replace("Caffissimo", "").trim())
      .filter(Boolean)
      .join(", ");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Offers & Promotions"
        description="Create and manage discounts and promotions"
        actions={
          canManage && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Offer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Offer</DialogTitle>
                  <DialogDescription>
                    Set up a new promotion for your customers
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Offer Name</Label>
                      <Input placeholder="e.g., Morning Rush Discount" />
                    </div>
                    <div className="space-y-2">
                      <Label>Discount Type</Label>
                      <Select defaultValue="percent">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percent">Percentage Off</SelectItem>
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea placeholder="Describe the offer..." />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Discount Value</Label>
                      <Input type="number" placeholder="20" />
                    </div>
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input type="date" />
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Applies to Categories</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select categories (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Branch Scope</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="All branches" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Branches</SelectItem>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setCreateDialogOpen(false)}>
                    Create Offer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )
        }
      />

      {filteredOffers.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={Tags}
              title="No offers yet"
              description="Create your first offer to attract customers"
              action={
                canManage && (
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Offer
                  </Button>
                )
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredOffers.map((offer, index) => {
            const status = getOfferStatus(offer);
            return (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          offer.discountType === "percent" ? "bg-blue-100" : "bg-green-100"
                        }`}>
                          {offer.discountType === "percent" ? (
                            <Percent className="h-5 w-5 text-blue-600" />
                          ) : (
                            <DollarSign className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-base">{offer.name}</CardTitle>
                          <Badge variant={status.variant} className="mt-1">
                            {status.label}
                          </Badge>
                        </div>
                      </div>
                      {canManage && (
                        <Switch checked={offer.isActive} />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {offer.description}
                    </p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        {offer.discountType === "percent" ? (
                          <span className="font-semibold text-lg text-blue-600">
                            {offer.discountValue}% OFF
                          </span>
                        ) : (
                          <span className="font-semibold text-lg text-green-600">
                            {formatCurrency(offer.discountValue)} OFF
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDate(offer.startDate)} - {formatDate(offer.endDate)}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {getAppliesTo(offer)}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Branches: {getBranchScope(offer)}
                      </p>
                    </div>

                    {canManage && (
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle>E-Commerce Preview</CardTitle>
          <CardDescription>
            How active offers appear to customers on the website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {filteredOffers
              .filter((o) => o.isActive)
              .slice(0, 3)
              .map((offer) => (
                <div
                  key={offer.id}
                  className="rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    {offer.discountType === "percent" ? (
                      <span className="text-2xl font-bold text-primary">
                        {offer.discountValue}%
                      </span>
                    ) : (
                      <span className="text-2xl font-bold text-primary">
                        ${offer.discountValue}
                      </span>
                    )}
                    <span className="text-lg font-medium">OFF</span>
                  </div>
                  <h4 className="font-medium">{offer.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {offer.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Valid until {formatDate(offer.endDate)}
                  </p>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
