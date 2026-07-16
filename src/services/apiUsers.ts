import axios from "../lib/axios";

// ============================================================
// Types
// ============================================================

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  full_name?: string | null;
  is_active: boolean;
  is_superuser: boolean;
  is_facility: boolean;
  is_vendor: boolean;
  facility_id?: string | null;
  vendor_id?: string | null;
  permissions?: PermissionRecord[];
  created_at?: string;
  updated_at?: string;
}

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
