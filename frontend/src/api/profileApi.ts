import { ProfileFormData, UserProfile } from "../types/profile";
// const BACKEND_BASE_URL = "http://127.0.0.1:8000";
const BACKEND_BASE_URL = "https://crud-django-1-hsld.onrender.com";
const API_URL = `${BACKEND_BASE_URL}/api/profiles/`;

export interface ProfileStats {
  total: number;
  active: number;
  pending: number;
  inactive: number;
  // average_age: number | null;
}

type BackendProfile = {
  id?: number | string;
  full_name?: string;
  fullName?: string;
  age?: number | string | null;
  email?: string;
  contact_number?: string;
  contactNumber?: string;
  gender?: string;
  address?: string;
  status?: string;
  profile_image?: string | null;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
};

const normalizeGender = (value?: string): UserProfile["gender"] => {
  const normalized = (value ?? "").toLowerCase();

  switch (normalized) {
    case "male":
      return "Male";
    case "female":
      return "Female";
    case "non-binary":
      return "Non-binary";
    case "prefer not to say":
    case "other":
      return "Prefer not to say";
    default:
      return "Female";
  }
};

const normalizeStatus = (value?: string): UserProfile["status"] => {
  const normalized = (value ?? "").toLowerCase();

  switch (normalized) {
    case "active":
      return "Active";
    case "inactive":
      return "Inactive";
    case "pending":
      return "Pending";
    default:
      return "Active";
  }
};

const toBackendGender = (value: UserProfile["gender"]) => {
  switch (value) {
    case "Male":
      return "male";
    case "Female":
      return "female";
    case "Non-binary":
    case "Prefer not to say":
      return "other";
    default:
      return "other";
  }
};

const toBackendStatus = (value: UserProfile["status"]) => {
  switch (value) {
    case "Active":
      return "active";
    case "Inactive":
      return "inactive";
    case "Pending":
      return "pending";
    default:
      return "active";
  }
};

const mapProfile = (profile: BackendProfile): UserProfile => {
  const ageValue = profile.age ?? "";

  return {
    id: String(profile.id ?? ""),
    fullName: profile.full_name ?? profile.fullName ?? "",
    age: ageValue === "" || ageValue === null ? "" : Number(ageValue),
    email: profile.email ?? "",
    contactNumber: profile.contact_number ?? profile.contactNumber ?? "",
    gender: normalizeGender(profile.gender),
    address: profile.address ?? "",
    status: normalizeStatus(profile.status),
    avatarUrl: profile.profile_image
      ? `${BACKEND_BASE_URL}${profile.profile_image}`
      : "",
    createdAt:
      profile.created_at ?? profile.createdAt ?? new Date().toISOString(),
    updatedAt: profile.updated_at ?? profile.updatedAt,
  };
};

const toBackendPayload = (profile: ProfileFormData) => ({
  full_name: profile.fullName,
  age: Number(profile.age),
  email: profile.email,
  contact_number: profile.contactNumber,
  gender: toBackendGender(profile.gender),
  address: profile.address,
  status: toBackendStatus(profile.status),
});

export const fetchProfiles = async (): Promise<UserProfile[]> => {
  const response = await fetch(API_URL, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("The profiles API returned an invalid response.");
  }

  return data.map((profile: BackendProfile) => mapProfile(profile));
};

export const fetchProfileStats = async (): Promise<ProfileStats> => {
  const response = await fetch(`${API_URL}stats/`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Stats request failed with status ${response.status}`);
  }

  return response.json();
};

export const createProfile = async (
  profile: ProfileFormData,
): Promise<UserProfile> => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(toBackendPayload(profile)),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Unable to create profile");
  }

  const data = await response.json();
  return mapProfile(data);
};

export const updateProfile = async (
  id: string | number,
  profile: ProfileFormData,
): Promise<UserProfile> => {
  const response = await fetch(`${API_URL}${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(toBackendPayload(profile)),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Unable to update profile");
  }

  const data = await response.json();
  return mapProfile(data);
};

export const deleteProfile = async (id: string | number): Promise<void> => {
  const response = await fetch(`${API_URL}${id}/`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Unable to delete profile");
  }
};
