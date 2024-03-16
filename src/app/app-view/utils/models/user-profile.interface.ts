export interface UserProfile {
  name: string;
  photoUrl?: string | null | undefined;
  email?: string;
  profileColor?: string;
  authOption: 'password' | 'pin';
}
