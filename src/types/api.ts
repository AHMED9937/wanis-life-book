export type ApiErrorPayload = {
  error?: string | null;
  message?: string | null;
};

export type ApiClientErrorCode =
  | "BACKEND_UNAVAILABLE"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "HTTP_ERROR";

export class ApiClientError extends Error {
  readonly code: ApiClientErrorCode;
  readonly status?: number;

  constructor(code: ApiClientErrorCode, message: string, status?: number) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
  }
}

export type ApiResponse<TData> = {
  data: TData;
  error: string | null;
};

export type DbCoverStyle = "classic_leather" | "vintage_gold" | "forest_green";
export type DbStoryStatus = "processing" | "ready" | "failed";
export type DbGender = "male" | "female";

export interface DbStoryDto {
  id: string;
  title: string;
  audioFileUrl: string;
  rawTranscript: string;
  literaryContent: string;
  status: DbStoryStatus;
  durationSeconds: number;
  createdAt: string;
  updatedAt: string;
}

export interface DbLifeBookDto {
  id: string;
  residentId: string;
  bookTitle: string;
  coverStyle: DbCoverStyle;
  createdAt: string;
  updatedAt: string;
  stories?: DbStoryDto[];
}

export interface DbResidentDto {
  id: string;
  careHomeId: string;
  firstName: string;
  lastName: string;
  nickname?: string | null;
  gender: DbGender;
  dateOfBirth: string | null;
  roomNumber: string | null;
  profileImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  lifeBook?: DbLifeBookDto | null;
}

export interface CreateResidentRequest {
  firstName: string;
  lastName: string;
  gender: DbGender;
  roomNumber?: string;
}

export interface CreateStoryRequest {
  lifeBookId: string;
  title: string;
  literaryContent: string;
  rawTranscript: string;
  durationSeconds: number;
}
