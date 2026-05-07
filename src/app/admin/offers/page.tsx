"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  Plus,
  Tag,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { useAppSelector } from "@/stores/store";
import { useGetOffersQuery, useCreateOfferMutation } from "@/stores/api/offerApi";
import { useGetBranchesQuery } from "@/stores/api/branchApi";
import { useGetProductsQuery } from "@/stores/api/productApi";
import { canManageOffers } from "@/lib/rbac";
import { CreateOfferRequest, OfferType } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

const OFFER_TYPE_LABELS: Record<OfferType, string> = {
  FlatDiscount: "Flat Discount",
  PercentageDiscount: "Percentage Discount",
  BuyXGetY: "Buy X Get Y",
  FreeItem: "Free Item",
};

const OFFER_TYPE_COLORS: Record<OfferType, string> = {
  FlatDiscount: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  PercentageDiscount: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  BuyXGetY: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  FreeItem: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
};

const DEFAULT_FORM: CreateOfferRequest = {
  offerName: "",
  description: "",
  offerType: "FlatDiscount",
  startDateTime: "",
  endDateTime: "",
  isActive: true,
  buyAmount: undefined,
  getAmount: undefined,
  branchIds: [],
  items: [],
};

export default function OffersPage() {
  const currentRole = useAppSelector((state) => state.auth.user?.role);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CreateOfferRequest>(DEFAULT_FORM);

  const PAGE_SIZE = 10;

  const { data, isLoading } = useGetOffersQuery({ page, pageSize: PAGE_SIZE });
  const { data: branchesData } = useGetBranchesQuery();
  const { data: productsData } = useGetProductsQuery({ pageSize: 100 });
  const [createOffer, { isLoading: isCreating }] = useCreateOfferMutation();

  const canManage = canManageOffers(currentRole);
  const offers = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handleCreate = async () => {
    if (!form.offerName || !form.startDateTime || !form.endDateTime) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await createOffer(form).unwrap();
      toast.success("Offer created successfully");
      setDialogOpen(false);
      setForm(DEFAULT_FORM);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create offer");
    }
  };

  const toggleBranch = (branchId: string) => {
    setForm((f) => ({
      ...f,
      branchIds: f.branchIds.includes(branchId)
        ? f.branchIds.filter((id) => id !== branchId)
        : [...f.branchIds, branchId],
    }));
  };

  const toggleProduct = (productId: string) => {
    setForm((f) => ({
      ...f,
      items: f.items.includes(productId)
        ? f.items.filter((id) => id !== productId)
        : [...f.items, productId],
    }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Offers"
        description="Manage promotional offers and discounts"
        actions={
          canManage ? (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Offer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Offer</DialogTitle>
                  <DialogDescription>
                    Define a new promotional offer for your branches.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="offer-name">Offer Name *</Label>
                    <Input
                      id="offer-name"
                      placeholder="e.g. Summer Sale 20%"
                      value={form.offerName}
                      onChange={(e) => setForm((f) => ({ ...f, offerName: e.target.value }))}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="offer-desc">Description</Label>
                    <Textarea
                      id="offer-desc"
                      placeholder="Optional description..."
                      rows={2}
                      value={form.description ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    />
                  </div>

                  {/* Offer Type */}
                  <div className="space-y-2">
                    <Label>Offer Type *</Label>
                    <Select
                      value={form.offerType}
                      onValueChange={(v) => setForm((f) => ({ ...f, offerType: v as OfferType }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(OFFER_TYPE_LABELS) as OfferType[]).map((type) => (
                          <SelectItem key={type} value={type}>
                            {OFFER_TYPE_LABELS[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Buy/Get amounts for BuyXGetY */}
                  {form.offerType === "BuyXGetY" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="buy-amount">Buy Amount</Label>
                        <Input
                          id="buy-amount"
                          type="number"
                          min={1}
                          placeholder="e.g. 2"
                          value={form.buyAmount ?? ""}
                          onChange={(e) => setForm((f) => ({ ...f, buyAmount: parseInt(e.target.value) || undefined }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="get-amount">Get Amount</Label>
                        <Input
                          id="get-amount"
                          type="number"
                          min={1}
                          placeholder="e.g. 1"
                          value={form.getAmount ?? ""}
                          onChange={(e) => setForm((f) => ({ ...f, getAmount: parseInt(e.target.value) || undefined }))}
                        />
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date *</Label>
                      <Input
                        id="start-date"
                        type="datetime-local"
                        value={form.startDateTime}
                        onChange={(e) => setForm((f) => ({ ...f, startDateTime: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date">End Date *</Label>
                      <Input
                        id="end-date"
                        type="datetime-local"
                        value={form.endDateTime}
                        onChange={(e) => setForm((f) => ({ ...f, endDateTime: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Active toggle */}
                  <div className="flex items-center justify-between">
                    <Label>Active immediately</Label>
                    <Switch
                      checked={form.isActive}
                      onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
                    />
                  </div>

                  {/* Branch selection */}
                  {branchesData?.items && branchesData.items.length > 0 && (
                    <div className="space-y-2">
                      <Label>Apply to Branches</Label>
                      <div className="flex flex-wrap gap-2">
                        {branchesData.items.map((branch) => {
                          const selected = form.branchIds.includes(branch.branchId);
                          return (
                            <button
                              key={branch.branchId}
                              type="button"
                              onClick={() => toggleBranch(branch.branchId)}
                              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                                selected
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-background text-foreground border-border hover:bg-muted"
                              }`}
                            >
                              {branch.branchName.replace("Caffissimo", "").trim()}
                            </button>
                          );
                        })}
                      </div>
                      {form.branchIds.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          No branches selected — offer will apply globally.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Product selection */}
                  {productsData?.items && productsData.items.length > 0 && (
                    <div className="space-y-2">
                      <Label>Apply to Products</Label>
                      <div className="flex flex-wrap gap-2">
                        {productsData.items.map((product) => {
                          const selected = form.items.includes(product.productId);
                          return (
                            <button
                              key={product.productId}
                              type="button"
                              onClick={() => toggleProduct(product.productId)}
                              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                                selected
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-background text-foreground border-border hover:bg-muted"
                              }`}
                            >
                              {product.productName}
                            </button>
                          );
                        })}
                      </div>
                      {form.items.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          No products selected — offer will apply to all products.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={isCreating || !form.offerName || !form.startDateTime || !form.endDateTime}
                  >
                    {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Offer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      {/* Offer Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : offers.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={Tag}
              title="No offers yet"
              description="Create your first promotional offer to get started"
              action={
                canManage ? (
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Offer
                  </Button>
                ) : undefined
              }
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => {
              const isExpired = new Date(offer.endDateTime) < new Date();
              return (
                <Card key={offer.offerId} className="flex flex-col">
                  <CardContent className="p-5 flex flex-col gap-3 flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{offer.offerName}</p>
                        {offer.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {offer.description}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${OFFER_TYPE_COLORS[offer.offerType]}`}>
                          {OFFER_TYPE_LABELS[offer.offerType]}
                        </span>
                        <Badge
                          variant={offer.isActive && !isExpired ? "default" : "outline"}
                          className="text-[10px]"
                        >
                          {isExpired ? "Expired" : offer.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {format(parseISO(offer.startDateTime), "MMM d")}
                        {" – "}
                        {format(parseISO(offer.endDateTime), "MMM d, yyyy")}
                      </span>
                    </div>

                    {/* Buy/Get */}
                    {offer.offerType === "BuyXGetY" && offer.buyAmount && offer.getAmount && (
                      <div className="text-xs text-muted-foreground">
                        Buy <span className="font-semibold text-foreground">{offer.buyAmount}</span>
                        {" "}get{" "}
                        <span className="font-semibold text-foreground">{offer.getAmount}</span> free
                      </div>
                    )}

                    {/* Branches */}
                    {offer.offerBranches.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {offer.offerBranches.length} branch{offer.offerBranches.length !== 1 ? "es" : ""}
                      </p>
                    )}

                    {/* Note: Edit/Delete not available until backend adds PUT/DELETE /api/offers/{id} */}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline" size="sm" className="h-8 w-8 p-0"
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline" size="sm" className="h-8 w-8 p-0"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
