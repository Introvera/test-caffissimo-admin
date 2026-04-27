import { baseApi } from "./baseApi";
import { BranchProductVariant } from "@/types";

export const variantApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBranchProductVariants: builder.query<BranchProductVariant[], string>({
      query: (branchProductId) => `/api/branch-product-variants/by-branch-product/${branchProductId}`,
      providesTags: ["BranchProductVariant"],
    }),
    createBranchProductVariant: builder.mutation<BranchProductVariant, Partial<BranchProductVariant>>({
      query: (data) => ({
        url: "/api/branch-product-variants",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["BranchProductVariant"],
    }),
    updateBranchProductVariant: builder.mutation<BranchProductVariant, { id: string; data: Partial<BranchProductVariant> }>({
      query: ({ id, data }) => ({
        url: `/api/branch-product-variants/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["BranchProductVariant"],
    }),
    deleteBranchProductVariant: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/branch-product-variants/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BranchProductVariant"],
    }),
  }),
});

export const {
  useGetBranchProductVariantsQuery,
  useCreateBranchProductVariantMutation,
  useUpdateBranchProductVariantMutation,
  useDeleteBranchProductVariantMutation,
} = variantApi;
