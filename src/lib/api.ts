import { Resident, Story } from '../types';
import {
  ApiClientError,
  ApiErrorPayload,
  ApiResponse,
  CreateResidentRequest,
  CreateStoryRequest,
  DbCoverStyle,
  DbResidentDto,
  DbStoryDto,
} from '../types/api';

const BASE_URL = '/api';

// --- Helper Functions to Map Backend Data to Frontend Interfaces ---

const calculateAge = (dateOfBirth?: string | null): number => {
  if (!dateOfBirth) return 80; // Fallback age
  const diff = Date.now() - new Date(dateOfBirth).getTime();
  const ageDt = new Date(diff); 
  return Math.abs(ageDt.getUTCFullYear() - 1970);
};

const mapCoverColor = (dbStyle?: DbCoverStyle): 'emerald' | 'burgundy' | 'sapphire' | 'amber' => {
  if (dbStyle === 'vintage_gold') return 'amber';
  if (dbStyle === 'forest_green') return 'emerald';
  // classic_leather defaults to burgundy
  return 'burgundy';
};

const formatDuration = (seconds?: number | null): string => {
  if (!seconds) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const mapStory = (dbStory: DbStoryDto): Story => {
  return {
    id: dbStory.id,
    title: dbStory.title || "حكاية بلا عنوان",
    date: new Date(dbStory.createdAt).toLocaleDateString('ar-EG'),
    content: dbStory.literaryContent || dbStory.rawTranscript || "لا يوجد محتوى",
    audioDuration: formatDuration(dbStory.durationSeconds),
    aiTags: [],
  };
};

const mapResident = (dbRes: DbResidentDto): Resident => {
  const lifeBook = dbRes.lifeBook ?? undefined;
  const dbStories = lifeBook?.stories ?? [];

  return {
    id: dbRes.id,
    name: `${dbRes.firstName} ${dbRes.lastName}`.trim(),
    nickname: dbRes.nickname?.trim() || `النزيل ${dbRes.firstName}`,
    age: calculateAge(dbRes.dateOfBirth),
    roomNumber: dbRes.roomNumber || "غير محدد",
    admissionDate: new Date(dbRes.createdAt).toLocaleDateString('ar-EG'),
    coverTitle: lifeBook?.bookTitle || `كتاب حياة ${dbRes.firstName}`,
    coverColor: mapCoverColor(lifeBook?.coverStyle),
    stories: dbStories.map(mapStory),
    // Internal field used by create story flow.
    _lifeBookId: lifeBook?.id,
  };
};

const getErrorMessage = (json: unknown): string => {
  if (!json || typeof json !== "object") {
    return "Request failed";
  }

  const payload = json as ApiErrorPayload;
  return payload.error || payload.message || "Request failed";
};

const getStatusErrorCode = (status: number): ApiClientError["code"] => {
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  return "HTTP_ERROR";
};

const requestJson = async <TData>(url: string, options: RequestInit): Promise<TData> => {
  let res: Response;
  try {
    res = await fetch(url, options);
  } catch (error) {
    throw new ApiClientError(
      "BACKEND_UNAVAILABLE",
      "Backend is unavailable. Please check server connection.",
    );
  }

  if (!res.ok) {
    let message = res.statusText;
    try {
      const errorPayload = await res.json();
      message = getErrorMessage(errorPayload);
    } catch {
      // keep status text fallback
    }

    throw new ApiClientError(getStatusErrorCode(res.status), message, res.status);
  }

  const json = (await res.json()) as ApiResponse<TData>;
  return json.data;
};

export const resolveApiErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (error instanceof ApiClientError) {
    if (error.code === "BACKEND_UNAVAILABLE") {
      return "❌ الخادم غير متاح حالياً. تأكد أن Backend شغّال ثم أعد المحاولة.";
    }

    if (error.code === "UNAUTHORIZED") {
      return "❌ انتهت جلسة الدخول. الرجاء تسجيل الدخول مرة أخرى.";
    }

    if (error.code === "FORBIDDEN") {
      return "❌ لا تملك صلاحية الوصول لهذه البيانات.";
    }

    return `❌ ${error.message}`;
  }

  return fallbackMessage;
};

// --- API Client Functions ---

export const fetchResidents = async (token: string, query?: string): Promise<Resident[]> => {
  const params = new URLSearchParams();
  const trimmed = query?.trim();
  if (trimmed) params.set('q', trimmed);

  const url = params.size > 0
    ? `${BASE_URL}/residents?${params.toString()}`
    : `${BASE_URL}/residents`;

  const data = await requestJson<DbResidentDto[]>(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  // Map the raw DB array into the frontend's expected format
  return data.map(mapResident);
};

export const createResident = async (token: string, residentData: Partial<Resident>): Promise<Resident> => {
  // Break apart the flat frontend structure to match what the backend expects
  const names = residentData.name ? residentData.name.split(' ') : ["مجهول"];
  const payload: CreateResidentRequest = {
    firstName: names[0] || "مجهول",
    lastName: names.slice(1).join(' ') || "مجهول",
    gender: "male", // Defaults since frontend didn't have a gender picker
    roomNumber: residentData.roomNumber,
  };

  const data = await requestJson<DbResidentDto>(`${BASE_URL}/residents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  return mapResident(data);
};

export const createStory = async (token: string, lifeBookId: string, storyData: Story): Promise<Story> => {
  // Parse MM:SS duration back into seconds
  const [min, sec] = storyData.audioDuration.split(':').map(Number);
  const totalSeconds = (min * 60) + (sec || 0);

  const payload: CreateStoryRequest = {
    lifeBookId: lifeBookId,
    title: storyData.title,
    literaryContent: storyData.content,
    rawTranscript: storyData.content, // Since frontend only outputs one text field currently
    durationSeconds: isNaN(totalSeconds) ? 0 : totalSeconds,
  };

  const data = await requestJson<DbStoryDto>(`${BASE_URL}/stories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  return mapStory(data);
};
