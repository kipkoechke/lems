# Project Conventions & Coding Standards

## Tech Stack
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with slate color palette
- **State Management**: Redux Toolkit (@/store)
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation
- **Icons**: react-icons (MdIcons preferred)

## Project Structure
```
src/
├── app/
│   ├── (app)/           # Protected routes (dashboard, features)
│   ├── (auth)/          # Auth routes (login, forgot-password)
│   └── layout.tsx       # Root layout
├── components/
│   ├── common/          # Reusable UI components
│   ├── layout/          # Layout components (Sidebar, Header)
│   └── [feature]/       # Feature-specific components
├── hooks/               # Custom React Query hooks
├── services/            # API service functions
├── store/               # Redux store and slices
├── types/               # TypeScript interfaces
└── utils/               # Utility functions
```

## Common Components (always use from @/components/common)
- `InputField` - Text inputs with label and error handling
- `TextAreaField` - Multi-line text inputs
- `SearchableSelect` - Dropdown with search functionality
- `SelectField` - Basic select dropdown
- `Modal` - Compound component modal (Modal.Open, Modal.Window)
- `DeleteConfirmationModal` - Standardized delete confirmation
- `Button` - Styled button component
- `BackButton` - Navigation back button

## UI Design Patterns

### Detail/View Pages
1. **Header**: Back button + Title + Badge + Action buttons (Edit/Delete)
2. **Quick Stats Row**: 4-column grid with icon cards
3. **Main Content**: Single white card with sections separated by borders
4. **Footer**: Created/Updated timestamps inside main card

```tsx
// Quick stats card structure
<div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
  <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
    <MdIcon className="w-4 h-4 text-blue-600" />
  </div>
  <div className="min-w-0">
    <p className="text-xs text-slate-400">Label</p>
    <p className="text-sm font-medium text-slate-900 truncate">Value</p>
  </div>
</div>
```

### Form Pages (New/Edit)
- Use `SearchableSelect` for all dropdown selections (not raw select)
- Use `TextAreaField` for multi-line text
- Use `InputField` for single-line text
- Geographic cascading: Region → County → Sub-County → Division → Location → Sub-Location

### List Pages
- Filter bar at top
- Table with action menu per row
- Pagination at bottom

## Spacing Conventions (Compact)
- Container: `px-4 py-4`
- Section margins: `mb-4`
- Grid gaps: `gap-2`
- Card padding: `p-2.5` (stats), `p-4` (content)
- Border radius: `rounded-lg` (not rounded-xl)

## Color Palette
- Primary text: `text-slate-900`
- Secondary text: `text-slate-500`, `text-slate-400`
- Borders: `border-slate-200`, `border-slate-100`
- Backgrounds: `bg-white`, `bg-slate-50/50`
- Status badges:
  - Pending: `bg-amber-50 text-amber-700 border-amber-200`
  - Success/Resolved: `bg-emerald-50 text-emerald-700 border-emerald-200`
  - Info/Reviewed: `bg-blue-50 text-blue-700 border-blue-200`
  - Error/Emergency: `bg-red-50 text-red-700 border-red-200`

## Data Fetching Architecture

### 1. Types (`src/types/[feature].ts`)

Define all TypeScript interfaces for the feature:

```tsx
// Main entity interface
export interface Feature {
  id: number;
  title: string;
  description: string;
  status: "pending" | "reviewed" | "resolved" | "closed";
  created_at: string;
  updated_at: string;
  // Foreign key IDs
  category_id: number;
  region_id: number | null;
  county_id: number | null;
  // ... other location IDs
  // Nested objects (populated by API)
  category?: { id: number; name: string };
  region?: { id: number; name: string } | null;
  county?: { id: number; name: string } | null;
  // ... other nested location objects
}

// Create payload - required fields only
export interface CreateFeaturePayload {
  title: string;
  description: string;
  category_id: number;
  sub_location_id: number;
}

// Update payload - all fields optional
export interface UpdateFeaturePayload {
  title?: string;
  description?: string;
  category_id?: number;
  status?: "pending" | "reviewed" | "resolved" | "closed";
  // ... other optional fields
}

// List response with pagination
export interface FeaturesResponse {
  data: Feature[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
  };
}
```

### 2. Axios Instance (`src/lib/axios.ts`)

Centralized axios instance with interceptors:

```tsx
import axios from "axios";
import { getAuthToken, clearAuthData } from "./auth";

const axiosInstance = axios.create({
  baseURL: "https://api.example.com/api/v2",
  timeout: 10000,
  responseType: "json",
});

// Request interceptor - add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      clearAuthData();
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;
```

### 3. Services (`src/services/[feature]Service.ts`)

API service functions for all CRUD operations:

```tsx
import axiosInstance from "@/lib/axios";
import type {
  Feature,
  FeaturesResponse,
  CreateFeaturePayload,
  UpdateFeaturePayload,
} from "@/types/feature";

// Query params interface
export interface FeaturesParams {
  page?: number;
  per_page?: number;
  status?: string;
  category_id?: number;
  search?: string;
  // Add filter params as needed
}

// GET all (with pagination & filters)
export const getFeatures = async (
  params: FeaturesParams = {}
): Promise<FeaturesResponse> => {
  const response = await axiosInstance.get("/features", { params });
  return response.data;
};

// GET single by ID
export const getFeature = async (id: string): Promise<Feature> => {
  const response = await axiosInstance.get(`/features/${id}`);
  return response.data.data; // Handle nested data response
};

// POST create
export const createFeature = async (
  data: CreateFeaturePayload
): Promise<Feature> => {
  const response = await axiosInstance.post("/features", data);
  return response.data;
};

// PATCH update
export const updateFeature = async (
  id: string,
  data: UpdateFeaturePayload
): Promise<Feature> => {
  const response = await axiosInstance.patch(`/features/${id}`, data);
  return response.data;
};

// DELETE
export const deleteFeature = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/features/${id}`);
};
```

### 4. Hooks (`src/hooks/use[Feature].ts`)

React Query hooks wrapping service functions with toast notifications:

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getFeatures,
  getFeature,
  createFeature,
  updateFeature,
  deleteFeature,
  FeaturesParams,
} from "@/services/featureService";
import type {
  CreateFeaturePayload,
  UpdateFeaturePayload,
} from "@/types/feature";

// List hook with params
export const useFeatures = (params: FeaturesParams = {}) => {
  return useQuery({
    queryKey: ["features", params],
    queryFn: () => getFeatures(params),
  });
};

// Single item hook
export const useFeature = (id: string) => {
  return useQuery({
    queryKey: ["feature", id],
    queryFn: () => getFeature(id),
    enabled: !!id, // Only fetch when ID exists
  });
};

// Create mutation with toast
export const useCreateFeature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFeaturePayload) => createFeature(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["features"] });
      toast.success("Feature created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create feature");
    },
  });
};

// Update mutation with toast
export const useUpdateFeature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFeaturePayload }) =>
      updateFeature(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["features"] });
      queryClient.invalidateQueries({ queryKey: ["feature", variables.id] });
      toast.success("Feature updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update feature");
    },
  });
};

// Delete mutation with toast
export const useDeleteFeature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFeature(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["features"] });
      toast.success("Feature deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete feature");
    },
  });
};
```

### 5. Toast Setup

Add `react-hot-toast` to your app layout:

```tsx
// src/app/layout.tsx or src/components/provider/index.tsx
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#fff",
              color: "#0f172a",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "#10b981", secondary: "#fff" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#fff" },
            },
          }}
        />
      </body>
    </html>
  );
}
```

### 6. Usage in Components

```tsx
// List page
const { data, isLoading, error } = useFeatures({
  page: 1,
  per_page: 10,
  status: "pending",
  search: searchTerm,
});

// Detail page
const { data: item, isLoading } = useFeature(id);

// Create form
const createMutation = useCreateFeature();
const onSubmit = (data) => {
  createMutation.mutate(data, {
    onSuccess: () => router.push("/features"),
  });
};

// Edit form
const updateMutation = useUpdateFeature();
const onSubmit = (data) => {
  updateMutation.mutate({ id, data }, {
    onSuccess: () => router.push(`/features/${id}`),
  });
};

// Delete
const deleteMutation = useDeleteFeature();
const handleDelete = () => {
  deleteMutation.mutate(id, {
    onSuccess: () => router.push("/features"),
  });
};
```

### Query Key Conventions
- List: `["feature-plural", params]` e.g. `["features", { page: 1 }]`
- Single: `["feature-singular", id]` e.g. `["feature", "123"]`
- Always invalidate list on create/update/delete
- Invalidate single item on update

## Rules
- **Never display IDs** in the UI (no #0001 or UUIDs)
- **Always use common components** instead of raw HTML elements
- **Handle loading states** with spinner animation
- **Handle error states** with user-friendly messages
- **Use proper TypeScript types** for all data
- **Format dates** using `toLocaleDateString("en-GB")` with day/month/year
- **Format numbers** using `toLocaleString()` for thousands separator
