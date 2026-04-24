import { baseApi } from "./baseApi";
import { Branch, PagedResult, PaginationParams } from "@/types";

export const branchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBranches: builder.query<PagedResult<Branch>, PaginationParams | void>({
      query: (params) => ({
        url: "/api/branches",
        params: params || undefined,
      }),
      providesTags: ["Branch"],
    }),
    getBranchById: builder.query<Branch, string>({
      query: (id) => `/api/branches/${id}`,
      providesTags: (result, error, id) => [{ type: "Branch", id }],
    }),
    createBranch: builder.mutation<Branch, Partial<Branch>>({
      query: (newBranch) => ({
        url: "/api/branches",
        method: "POST",
        body: newBranch,
      }),
      invalidatesTags: ["Branch"],
    }),
    updateBranch: builder.mutation<Branch, { id: string; data: Partial<Branch> }>({
      query: ({ id, data }) => ({
        url: `/api/branches/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Branch"],
    }),
    deleteBranch: builder.mutation<string, string>({
      query: (id) => ({
        url: `/api/branches/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Branch"],
    }),
  }),
});

export const {
  useGetBranchesQuery,
  useGetBranchByIdQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
} = branchApi;
