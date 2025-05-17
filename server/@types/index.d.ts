// ====== USER PARAMS
export type CreateUserParams = {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  adminInviteToken?: string;
};

export type UpdateUserParams = {
  name: string;
  avatar?: string;
};