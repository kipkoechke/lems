import axios from "../lib/axios";

// ============================================================
// Types
// ============================================================

export interface UserProfileFacility {
  id: string;
  name: string;
}

export interface UserProfileVendor {
  id: string;
  name: string;
}

export interface UserProfile {
  id: string;
  salutation?: string | null;
  gender?: string | null;
  vendor?: UserProfileVendor | null;
  facility?: UserProfileFacility | null;
}

/** The facility or vendor a user belongs to, as sent by /users. */
export interface UserInstitution {
  type: "facility" | "vendor" | string;
  id: string;
  code?: string;
  name: string;
}

export interface AdminUser {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  role: string;
  role_label?: string;
  is_active: boolean;
  institution?: UserInstitution | null;
  profile?: UserProfile;
  permissions?: PermissionRecord[];
  created_at?: string;
  updated_at?: string;
}

/**
 * The institution a user belongs to. The list endpoint sends a flat
 * `institution` block; older payloads nested it under `profile`.
 */
export const userInstitution = (user: AdminUser): UserInstitution | null => {
  if (user.institution) return user.institution;
  if (user.profile?.facility)
    return { type: "facility", ...user.profile.facility };
  if (user.profile?.vendor) return { type: "vendor", ...user.profile.vendor };
  return null;
};

/** Derive a display name, falling back to email when name is absent. */
export const userDisplayName = (user: AdminUser): string =>
  user.name || user.email;

/**
 * Badge styling for a user's role. The API sends `role_label`, so that is the
 * display text; the raw `role` code only selects the colour.
 */
export const userScopeLabel = (
  user: AdminUser,
): { label: string; cls: string } => {
  switch (user.role) {
    case "s_admin":
      return {
        label: user.role_label || "Super Admin",
        cls: "bg-purple-50 text-purple-700 border-purple-200",
      };
    case "admin":
      return {
        label: user.role_label || "Admin",
        cls: "bg-indigo-50 text-indigo-700 border-indigo-200",
      };
    case "f_admin":
      return {
        label: user.role_label || "Facility Admin",
        cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case "vendor":
      return {
        label: user.role_label || "Vendor",
        cls: "bg-blue-50 text-blue-700 border-blue-200",
      };
    default:
      return {
        label: user.role_label || "Standard",
        cls: "bg-slate-50 text-slate-700 border-slate-200",
      };
  }
};

export interface UserListParams {
  is_active?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface UserListResponse {
  data: AdminUser[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    total_pages?: number;
    from: number;
    to: number;
  };
}

export interface UserCreateRequest {
  username: string;
  email: string;
  password: string;
  full_name?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  is_facility?: boolean;
  is_vendor?: boolean;
  facility_id?: string;
  vendor_id?: string;
}

export interface UserUpdateRequest {
  email?: string;
  full_name?: string;
  password?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  is_facility?: boolean;
  is_vendor?: boolean;
  facility_id?: string;
  vendor_id?: string;
}

export interface PermissionRecord {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  resource: string;
  action: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PermissionListParams {
  is_active?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface PermissionListResponse {
  data: PermissionRecord[];
  pagination?: UserListResponse["pagination"];
}

export interface PermissionCreateRequest {
  code: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
  is_active?: boolean;
}

export interface PermissionUpdateRequest {
  name?: string;
  description?: string;
  resource?: string;
  action?: string;
  is_active?: boolean;
}

// ============================================================
// Users — /users
// ============================================================

// GET /users
export const getUsers = async (
  params: UserListParams = {},
): Promise<UserListResponse> => {
  const response = await axios.get<UserListResponse>("/users", { params });
  return {
    data: response.data.data ?? [],
    pagination: response.data.pagination,
  };
};

// GET /users/{id} — includes assigned permissions
export const getUser = async (userId: string): Promise<AdminUser> => {
  const response = await axios.get<{ data: AdminUser }>(`/users/${userId}`);
  return response.data.data ?? (response.data as unknown as AdminUser);
};

// POST /users
export const createUser = async (
  data: UserCreateRequest,
): Promise<AdminUser> => {
  const response = await axios.post<{ data: AdminUser }>("/users", data);
  return response.data.data ?? (response.data as unknown as AdminUser);
};

// PUT /users/{id}
export const updateUser = async (
  userId: string,
  data: UserUpdateRequest,
): Promise<AdminUser> => {
  const response = await axios.put<{ data: AdminUser }>(
    `/users/${userId}`,
    data,
  );
  return response.data.data ?? (response.data as unknown as AdminUser);
};

// DELETE /users/{id} — soft delete, returns 204
export const deleteUser = async (userId: string): Promise<void> => {
  await axios.delete(`/users/${userId}`);
};

// ============================================================
// Permissions catalog — /admin/permissions
// ============================================================

// GET /admin/permissions
export const getPermissions = async (
  params: PermissionListParams = {},
): Promise<PermissionListResponse> => {
  const response = await axios.get<PermissionListResponse>(
    "/admin/permissions",
    { params },
  );
  return {
    data: response.data.data ?? [],
    pagination: response.data.pagination,
  };
};

// GET /admin/permissions/{id}
export const getPermission = async (
  permissionId: string,
): Promise<PermissionRecord> => {
  const response = await axios.get<{ data: PermissionRecord }>(
    `/admin/permissions/${permissionId}`,
  );
  return response.data.data ?? (response.data as unknown as PermissionRecord);
};

// POST /admin/permissions
export const createPermission = async (
  data: PermissionCreateRequest,
): Promise<PermissionRecord> => {
  const response = await axios.post<{ data: PermissionRecord }>(
    "/admin/permissions",
    data,
  );
  return response.data.data ?? (response.data as unknown as PermissionRecord);
};

// PUT /admin/permissions/{id}
export const updatePermission = async (
  permissionId: string,
  data: PermissionUpdateRequest,
): Promise<PermissionRecord> => {
  const response = await axios.put<{ data: PermissionRecord }>(
    `/admin/permissions/${permissionId}`,
    data,
  );
  return response.data.data ?? (response.data as unknown as PermissionRecord);
};

// DELETE /admin/permissions/{id} — soft delete, returns 204
export const deletePermission = async (permissionId: string): Promise<void> => {
  await axios.delete(`/admin/permissions/${permissionId}`);
};

// ============================================================
// User ↔ Permission assignment — /admin/users/{id}/permissions
// ============================================================

// GET /admin/users/{userId}/permissions
export const getUserPermissions = async (
  userId: string,
): Promise<PermissionRecord[]> => {
  const response = await axios.get<{ data: PermissionRecord[] }>(
    `/admin/users/${userId}/permissions`,
  );
  return response.data.data ?? [];
};

// POST /admin/users/{userId}/permissions/{permissionId}
export const assignUserPermission = async (
  userId: string,
  permissionId: string,
  grantedBy?: string,
): Promise<void> => {
  await axios.post(`/admin/users/${userId}/permissions/${permissionId}`, {
    granted_by: grantedBy,
  });
};

// DELETE /admin/users/{userId}/permissions/{permissionId} — returns 204
export const unassignUserPermission = async (
  userId: string,
  permissionId: string,
): Promise<void> => {
  await axios.delete(`/admin/users/${userId}/permissions/${permissionId}`);
};
