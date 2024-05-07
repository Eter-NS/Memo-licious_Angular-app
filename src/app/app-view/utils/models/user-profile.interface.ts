import { AuthOptions } from 'src/app/auth/services/Models/LocalAuthModels.interface';

export interface PhotoBlob {
  extension: string;
  blob: File;
}

export interface UserProfile {
  name: string;
  photoUrl?: string | null | undefined;
  email?: string;
  profileColor?: string;
  authOption: AuthOptions;
}

export interface UserProfileChangesI extends UserProfile {
  oldEmail?: string;
  oldPassphrase?: string;
  passphrase?: string;
  photoBlob?: PhotoBlob;
}
