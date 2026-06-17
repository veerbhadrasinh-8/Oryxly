export type User = {
  id: string;
  email: string;
  full_name: string;
  plan: "lite" | "starter" | "growth" | "agency";
  is_admin: boolean;
};

export type LoginResponse = {
  success: true;
  data: {
    access_token: string;
    refresh_token: string;
    user: User;
  };
};

export type RefreshResponse = { access_token: string };
export type RegisterResponse = { success: true; message: string };
