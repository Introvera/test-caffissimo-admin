"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { useAppSelector } from "@/stores/store";
import { canManageProducts } from "@/lib/rbac";
import { 
  useGetProductByIdQuery, 
  useGetCategoriesQuery, 
  useUpdateProductMutation 
} from "@/stores/api/productApi";
import { UserRole, Category } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

interface ProductFormData {
  productName: string;
  productDescription: string;
  productCategoryId: string;
  productPrice: number;
  isVisible: boolean;
  isActive: boolean;
}

const productSchema = z.object({
  productName: z.string().min(2, "Name must be at least 2 characters"),
  productDescription: z.string().min(10, "Description must be at least 10 characters"),
  productCategoryId: z.string().min(1, "Please select a category"),
  productPrice: z.number().min(0, "Price must be positive"),
  isVisible: z.boolean(),
  isActive: z.boolean(),
});

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const currentRole = useAppSelector((state) => state.auth.user?.role) || UserRole.Cashier;
  
  const { data: product, isLoading: productLoading } = useGetProductByIdQuery(resolvedParams.id);
  const { data: categoriesData } = useGetCategoriesQuery();
  const categories = categoriesData?.items || [];
  
  const [updateProduct] = useUpdateProductMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    if (product) {
      reset({
        productName: product.productName,
        productDescription: product.productDescription || "",
        productCategoryId: product.productCategoryId,
        productPrice: product.productPrice,
        isVisible: product.isVisible,
        isActive: product.isActive,
      });
    }
  }, [product, reset]);

  const onSubmit = async (data: ProductFormData) => {
    try {
      await updateProduct({
        id: resolvedParams.id,
        data,
      }).unwrap();
      router.push("/admin/products");
    } catch (err) {
      console.error("Failed to update product:", err);
    }
  };

  const canEdit = canManageProducts(currentRole);

  if (productLoading) {
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

  if (!product) {
    return (
      <div className="space-y-6">
        <PageHeader title="Product Not Found" />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              The product you&apos;re looking for doesn&apos;t exist.
            </p>
            <Button onClick={() => router.push("/admin/products")} className="mt-4">
              Back to Products
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
          title={product.productName}
          description="Edit product details and pricing"
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
                <CardDescription>Core details of the product</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    {...register("productName")}
                    disabled={!canEdit}
                  />
                  {errors.productName && (
                    <p className="text-sm text-destructive">{errors.productName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productDescription">Description</Label>
                  <Textarea
                    id="productDescription"
                    rows={4}
                    {...register("productDescription")}
                    disabled={!canEdit}
                  />
                  {errors.productDescription && (
                    <p className="text-sm text-destructive">
                      {errors.productDescription.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={watch("productCategoryId")}
                      onValueChange={(value) => setValue("productCategoryId", value)}
                      disabled={!canEdit}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat: Category) => (
                          <SelectItem key={cat.productCategoryId} value={cat.productCategoryId}>
                            {cat.categoryName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productPrice">Base Price</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                      <Input
                        id="productPrice"
                        type="number"
                        step="0.01"
                        {...register("productPrice", { valueAsNumber: true })}
                        className="pl-7"
                        disabled={!canEdit}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Product Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video relative rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/30">
                  {product.posImage ? (
                    <img
                      src={product.posImage}
                      alt={product.productName}
                      className="h-full w-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="text-center">
                      <Package className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground">No image available</p>
                    </div>
                  )}
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
                    <Label>Visibility</Label>
                    <p className="text-xs text-muted-foreground">Visible on platforms</p>
                  </div>
                  <Switch
                    checked={watch("isVisible")}
                    onCheckedChange={(checked) => setValue("isVisible", checked)}
                    disabled={!canEdit}
                  />
                </div>
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

            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{product.productCategoryName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-medium text-primary">{formatCurrency(product.productPrice)}</span>
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
