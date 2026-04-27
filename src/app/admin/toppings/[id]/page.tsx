"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppSelector } from "@/stores/store";
import { canManageProducts } from "@/lib/rbac";
import { 
  useGetToppingByIdQuery,
  useGetToppingCategoriesQuery, 
  useUpdateToppingMutation 
} from "@/stores/api/toppingApi";
import { UserRole, ToppingCategory } from "@/types";

interface ToppingFormData {
  toppingName: string;
  toppingCategoryId: string;
  price: number;
  isActive: boolean;
}

const toppingSchema = z.object({
  toppingName: z.string().min(2, "Name must be at least 2 characters"),
  toppingCategoryId: z.string().min(1, "Please select a category"),
  price: z.number().min(0, "Price must be positive"),
  isActive: z.boolean(),
});

interface ToppingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ToppingDetailPage({ params }: ToppingDetailPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const currentRole = useAppSelector((state) => state.auth.user?.role) || UserRole.Cashier;
  
  const { data: topping, isLoading: toppingLoading } = useGetToppingByIdQuery(resolvedParams.id);
  const { data: categoriesData } = useGetToppingCategoriesQuery();
  const categories = categoriesData?.items || [];
  
  const [updateTopping] = useUpdateToppingMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<ToppingFormData>({
    resolver: zodResolver(toppingSchema),
  });

  useEffect(() => {
    if (topping) {
      reset({
        toppingName: topping.toppingName,
        toppingCategoryId: topping.toppingCategoryId,
        price: topping.price,
        isActive: topping.isActive,
      });
    }
  }, [topping, reset]);

  const onSubmit = async (data: ToppingFormData) => {
    try {
      await updateTopping({
        id: resolvedParams.id,
        data,
      }).unwrap();
      router.push("/admin/toppings");
    } catch (err) {
      console.error("Failed to update topping:", err);
    }
  };

  const canEdit = canManageProducts(currentRole);

  if (toppingLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
          <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!topping) {
    return (
      <div className="space-y-6">
        <PageHeader title="Topping Not Found" />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              The topping you're looking for doesn't exist.
            </p>
            <Button onClick={() => router.push("/admin/toppings")} className="mt-4">
              Back to Toppings
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
          title={topping.toppingName}
          description="Edit topping details"
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Topping Information</CardTitle>
                <CardDescription>Core details of the topping</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="toppingName">Topping Name</Label>
                  <Input
                    id="toppingName"
                    {...register("toppingName")}
                    disabled={!canEdit}
                  />
                  {errors.toppingName && (
                    <p className="text-sm text-destructive">{errors.toppingName.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={watch("toppingCategoryId")}
                      onValueChange={(value) => setValue("toppingCategoryId", value)}
                      disabled={!canEdit}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat: ToppingCategory) => (
                          <SelectItem key={cat.toppingCategoryId} value={cat.toppingCategoryId}>
                            {cat.categoryName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.toppingCategoryId && (
                      <p className="text-sm text-destructive">{errors.toppingCategoryId.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Base Price</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        {...register("price", { valueAsNumber: true })}
                        className="pl-7"
                        disabled={!canEdit}
                      />
                    </div>
                    {errors.price && (
                      <p className="text-sm text-destructive">{errors.price.message}</p>
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
                    <Label>Active Status</Label>
                    <p className="text-xs text-muted-foreground">Overall availability</p>
                  </div>
                  <Switch
                    checked={watch("isActive")}
                    onCheckedChange={(checked) => setValue("isActive", checked)}
                    disabled={!canEdit}
                  />
                </div>
              </CardContent>
            </Card>

            {canEdit && (
              <Card>
                <CardContent className="pt-6">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
