export type AuthUser = {
  email: string;
  password: string;
  firstName?: string;
};

export type AuthPayload = {
  userId: string;
};

export type RequestWhithUser = {
  user: AuthPayload;
};
