"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Database,
  Link2,
  Loader2,
  RadioTower,
  Send,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { canAccessAdmin, canAccessAllBranches } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import { useGetBranchesQuery } from "@/stores/api/branchApi";
import { useSendUberOrderWebhookEventMutation } from "@/stores/api/uberApi";
import { useAppSelector } from "@/stores/store";
import { UserRole } from "@/types";

function getApiErrorMessage(error: unknown) {
  const candidate = error as {
    data?: { message?: string } | string;
    error?: string;
  };

  if (typeof candidate.data === "string") return candidate.data;
  if (candidate.data?.message) return candidate.data.message;
  if (candidate.error) return candidate.error;
  if (error instanceof Error) return error.message;
  return "Request failed.";
}

const SAMPLE_PAYLOAD = `{
  "event_id": "test-webhook-event-001",
  "event_type": "orders.notification",
  "meta": {
    "store_id": "replace-with-uber-store-id"
  },
  "resource_href": "https://test-api.uber.com/v2/eats/order/replace-with-order-id",
  "resource_id": "replace-with-order-id"
}`;

export default function UberEatsOrdersPage() {
  const currentRole =
    useAppSelector((state) => state.auth.user?.role) || UserRole.Cashier;
  const assignedBranchId =
    useAppSelector((state) => state.auth.user?.branchId) || null;

  const canUseUberTools = canAccessAdmin(currentRole);
  const canUseAllBranches = canAccessAllBranches(currentRole);

  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [connectionKey, setConnectionKey] = useState("");
  const [payloadText, setPayloadText] = useState(SAMPLE_PAYLOAD);
  const [notice, setNotice] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);
  const [lastResult, setLastResult] = useState<{
    statusCode: number;
    body: unknown;
    at: string;
  } | null>(null);

  const { data: branchesData, isLoading: branchesLoading } = useGetBranchesQuery({
    page: 1,
    pageSize: 100,
  });
  const [sendWebhook, { isLoading: sendingWebhook }] =
    useSendUberOrderWebhookEventMutation();

  const branchOptions = useMemo(() => {
    const branches = branchesData?.items ?? [];
    if (canUseAllBranches) return branches;
    if (!assignedBranchId) return [];
    return branches.filter((branch) => branch.branchId === assignedBranchId);
  }, [assignedBranchId, branchesData?.items, canUseAllBranches]);

  const selectedBranch = branchOptions.find(
    (branch) => branch.branchId === selectedBranchId,
  );
  const uberConnection = selectedBranch?.platformConnections?.find(
    (connection) => connection.platformCode === "UberEats" && connection.isActive,
  );

  const webhookUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/uber-eats/webhooks/orders`;
  const resolvedConnectionKey = connectionKey.trim() || uberConnection?.webhookConnectionKey || "";

  const onCopyWebhookUrl = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setNotice({ kind: "success", message: "Webhook URL copied." });
    } catch {
      setNotice({ kind: "error", message: "Failed to copy webhook URL." });
    }
  };

  const onSendTestWebhook = async () => {
    let payload: Record<string, unknown>;
    try {
      const parsed = JSON.parse(payloadText) as unknown;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        setNotice({
          kind: "error",
          message: "Payload must be a JSON object.",
        });
        return;
      }
      payload = parsed as Record<string, unknown>;
    } catch {
      setNotice({
        kind: "error",
        message: "Payload is not valid JSON.",
      });
      return;
    }

    try {
      const response = await sendWebhook({
        payload,
        connectionKey: resolvedConnectionKey || undefined,
      }).unwrap();

      setLastResult({
        statusCode: 200,
        body: response,
        at: new Date().toISOString(),
      });
      setNotice({
        kind: "success",
        message: "Webhook accepted by backend.",
      });
    } catch (error) {
      setLastResult({
        statusCode: 400,
        body: { error: getApiErrorMessage(error) },
        at: new Date().toISOString(),
      });
      setNotice({
        kind: "error",
        message: getApiErrorMessage(error),
      });
    }
  };

  if (!canUseUberTools) {
    return (
      <div className="space-y-6">
        <PageHeader title="Uber Eats Orders" />
        <Card>
          <CardContent className="p-10">
            <div className="flex items-center gap-3 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <p className="font-medium">
                You don&apos;t have permission to view Uber Eats order tools.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Uber Eats Orders"
        description="Webhook intake and staging foundation for multi-branch Uber Eats tracking"
      />

      {notice ? (
        <div
          className={cn(
            "flex items-start gap-2 rounded-lg border px-4 py-3 text-sm",
            notice.kind === "success"
              ? "border-[#10b981]/30 bg-[#10b981]/10 text-[#0d9668]"
              : "border-destructive/30 bg-destructive/10 text-destructive",
          )}
        >
          {notice.kind === "success" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <p>{notice.message}</p>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Endpoint</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
              <RadioTower className="h-4 w-4" />
              `POST /api/uber-eats/webhooks/orders`
            </div>
            <div className="rounded-md border bg-muted/30 p-2 text-xs break-all">
              {webhookUrl}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={onCopyWebhookUrl}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy URL
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Branch Resolution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span>Via `ExternalStoreId` from payload first</span>
            </div>
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-muted-foreground" />
              <span>Fallback via `?connectionKey=` query</span>
            </div>
            <Badge variant="secondary">Single endpoint for all branches</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Current Scope</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Webhook intake and staging are active.</p>
            <p>POS sync automation is intentionally not enabled yet.</p>
            <p>DoorDash onboarding is planned for a later phase.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Send Test Webhook</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Branch (optional)</Label>
              <Select
                value={selectedBranchId}
                onValueChange={setSelectedBranchId}
                disabled={branchesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select branch to auto-fill connection key" />
                </SelectTrigger>
                <SelectContent>
                  {branchOptions.map((branch) => (
                    <SelectItem key={branch.branchId} value={branch.branchId}>
                      {branch.branchName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Connection Key (optional)</Label>
              <Input
                value={connectionKey}
                onChange={(event) => setConnectionKey(event.target.value)}
                placeholder={uberConnection?.webhookConnectionKey || "connection key"}
              />
              <p className="text-xs text-muted-foreground">
                Active branch key: {uberConnection?.webhookConnectionKey || "Not configured"}
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Webhook Payload (JSON)</Label>
            <Textarea
              rows={12}
              value={payloadText}
              onChange={(event) => setPayloadText(event.target.value)}
              className="font-mono text-xs"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={onSendTestWebhook}
              disabled={sendingWebhook}
            >
              {sendingWebhook ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Send to Webhook Endpoint
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Last Response</CardTitle>
        </CardHeader>
        <CardContent>
          {!lastResult ? (
            <p className="text-sm text-muted-foreground">
              No test webhook sent in this session.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={lastResult.statusCode < 300 ? "success" : "destructive"}>
                  HTTP {lastResult.statusCode}
                </Badge>
                <span className="text-xs text-muted-foreground">{lastResult.at}</span>
              </div>
              <pre className="max-h-[280px] overflow-auto rounded-md border bg-muted/30 p-3 text-xs">
                {JSON.stringify(lastResult.body, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

