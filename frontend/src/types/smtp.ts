export type SmtpStatus = "active" | "inactive" | "failed";

export type SmtpAccount = {
  id: string;
  email: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  status: SmtpStatus;
  is_locked: boolean;
  last_verified_at: string | null;
  created_at: string;
};

export type SmtpCreatePayload = {
  email: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
};
