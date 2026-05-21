import apiClient from "./api-client";
import type {
  TrainingModuleSummaryResponse,
  TrainingModuleDetailResponse,
  EmployeeTrainingStatusResponse,
  CreateTrainingModuleRequest,
  UpdateTrainingModuleRequest,
  CreateTrainingVideoRequest,
  CreateTrainingQuestionRequest,
  TrainingAttemptSubmitResponse,
  SubmitTrainingAttemptRequest,
  PagedResult,
} from "@/types";

export const trainingApi = {
  // ── Modules ──────────────────────────────────────────────────────────────
  getActiveModules: () =>
    apiClient.get<TrainingModuleSummaryResponse[]>("/api/training/modules/active"),

  getModule: (moduleId: string) =>
    apiClient.get<TrainingModuleDetailResponse>(`/api/training/modules/${moduleId}`),

  createModule: (data: CreateTrainingModuleRequest) =>
    apiClient.post<TrainingModuleDetailResponse>("/api/training/modules", data),

  updateModule: (moduleId: string, data: UpdateTrainingModuleRequest) =>
    apiClient.put<TrainingModuleDetailResponse>(
      `/api/training/modules/${moduleId}`,
      data
    ),

  // ── Videos ───────────────────────────────────────────────────────────────
  addVideo: (moduleId: string, data: CreateTrainingVideoRequest) =>
    apiClient.post<TrainingModuleDetailResponse>(
      `/api/training/modules/${moduleId}/videos`,
      data
    ),

  // ── Questions ─────────────────────────────────────────────────────────────
  addQuestion: (moduleId: string, data: CreateTrainingQuestionRequest) =>
    apiClient.post<TrainingModuleDetailResponse>(
      `/api/training/modules/${moduleId}/questions`,
      data
    ),

  // ── Attempts ──────────────────────────────────────────────────────────────
  submitAttempt: (moduleId: string, data: SubmitTrainingAttemptRequest) =>
    apiClient.post<TrainingAttemptSubmitResponse>(
      `/api/training/modules/${moduleId}/attempts`,
      data
    ),

  // ── Status ────────────────────────────────────────────────────────────────
  getMyStatus: () =>
    apiClient.get<EmployeeTrainingStatusResponse[]>("/api/training/me/status"),

  getEmployeeStatus: (employeeId: string, moduleId: string) =>
    apiClient.get<EmployeeTrainingStatusResponse>(
      `/api/training/employees/${employeeId}/status?moduleId=${moduleId}`
    ),

  getBranchStatuses: (branchId: string, page = 1, pageSize = 20) =>
    apiClient.get<PagedResult<EmployeeTrainingStatusResponse>>(
      `/api/training/branches/${branchId}/status?page=${page}&pageSize=${pageSize}`
    ),
};
