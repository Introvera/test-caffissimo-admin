import { baseApi } from "./baseApi";
import { Order } from "@/types";

interface GetOrdersParams {
  page?: number;
  pageSize?: number;
  branchId?: string | null;
  search?: string;
  status?: string;
}

interface OrdersResponse {
  items: Order[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<OrdersResponse, GetOrdersParams>({
      query: ({ page = 1, pageSize = 20, branchId, search, status }) => {
        let url = `/api/orders?page=${page}&pageSize=${pageSize}`;
        if (branchId) url += `&branchId=${branchId}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (status) url += `&orderStatus=${status}`;
        return url;
      },
      providesTags: ["Order"],
    }),
    updateOrderStatus: builder.mutation<Order, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/api/orders/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Order"],
    }),
  }),
});

export const { useGetOrdersQuery, useUpdateOrderStatusMutation } = orderApi;
