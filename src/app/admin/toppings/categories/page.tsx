"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetToppingCategoriesQuery, useDeleteToppingCategoryMutation } from "@/stores/api/toppingApi";
import { canManageProducts } from "@/lib/rbac";
import { useAppSelector } from "@/stores/store";
import { UserRole } from "@/types";

export default function ToppingCategoriesPage() {
  const currentRole = useAppSelector((state) => state.auth.user?.role) || UserRole.Cashier;
  const { data: categoriesData, isLoading } = useGetToppingCategoriesQuery();
  const categories = categoriesData?.items || [];
  
  const [deleteCategory] = useDeleteToppingCategoryMutation();
  const canEdit = canManageProducts(currentRole);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(id).unwrap();
      } catch (err) {
        console.error("Failed to delete category", err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/toppings">
           <Button variant="ghost" size="icon">
             <ArrowLeft className="h-4 w-4" />
           </Button>
        </Link>
        <PageHeader
          title="Topping Categories"
          description="Manage grouping for customizations"
          actions={
            canEdit && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            )
          }
        />
      </div>

      <div className="border rounded-lg bg-background overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No categories found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.toppingCategoryId}>
                  <TableCell className="font-medium">
                    {category.categoryName}
                  </TableCell>
                  <TableCell>
                    <Badge variant={category.isActive ? "success" : "secondary"}>
                      {category.isActive ? "Active" : "Archived"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {canEdit && (
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleDelete(category.toppingCategoryId)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
