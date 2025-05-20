import { getResumeFromResult } from "../../helper";
import { apiSlice } from "../api/apiSlice";

export const resumeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createResume: builder.mutation({
      query: (data) => ({
        url: "create-resume",
        method: "POST",
        body: data,
        credentials: "include" as const,
      }),
      invalidatesTags: (result) => {
        return [
          { type: "Resume", id: result?.resume?._id },
          { type: "Resume", id: "LIST" },
        ];
      },
    }),
    getAllResumes: builder.query({
      query: () => ({
        url: "resumes",
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: (result) => [
        ...getResumeFromResult(result),
        { type: "Resume", id: "LIST" },
      ],
    }),
    getResume: builder.query({
      query: ({ id }) => ({
        url: `resume/${id}`,
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: (result) => [
        ...getResumeFromResult(result),
        { type: "Resume", id: "LIST" },
      ],
    }),
    updateResume: builder.mutation({
      query: ({ id, data }) => ({
        url: `update-resume/${id}`,
        method: "PUT",
        body: data,
        credentials: "include" as const,
      }),
      invalidatesTags: (arg) => {
        return [
          { type: "Resume", id: arg?.id || "UNKNOWN" },
          { type: "Resume", id: "LIST" },
        ];
      },
    }),
    updateResumeImage: builder.mutation({
      query: ({ id, data }) => ({
        url: `update-resume-image/${id}`,
        method: "PUT",
        body: data,
        credentials: "include" as const,
      }),
      invalidatesTags: (arg) => {
        return [
          { type: "Resume", id: arg?.id || "UNKNOWN" },
          { type: "Resume", id: "LIST" },
        ];
      },
    }),
    deleteResume: builder.mutation({
      query: (id) => ({
        url: `delete-resume/${id}`,
        method: "DELETE",
        credentials: "include" as const,
      }),
      invalidatesTags: (id) => [
        { type: "Resume", id },
        { type: "Resume", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useCreateResumeMutation,
  useGetAllResumesQuery,
  useGetResumeQuery,
  useUpdateResumeMutation,
  useUpdateResumeImageMutation,
  useDeleteResumeMutation,
} = resumeApi;
