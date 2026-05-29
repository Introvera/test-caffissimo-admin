"use client";

import { useState, useMemo } from "react";
import { useAppSelector } from "@/stores/store";
import { useGetBranchesQuery } from "@/stores/api/branchApi";
import {
  useGetUberPromotionsQuery,
  useCreateUberPromotionMutation,
  useDeleteUberPromotionMutation,
} from "@/stores/api/uberApi";
import { canAccessAllBranches } from "@/lib/rbac";
import type { UserRole } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tag, Plus, Trash2, RefreshCw, Percent, DollarSign, Truck } from "lucide-react";
import { toast } from "sonner";
import type { CreateUberPromotionRequest, UberPromotionResponse } from "@/types";

const PROMO_TYPES = [
  { value: "PERCENT_OFF", label: "Percentage Off", icon: Percent },
  { value: "FLAT_OFF", label: "Flat Discount", icon: DollarSign },
  { value: "FREE_DELIVERY", label: "Free Delivery", icon: Truck },
  { value: "BOGO", label: "Buy One Get One", icon: Tag },
];

function promoTypeLabel(type: string): string {
  const found = PROMO_TYPES.find((t) => t.value === type.toUpperCase());
  return found?.label ?? type;
}

function promoTypeBadgeVariant(type: string): "default" | "secondary" | "outline" {
  switch (type.toUpperCase()) {
    case "PERCENT_OFF":
    case "PERCENTOFF":
      return "default";
    case "FLAT_OFF":
    case "FLATOFF":
      return "default";
    case "FREE_DELIVERY":
    case "FREEDELIVERY":
      return "outline";
    default:
      return "secondary";
  }
}

function formatMoney(amount: number | null | undefined, currency = "USD"): string {
  if (amount == null) return "-";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export default function UberPromotionsPage() {
  const currentRole = useAppSelector((state) => state.auth.user?.role) as UserRole | undefined;
  const assignedBranchId = useAppSelector((state) => state.auth.user?.branchId) || null;
  const canUseAllBranches = currentRole ? canAccessAllBranches(currentRole) : false;
  const { data: branchesData } = useGetBranchesQuery(undefined);
  const branchOptions = useMemo(() => branchesData?.items ?? [], [branchesData?.items]);

  const [selectedBranchId, setSelectedBranchId] = useState("");
  const branchId = selectedBranchId || assignedBranchId || "";

  const { data, isLoading, isFetching, refetch } = useGetUberPromotionsQuery(
    { branchId },
    { skip: !branchId }
  );
  const [createPromotion, { isLoading: isCreating }] = useCreateUberPromotionMutation();
  const [deletePromotion] = useDeleteUberPromotionMutation();

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateUberPromotionRequest>({
    promoType: "PERCENT_OFF",
    title: "",
    discountPercentage: undefined,
    discountAmount: undefined,
    minOrderAmount: undefined,
    startDate: undefined,
    endDate: undefined,
  });

  const promotions = data?.promotions ?? [];

  const handleCreate = async () => {
    if (!branchId) return;

    try {
      await createPromotion({ branchId, data: form }).unwrap();
      toast.success("Promotion created on Uber Eats");
      setShowCreate(false);
      setForm({
        promoType: "PERCENT_OFF",
        title: "",
        discountPercentage: undefined,
        discountAmount: undefined,
        minOrderAmount: undefined,
      });
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create promotion");
    }
  };

  const handleDelete = async (promotionId: string) => {
    if (!branchId || !promotionId) return;
    if (!confirm("Are you sure you want to delete this promotion?")) return;

    try {
      await deletePromotion({ branchId, promotionId }).unwrap();
      toast.success("Promotion deleted");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete promotion");
    }
  };

  if (!branchId) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Please select a branch to manage Uber promotions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Uber Eats Promotions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage promotions on your Uber Eats store
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {canUseAllBranches && branchOptions.length > 0 && (
            <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {branchOptions.map((b: any) => (
                  <SelectItem key={b.branchId} value={b.branchId}>
                    {b.branchName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching || !branchId}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)} disabled={!branchId}>
            <Plus className="h-4 w-4 mr-1" />
            Create Promotion
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : promotions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Tag className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium">No promotions</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create a promotion to attract more customers on Uber Eats
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {promotions.map((promo, idx) => (
            <PromotionCard
              key={promo.promotionId ?? idx}
              promo={promo}
              onDelete={() => promo.promotionId && handleDelete(promo.promotionId)}
            />
          ))}
        </div>
      )}

      {/* Create Promotion Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Uber Promotion</DialogTitle>
            <DialogDescription>
              This will create a promotion directly on your Uber Eats store.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Promotion Type</Label>
              <Select
                value={form.promoType}
                onValueChange={(v) => setForm({ ...form, promoType: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROMO_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Title (optional)</Label>
              <Input
                value={form.title ?? ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Weekend Special 20% Off"
              />
            </div>

            {(form.promoType === "PERCENT_OFF") && (
              <div>
                <Label>Discount Percentage</Label>
                <Input
                  type="number"
                  value={form.discountPercentage ?? ""}
                  onChange={(e) => setForm({ ...form, discountPercentage: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="e.g. 20"
                  min={1}
                  max={100}
                />
              </div>
            )}

            {(form.promoType === "FLAT_OFF") && (
              <div>
                <Label>Discount Amount ($)</Label>
                <Input
                  type="number"
                  value={form.discountAmount ?? ""}
                  onChange={(e) => setForm({ ...form, discountAmount: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="e.g. 5.00"
                  min={0}
                  step={0.01}
                />
              </div>
            )}

            <div>
              <Label>Minimum Order Amount ($, optional)</Label>
              <Input
                type="number"
                value={form.minOrderAmount ?? ""}
                onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="e.g. 15.00"
                min={0}
                step={0.01}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Date (optional)</Label>
                <Input
                  type="datetime-local"
                  value={form.startDate ?? ""}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value || undefined })}
                />
              </div>
              <div>
                <Label>End Date (optional)</Label>
                <Input
                  type="datetime-local"
                  value={form.endDate ?? ""}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value || undefined })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Promotion"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PromotionCard({
  promo,
  onDelete,
}: {
  promo: UberPromotionResponse;
  onDelete: () => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-sm flex items-center gap-2">
              <Badge variant={promoTypeBadgeVariant(promo.promoType)}>
                {promoTypeLabel(promo.promoType)}
              </Badge>
              {promo.status && (
                <Badge variant={promo.status === "ACTIVE" ? "default" : "secondary"}>
                  {promo.status}
                </Badge>
              )}
            </CardTitle>
            {promo.title && <CardDescription>{promo.title}</CardDescription>}
          </div>
          <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {promo.discountPercentage != null && promo.discountPercentage > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Discount</span>
            <span className="font-medium">{promo.discountPercentage}% off</span>
          </div>
        )}
        {promo.discountAmount != null && promo.discountAmount > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Discount</span>
            <span className="font-medium">{formatMoney(promo.discountAmount)}</span>
          </div>
        )}
        {promo.minOrderAmount != null && promo.minOrderAmount > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Min Order</span>
            <span>{formatMoney(promo.minOrderAmount)}</span>
          </div>
        )}
        {promo.startDate && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Start</span>
            <span>{new Date(promo.startDate).toLocaleDateString()}</span>
          </div>
        )}
        {promo.endDate && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">End</span>
            <span>{new Date(promo.endDate).toLocaleDateString()}</span>
          </div>
        )}
        {promo.promotionId && (
          <div className="pt-1 border-t">
            <span className="font-mono text-xs text-muted-foreground truncate block">
              ID: {promo.promotionId}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
