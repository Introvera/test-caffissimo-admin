import { baseApi } from "./baseApi";
import {
  OrderItemResponse,
  CreateOrderItemRequest,
  UpdateOrderItemRequest,
  PagedResult,
  PaginationParams,
} from "@/types";

export const orderItemApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/order-items  (paged, filter by orderId)
    getOrderItems: builder.query<PagedResult<OrderItemResponse>, PaginationParams | void>({
      query: (params) => ({
        url: "/api/order-items",
        params: params || undefined,
      }),
      providesTags: ["OrderItem"],
    }),

    // GET /api/order-items/{id}
    getOrderItemById: builder.query<OrderItemResponse, string>({
      query: (id) => `/api/order-items/${id}`,
      providesTags: (result, error, id) => [{ type: "OrderItem", id }],
    }),

    // POST /api/order-items  — add line item to existing order
    createOrderItem: builder.mutation<OrderItemResponse, CreateOrderItemRequest>({
      query: (data) => ({
        url: "/api/order-items",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["OrderItem", "Order"],
    }),

    // PUT /api/order-items/{id}
    updateOrderItem: builder.mutation<OrderItemResponse, { id: string; data: UpdateOrderItemRequest }>({
      query: ({ id, data }) => ({
        url: `/api/order-items/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "OrderItem", id }, "OrderItem", "Order"],
    }),

    // DELETE /api/order-items/{id}
    deleteOrderItem: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/order-items/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["OrderItem", "Order"],
    }),
  }),
});

export const {
  useGetOrderItemsQuery,
  useGetOrderItemByIdQuery,
  useCreateOrderItemMutation,
  useUpdateOrderItemMutation,
  useDeleteOrderItemMutation,
} = orderItemApi;
