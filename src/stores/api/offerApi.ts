import { baseApi } from "./baseApi";
import {
  OfferResponse,
  OfferSummaryResponse,
  CreateOfferRequest,
  PagedResult,
  PaginationParams,
} from "@/types";

export const offerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/offers  (paged, anonymous)
    getOffers: builder.query<PagedResult<OfferSummaryResponse>, PaginationParams | void>({
      query: (params) => ({
        url: "/api/offers",
        params: params || undefined,
      }),
      providesTags: ["Offer"],
    }),

    // GET /api/offers/{id}  (anonymous)
    getOfferById: builder.query<OfferResponse, string>({
      query: (id) => `/api/offers/${id}`,
      providesTags: (result, error, id) => [{ type: "Offer", id }],
    }),

    // POST /api/offers  (auth required)
    createOffer: builder.mutation<OfferResponse, CreateOfferRequest>({
      query: (data) => ({
        url: "/api/offers",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Offer"],
    }),

    // NOTE: PUT /api/offers/{id} and DELETE /api/offers/{id} are NOT implemented in the
    // backend yet. Add these hooks here as placeholders so they are ready once the
    // backend endpoints are added.
  }),
});

export const {
  useGetOffersQuery,
  useGetOfferByIdQuery,
  useCreateOfferMutation,
} = offerApi;
