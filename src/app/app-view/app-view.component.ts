import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthAccountService } from '../auth-components/services/account/auth-account.service';

@Component({
  templateUrl: './app-view.component.html',
  styleUrls: ['./app-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppViewComponent {
  authAccountService = inject(AuthAccountService);
}
