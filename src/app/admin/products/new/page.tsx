"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Upload, Plus, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/shared/page-header";
import { useAppSelector } from "@/stores/store";
import { isSuperAdmin } from "@/lib/rbac";
import { useGetCategoriesQuery, useCreateProductMutation } from "@/stores/api/productApi";
import { useGetBranchesQuery } from "@/stores/api/branchApi";
import { useCreateBranchProductMutation } from "@/stores/api/branchProductApi";
import { useGetToppingsQuery, useCreateProductToppingMutation } from "@/stores/api/toppingApi";
import { Category, Branch, UserRole } from "@/types";
import { toast } from "sonner";

// We remove tags and tastingNotes
const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  categoryId: z.string().min(1, "Please select a category"),
});

type ProductFormData = z.infer<typeof productSchema>;

type VariantConfig = {
  id: string;
  variantName: string;
  price: number;
  isAvailable: boolean;
};

type BranchConfig = {
  branchId: string;
  isActive: boolean;
  overridePosImage: File | null;
  overrideEcomImages: File[];
  variants: VariantConfig[];
};

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function ImageUploader({ 
  multiple = false, 
  value, 
  onChange 
}: { 
  multiple?: boolean, 
  value: File | File[] | null, 
  onChange: (files: File | File[] | null) => void 
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    if (multiple) {
      onChange([...(Array.isArray(value) ? value : []), ...files]);
    } else {
      onChange(files[0]); // Only take the first one for single
    }
  };

  const removeFile = (e: React.MouseEvent, index?: number) => {
    e.stopPropagation();
    if (multiple && Array.isArray(value)) {
      const newValue = [...value];
      newValue.splice(index!, 1);
      onChange(newValue);
    } else {
      onChange(null);
    }
  };

  return (
    <div 
      className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        hidden 
        ref={fileInputRef} 
        multiple={multiple} 
        accept="image/*"
        onChange={(e) => handleFiles(Array.from(e.target.files || []))}
      />
      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
      <p className="text-sm text-muted-foreground">
        Drag and drop {multiple ? "images" : "an image"} here, or click to browse
      </p>
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {Array.isArray(value) ? value.map((f, i) => (
          <Badge key={i} variant="secondary" className="flex items-center gap-1">
            {f.name}
            <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={(e) => removeFile(e, i)} />
          </Badge>
        )) : value ? (
          <Badge variant="secondary" className="flex items-center gap-1">
            {value.name}
            <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={(e) => removeFile(e)} />
          </Badge>
        ) : null}
      </div>
    </div>
  );
}

export default function NewProductPage() {
  const currentRole = useAppSelector((state) => state.auth.user?.role);
  const assignedBranchId = useAppSelector((state) => state.auth.user?.branchId);
  const isSuper = isSuperAdmin(currentRole as UserRole);

  const router = useRouter();
  const { data: categoriesData } = useGetCategoriesQuery();
  const categories = categoriesData?.items || [];
  
  const { data: branchesData } = useGetBranchesQuery();
  const branches = branchesData?.items || [];
  
  const { data: toppingsData } = useGetToppingsQuery();
  const allToppings = toppingsData?.items || [];

  const [createProduct] = useCreateProductMutation();
  const [createBranchProduct] = useCreateBranchProductMutation();
  const [createProductTopping] = useCreateProductToppingMutation();

  const [activeTab, setActiveTab] = useState("base");
  const [branchConfigs, setBranchConfigs] = useState<BranchConfig[]>([]);
  const [activeVariantTabs, setActiveVariantTabs] = useState<Record<string, string>>({});
  const [selectedToppingIds, setSelectedToppingIds] = useState<string[]>([]);

  const [basePosImage, setBasePosImage] = useState<File | null>(null);
  const [baseEcomImages, setBaseEcomImages] = useState<File[]>([]);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  useEffect(() => {
    if (!isSuper && assignedBranchId && branchConfigs.length === 0) {
      const variantId = generateId();
      setBranchConfigs([{
        branchId: assignedBranchId,
        isActive: true,
        overridePosImage: null,
        overrideEcomImages: [],
        variants: [{ id: variantId, variantName: "Normal", price: 0, isAvailable: true }]
      }]);
      setActiveVariantTabs({ [assignedBranchId]: variantId });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuper, assignedBranchId]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
    },
  });

  const addBranchConfig = (branchId: string) => {
    const variantId = generateId();
    setBranchConfigs(prev => [
      ...prev,
      {
        branchId,
        isActive: true,
        overridePosImage: null,
        overrideEcomImages: [],
        variants: [{ id: variantId, variantName: "Normal", price: 0, isAvailable: true }]
      }
    ]);
    setActiveVariantTabs(prev => ({ ...prev, [branchId]: variantId }));
    setActiveTab(`branch-${branchId}`);
  };

  const removeBranchConfig = (branchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBranchConfigs(prev => prev.filter(b => b.branchId !== branchId));
    if (activeTab === `branch-${branchId}`) {
      setActiveTab("base");
    }
  };

  const updateBranchConfig = (branchId: string, updates: Partial<BranchConfig>) => {
    setBranchConfigs(prev => prev.map(b => b.branchId === branchId ? { ...b, ...updates } : b));
  };

  const addVariant = (branchId: string) => {
    const branch = branchConfigs.find(b => b.branchId === branchId);
    if (!branch) return;
    const newVariantId = generateId();
    const newVariants = [...branch.variants, { id: newVariantId, variantName: "New Size", price: 0, isAvailable: true }];
    updateBranchConfig(branchId, { variants: newVariants });
    setActiveVariantTabs(prev => ({ ...prev, [branchId]: newVariantId }));
  };

  const updateVariant = (branchId: string, variantId: string, updates: Partial<VariantConfig>) => {
    const branch = branchConfigs.find(b => b.branchId === branchId);
    if (!branch) return;
    const newVariants = branch.variants.map(v => v.id === variantId ? { ...v, ...updates } : v);
    updateBranchConfig(branchId, { variants: newVariants });
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmittingForm(true);
    try {
      // 1. Create Base Product
      // Note: We might need to upload images to a storage service first and get URLs.
      // Assuming for now the API handles multipart/form-data or we just pass null strings for dummy.
      // In a real app, upload basePosImage and baseEcomImages, then pass URLs.
      const newProduct = await createProduct({
        productName: data.name,
        productDescription: data.description,
        productCategoryId: data.categoryId,
        productPrice: 0, // Base price could be 0, or derived from variants
        isVisible: true,
        isActive: true,
        // posImage: basePosImageUrl,
        // ecomImages: baseEcomImagesUrls.join(','),
      }).unwrap();

      const productId = newProduct.productId;

      // Create Toppings
      if (selectedToppingIds.length > 0) {
        const toppingPromises = selectedToppingIds.map(tId => 
          createProductTopping({
            productId: productId,
            toppingId: tId,
            isActive: true
          }).unwrap()
        );
        await Promise.all(toppingPromises);
      }

      // 2. Create Branch Products
      if (branchConfigs.length > 0) {
        const promises = branchConfigs.map(branchConf => {
          return createBranchProduct({
            branchId: branchConf.branchId,
            productId: productId,
            isAvailable: branchConf.isActive,
            // overridePosImage: branchConf.overridePosImage ? [branchConf.overridePosImage.name] : [],
            // overrideEcomImages: branchConf.overrideEcomImages.map(f => f.name),
            variants: branchConf.variants.map(v => ({
              variantName: v.variantName,
              price: Number(v.price),
              isAvailable: v.isAvailable
            }))
          }).unwrap();
        });

        await Promise.all(promises);
      }

      toast.success("Product created successfully");
      router.push("/admin/products");
    } catch (err) {
      console.error("Failed to create product:", err);
      toast.error("Failed to create product. Check console for details.");
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const unconfiguredBranches = branches.filter(b => !branchConfigs.find(c => c.branchId === b.branchId));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title="New Product"
          description="Add a new product to your catalog"
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center border-b pb-2 mb-4">
            <TabsList className="bg-transparent h-auto p-0 justify-start">
              <TabsTrigger 
                value="base" 
                className="data-[state=active]:bg-muted/50 rounded-none border-b-2 border-transparent data-[state=active]:border-primary pb-2"
              >
                Base
              </TabsTrigger>
              {branchConfigs.map(config => {
                const b = branches.find(br => br.branchId === config.branchId);
                return (
                  <TabsTrigger 
                    key={config.branchId} 
                    value={`branch-${config.branchId}`}
                    className="data-[state=active]:bg-muted/50 rounded-none border-b-2 border-transparent data-[state=active]:border-primary pb-2 flex items-center gap-2"
                  >
                    {b?.branchName.replace("Caffissimo", "").trim() || "Branch"}
                    {isSuper && <X className="h-3 w-3 hover:text-destructive z-10" onClick={(e) => removeBranchConfig(config.branchId, e)} />}
                  </TabsTrigger>
                );
              })}
            </TabsList>
            
            {isSuper && unconfiguredBranches.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="ml-2 h-8">
                    <Plus className="h-4 w-4 mr-2" />
                    Add a branch variant
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {unconfiguredBranches.map(b => (
                    <DropdownMenuItem key={b.branchId} onClick={() => addBranchConfig(b.branchId)}>
                      {b.branchName.replace("Caffissimo", "").trim()}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <TabsContent value="base" className="mt-0">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Product Information</CardTitle>
                  <CardDescription>
                    Basic details about the product
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Caramel Macchiato"
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message as string}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the product..."
                      rows={4}
                      {...register("description")}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">
                        {errors.description.message as string}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={watch("categoryId")}
                      onValueChange={(value) => setValue("categoryId", value)}
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
                    {errors.categoryId && (
                      <p className="text-sm text-destructive">
                        {errors.categoryId.message as string}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    Toppings
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" disabled={allToppings.length === selectedToppingIds.length}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Topping
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {allToppings.filter(t => !selectedToppingIds.includes(t.toppingId)).map(t => (
                          <DropdownMenuItem key={t.toppingId} onClick={() => setSelectedToppingIds(prev => [...prev, t.toppingId])}>
                            {t.toppingName}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardTitle>
                  <CardDescription>Select which toppings can be added to this product</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedToppingIds.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No toppings assigned.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedToppingIds.map(id => {
                        const topping = allToppings.find(t => t.toppingId === id);
                        if (!topping) return null;
                        return (
                          <Badge key={id} variant="secondary" className="flex items-center gap-1 text-sm py-1 px-3">
                            {topping.toppingName}
                            <X className="h-3 w-3 cursor-pointer hover:text-destructive ml-1" onClick={() => setSelectedToppingIds(prev => prev.filter(tid => tid !== id))} />
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Images</CardTitle>
                  <CardDescription>
                    Upload base product images
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>POS Image (Single)</Label>
                    <ImageUploader 
                      multiple={false} 
                      value={basePosImage} 
                      onChange={(val) => setBasePosImage(val as File | null)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ecommerce Images (Multiple)</Label>
                    <ImageUploader 
                      multiple={true} 
                      value={baseEcomImages} 
                      onChange={(val) => setBaseEcomImages(val as File[])} 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {branchConfigs.map(branchConf => (
            <TabsContent key={branchConf.branchId} value={`branch-${branchConf.branchId}`} className="mt-0">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        Branch Settings
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-normal">Active</Label>
                          <Switch 
                            checked={branchConf.isActive} 
                            onCheckedChange={(val) => updateBranchConfig(branchConf.branchId, { isActive: val })} 
                          />
                        </div>
                      </CardTitle>
                      <CardDescription>
                        Visibility and overrides for this branch
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Override POS Image (Single)</Label>
                        <ImageUploader 
                          multiple={false} 
                          value={branchConf.overridePosImage} 
                          onChange={(val) => updateBranchConfig(branchConf.branchId, { overridePosImage: val as File | null })} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Override Ecommerce Images (Multiple)</Label>
                        <ImageUploader 
                          multiple={true} 
                          value={branchConf.overrideEcomImages} 
                          onChange={(val) => updateBranchConfig(branchConf.branchId, { overrideEcomImages: val as File[] })} 
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader className="flex flex-row justify-between items-center pb-2">
                      <div>
                        <CardTitle>Branch Variants</CardTitle>
                        <CardDescription>Configure sizes and prices</CardDescription>
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={() => addVariant(branchConf.branchId)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Variant
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {branchConf.variants.length > 0 ? (
                        <Tabs 
                          value={activeVariantTabs[branchConf.branchId]} 
                          onValueChange={(val) => setActiveVariantTabs(prev => ({ ...prev, [branchConf.branchId]: val }))}
                          className="w-full"
                        >
                          <TabsList className="w-full flex justify-start bg-muted/20 overflow-x-auto">
                            {branchConf.variants.map((v, idx) => (
                              <TabsTrigger key={v.id} value={v.id} className="min-w-[80px]">
                                {v.variantName || `Variant ${idx + 1}`}
                              </TabsTrigger>
                            ))}
                          </TabsList>
                          
                          {branchConf.variants.map((v) => (
                            <TabsContent key={v.id} value={v.id} className="pt-4 space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Size / Variant Name</Label>
                                  <Input 
                                    value={v.variantName} 
                                    onChange={(e) => updateVariant(branchConf.branchId, v.id, { variantName: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Price</Label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                    <Input 
                                      type="number" 
                                      step="0.01" 
                                      className="pl-7" 
                                      value={v.price}
                                      onChange={(e) => updateVariant(branchConf.branchId, v.id, { price: parseFloat(e.target.value) || 0 })}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between border-t pt-4">
                                <div className="flex items-center gap-2">
                                  <Switch 
                                    checked={v.isAvailable} 
                                    onCheckedChange={(val) => updateVariant(branchConf.branchId, v.id, { isAvailable: val })} 
                                  />
                                  <Label>Available</Label>
                                </div>
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => {
                                    const newVariants = branchConf.variants.filter(varnt => varnt.id !== v.id);
                                    updateBranchConfig(branchConf.branchId, { variants: newVariants });
                                    if (activeVariantTabs[branchConf.branchId] === v.id && newVariants.length > 0) {
                                      setActiveVariantTabs(prev => ({ ...prev, [branchConf.branchId]: newVariants[0].id }));
                                    }
                                  }}
                                  disabled={branchConf.variants.length === 1}
                                >
                                  Remove Variant
                                </Button>
                              </div>
                            </TabsContent>
                          ))}
                        </Tabs>
                      ) : (
                        <p className="text-sm text-muted-foreground">No variants added.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex justify-end gap-4 border-t pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmittingForm}>
            {isSubmittingForm ? "Creating..." : "Create Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
