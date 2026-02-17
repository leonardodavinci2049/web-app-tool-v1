export type OrganizationMemberRole =
  | "owner"
  | "manager"
  | "salesperson"
  | "operator"
  | "cashier"
  | "finance"
  | "shipping"
  | "customer";

export type Account = {
  id: string;
  accountId: string;
  providerId: string;
  userId: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  idToken?: string | null;
  accessTokenExpiresAt?: Date | null;
  refreshTokenExpiresAt?: Date | null;
  scope?: string | null;
  password?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Organization = {
  id: string;
  system_id?: number | null;
  name: string;
  slug?: string | null;
  logo?: string | null;
  metadata?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  member?: Member[];
};

export type User = {
  id: string;
  person_id?: number | null;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  twoFactorEnabled: boolean;
  role?: string | null;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: Date | null;
};

export type Member = {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  active_organization?: number | null;
  metadata?: string | null;
  user?: User;
};

export type Session = {
  id: string;
  expiresAt: Date;
  token?: string | null;
  createdAt: Date;
  updatedAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
  userId: string;
  impersonatedBy?: string | null;
  activeOrganizationId?: string | null;
  activeTeamId?: string | null;
};

export type Invitation = {
  id: string;
  organizationId: string;
  teamId?: string | null;
  email: string;
  role?: string | null;
  status: string;
  expiresAt: Date;
  inviterId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TwoFactor = {
  id: string;
  userId: string;
  secret?: string | null;
  backupCodes: string;
};

export type Verification = {
  id: string;
  identifier?: string | null;
  value?: string | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type Subscription = {
  id: string;
  userId: string;
  plan: string;
  status: string;
  approvedAt?: Date | null;
  createdAt: Date;
};

export type Team = {
  id: string;
  name?: string | null;
  organizationId: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export type TeamMember = {
  id: string;
  teamId: string;
  userId: string;
  createdAt?: Date | null;
};

export type OrganizationRole = {
  id: string;
  organizationId: string;
  organizationRolecol?: string | null;
  role?: string | null;
  permission?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export type TblApp = {
  id: number;
  name?: string | null;
  description?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export type TblModule = {
  module_id: number;
  userId?: string | null;
  module?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export type TblMemberRole = {
  id: number;
  uuid?: string | null;
  role?: string | null;
  name?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export type LogLogin = {
  log_id: number;
  app_id?: number | null;
  organization_Id?: string | null;
  user_id?: string | null;
  user_name?: string | null;
  module_id?: number | null;
  record_id?: string | null;
  log?: string | null;
  note?: string | null;
  createdAt?: Date | null;
};

export type LogOperation = {
  log_id: number;
  app_id?: number | null;
  app_name?: string | null;
  organization_Id?: string | null;
  organization_name?: string | null;
  user_id?: string | null;
  user_name?: string | null;
  module_id?: number | null;
  record_id?: string | null;
  log?: string | null;
  note?: string | null;
  createdAt?: Date | null;
};
