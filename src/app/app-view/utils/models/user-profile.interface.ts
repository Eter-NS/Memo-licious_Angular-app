import { AuthOptions } from 'src/app/auth/utils/Models/LocalAuthModels.interface';

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
}

export interface UserProfileChangesWithImageI extends UserProfileChangesI {
  photoBlob?: PhotoBlob;
}
