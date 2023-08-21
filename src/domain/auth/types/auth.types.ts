export type JwtPayload = {
  email: string;
  userId: string;
};

export type JwtPayloadWithRefreshedToken = JwtPayload & {
  refreshToken: string;
}; // extend JwtPayload properties to JwtPayloadWithRefreshedToken

export type ICreateTokens = {
  accessToken: string;
  refreshToken: string;
};
