import { LocalUserAuth } from 'src/app/auth/services/Models/LocalAuthModels.interface';
import { RegisterCustomOptions } from 'src/app/auth/services/Models/OnlineAuthModels.interface';

export interface UpdateUserInterface {
  local: LocalUserAuth;
  online: RegisterCustomOptions;
}
