export interface User {
  id: string;
  employeeId: string;
  name: string;
  role: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}
