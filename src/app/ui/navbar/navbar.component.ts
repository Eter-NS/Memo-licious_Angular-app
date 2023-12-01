import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import throttle from 'src/app/reusable/data-tools/listenerMethods';

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
    MatListModule,
    MatIconModule,
    CommonModule,
  ],
})
export class NavbarComponent implements OnInit {
  #breakpointObserver = inject(BreakpointObserver);
  isDarkMode = false;

  ngOnInit(): void {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener(
      'change',
      throttle((e: Event) => {
        if (e instanceof MediaQueryListEvent) this.isDarkMode = !e.matches;
      }, 1000 / 30)
    );
  }

  isHandset$: Observable<boolean> = this.#breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );
}
