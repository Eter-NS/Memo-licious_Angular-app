import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  Input,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { AsyncPipe, NgStyle, NgTemplateOutlet } from '@angular/common';
import { ViewportListenersService } from 'src/app/reusable/data-access/viewport-listeners/viewport-listeners.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    NgTemplateOutlet,
    AsyncPipe,
    NgStyle,
  ],
})
export class NavbarComponent {
  viewportListenersService = inject(ViewportListenersService);

  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() sidenavColor: string = '';

  @ContentChild('logo') logo!: TemplateRef<unknown>;
  @ContentChild('sidenavHeading') sidenavHeading!: TemplateRef<unknown>;
  @ContentChild('sidenavLinks') sidenavLinks!: TemplateRef<unknown>;
  @ContentChild('content') content!: TemplateRef<unknown>;

  @ViewChild('drawer') drawer!: MatSidenav;
}
