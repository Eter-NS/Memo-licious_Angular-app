import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-web-header',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    RouterLink,
  ],
  templateUrl: './web-header.component.html',
  styleUrls: ['./web-header.component.scss'],
})
export class WebHeaderComponent {}
