type AuthResponse = {
  username: string;
  id: string;
};

type JwtPayload = {
  id: string;
  username: string;
};

export { AuthResponse, JwtPayload };
