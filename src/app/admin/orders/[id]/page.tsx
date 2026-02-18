"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  Package,
  Store,
  FileText,
  CircleCheck,
  CircleDot,
  Circle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SourceBadge } from "@/components/shared/source-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAppStore, canCancelOrders } from "@/stores/app-store";
import { orders, branches } from "@/data/seed";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const STATUS_STEPS = ["pending", "confirmed", "preparing", "ready", "completed"] as const;

function getStatusIndex(status: string) {
  if (status === "cancelled") return -1;
  return STATUS_STEPS.indexOf(status as (typeof STATUS_STEPS)[number]);
}

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { currentRole } = useAppStore();

  const order = orders.find((o) => o.id === resolvedParams.id);
  const branch = branches.find((b) => b.id === order?.branchId);

  if (!order) {
    return (
      <div className="text-center py-20">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The order you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button asChild>
          <Link href="/admin/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  const canCancel = canCancelOrders(currentRole) && order.status !== "cancelled" && order.status !== "completed";
  const currentStepIndex = getStatusIndex(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold">{order.orderNumber}</h1>
              <SourceBadge source={order.source} />
              <StatusBadge status={order.status} />
            </div>
          </div>
        </div>
        {canCancel && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">Cancel Order</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. The customer will be notified if they have an email on file.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Order</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Cancel Order
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {order.isReadOnly && (
        <div className="flex items-center gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
          <span className="text-sm text-amber-700 dark:text-amber-400">
            This is an external order and cannot be edited
          </span>
        </div>
      )}

      {/* Order Progress */}
      {!isCancelled && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isLast = index === STATUS_STEPS.length - 1;
                const historyEntry = order.statusHistory.find((h) => h.status === step);

                return (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                        isCurrent
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                          : isCompleted
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {isCompleted ? (
                          <CircleCheck className="h-4 w-4" />
                        ) : isCurrent ? (
                          <CircleDot className="h-4 w-4" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                      </div>
                      <span className={`text-xs font-medium capitalize ${
                        isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"
                      }`}>
                        {step}
                      </span>
                      {historyEntry ? (
                        <span className="text-[10px] text-muted-foreground">
                          {formatDateTime(historyEntry.timestamp)}
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/0">—</span>
                      )}
                    </div>
                    {!isLast && (
                      <div className={`flex-1 h-0.5 mx-3 rounded-full mb-10 ${
                        index < currentStepIndex ? "bg-primary" : "bg-muted"
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {isCancelled && (
        <Card className="border-red-200 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="font-medium text-red-700 dark:text-red-400">Order Cancelled</p>
                <p className="text-sm text-red-600/70 dark:text-red-400/70">
                  This order was cancelled on {formatDateTime(order.updatedAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardContent className="p-0">
              {/* Items header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
                <h3 className="font-semibold">Order Items</h3>
                <span className="text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-1">
                  {order.items.length} {order.items.length === 1 ? "item" : "items"}
                </span>
              </div>

              {/* Items table */}
              <div className="px-6">
                <div className="grid grid-cols-[1fr_auto_auto] gap-x-6 py-3 text-xs text-muted-foreground border-b border-border/40">
                  <span>Product</span>
                  <span>Qty</span>
                  <span className="text-right">Price</span>
                </div>
                {order.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1fr_auto_auto] gap-x-6 items-center py-3.5 border-b border-border/40 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 text-xs font-medium text-muted-foreground">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(item.unitPrice)} each</p>
                      </div>
                    </div>
                    <span className="text-sm tabular-nums w-8 text-center">{item.quantity}</span>
                    <span className="text-sm font-medium tabular-nums text-right">{formatCurrency(item.totalPrice)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="px-6 py-4 bg-muted/30 rounded-b-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="tabular-nums">{formatCurrency(order.tax)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600">Discount</span>
                    <span className="text-emerald-600 tabular-nums">-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-border/60">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg tabular-nums">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Details */}
          <Card>
            <CardContent className="p-0">
              <div className="px-5 py-4 border-b border-border/60">
                <h3 className="font-semibold text-sm">Details</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Source</span>
                  <SourceBadge source={order.source} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <StatusBadge status={order.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Payment</span>
                  <span className="text-sm font-medium capitalize">{order.paymentMethod.replace("_", " ")}</span>
                </div>
                {order.externalOrderId && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">External ID</span>
                    <span className="text-sm font-medium font-mono">{order.externalOrderId}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Branch */}
          <Card>
            <CardContent className="p-0">
              <div className="px-5 py-4 border-b border-border/60">
                <h3 className="font-semibold text-sm">Branch</h3>
              </div>
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0">
                    <Store className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{branch?.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{branch?.address}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>



          {/* Customer Notes */}
          {order.notes && (
            <Card>
              <CardContent className="p-0">
                <div className="px-5 py-4 border-b border-border/60">
                  <h3 className="font-semibold text-sm">Customer Notes</h3>
                </div>
                <div className="p-5">
                  <p className="text-sm text-muted-foreground leading-relaxed">{order.notes}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
