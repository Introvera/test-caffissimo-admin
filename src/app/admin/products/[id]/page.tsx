"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Upload, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useAppStore, canManageProducts } from "@/stores/app-store";
import { products, categories, branches, branchProducts } from "@/data/seed";

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  tags: z.string(),
  tastingNotes: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { currentRole } = useAppStore();

  const product = products.find((p) => p.id === resolvedParams.id);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      categoryId: product?.categoryId || "",
      tags: product?.tags.join(", ") || "",
      tastingNotes: product?.tastingNotes || "",
    },
  });

  if (!product) {
    return (
      <div className="space-y-6">
        <PageHeader title="Product Not Found" />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              The product you're looking for doesn't exist.
            </p>
            <Button onClick={() => router.push("/admin/products")} className="mt-4">
              Back to Products
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSubmit = async (data: ProductFormData) => {
    console.log("Updating product:", data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push("/admin/products");
  };

  const canEdit = canManageProducts(currentRole);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title={product.name}
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
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    disabled={!canEdit}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    {...register("description")}
                    disabled={!canEdit}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={watch("categoryId")}
                    onValueChange={(value) => setValue("categoryId", value)}
                    disabled={!canEdit}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
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
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    {...register("tags")}
                    disabled={!canEdit}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tastingNotes">Tasting Notes</Label>
                  <Textarea
                    id="tastingNotes"
                    rows={2}
                    {...register("tastingNotes")}
                    disabled={!canEdit}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Drag and drop images here, or click to browse
                  </p>
                  {canEdit && (
                    <Button variant="outline" className="mt-4">
                      Upload Images
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Pricing */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Branch Pricing & Availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {branches.map((branch) => {
                  const bp = branchProducts.find(
                    (b) => b.productId === product.id && b.branchId === branch.id
                  );
                  return (
                    <div key={branch.id} className="space-y-3 pb-4 border-b last:border-0">
                      <Label className="font-medium">
                        {branch.name.replace("Caffissimo", "").trim()}
                      </Label>
                      <div className="space-y-2">
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground">
                            $
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            defaultValue={bp?.price.toFixed(2)}
                            className="pl-7"
                            disabled={!canEdit}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-normal">In Stock</Label>
                          <Switch defaultChecked={bp?.isAvailable} disabled={!canEdit} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-normal">Visible</Label>
                          <Switch defaultChecked={bp?.isVisible} disabled={!canEdit} />
                        </div>
                      </div>
                    </div>
                  );
                })}
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
