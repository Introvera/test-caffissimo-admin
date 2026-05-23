import { baseApi } from "./baseApi";
import {
  AppUser,
  CreateFirebaseUserRequest,
  CreateCustomerFirebaseUserRequest,
  UpdateUserRoleRequest,
  ResetUserPasswordRequest,
  UpdateUserRoleResponse,
  PagedResult,
} from "@/types";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/firebaseuser
    getUsers: builder.query<PagedResult<AppUser>, { page?: number; pageSize?: number; search?: string; role?: string; branchId?: string; isActive?: boolean }>({
      query: (params) => ({
        url: "/api/firebaseuser",
        params,
      }),
      providesTags: ["User"],
    }),

    // GET /api/firebaseuser/current-user
    getCurrentUser: builder.query<AppUser, void>({
      query: () => "/api/firebaseuser/current-user",
      providesTags: ["User"],
    }),

    // POST /api/firebaseuser  — create staff user (with role)
    createUser: builder.mutation<AppUser, CreateFirebaseUserRequest>({
      query: (data) => ({
        url: "/api/firebaseuser",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // POST /api/firebaseuser/customer  — create customer account
    createCustomerUser: builder.mutation<AppUser, CreateCustomerFirebaseUserRequest>({
      query: (data) => ({
        url: "/api/firebaseuser/customer",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // PUT /api/firebaseuser/{id}/role
    updateUserRole: builder.mutation<UpdateUserRoleResponse, { id: string; data: UpdateUserRoleRequest }>({
      query: ({ id, data }) => ({
        url: `/api/firebaseuser/${id}/role`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // POST /api/firebaseuser/{id}/reset-password
    resetUserPassword: builder.mutation<void, { id: string; data: ResetUserPasswordRequest }>({
      query: ({ id, data }) => ({
        url: `/api/firebaseuser/${id}/reset-password`,
        method: "POST",
        body: data,
      }),
    }),

    // DELETE /api/firebaseuser/{id}
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/firebaseuser/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetCurrentUserQuery,
  useCreateUserMutation,
  useCreateCustomerUserMutation,
  useUpdateUserRoleMutation,
  useResetUserPasswordMutation,
  useDeleteUserMutation,
} = userApi;
