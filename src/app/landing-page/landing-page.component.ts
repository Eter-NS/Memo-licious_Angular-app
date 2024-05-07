import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SocialMediaListComponent } from '../reusable/ui/social-media-list/social-media-list.component';
import { ShoppingBagsEmojiComponent } from '../reusable/ui/SVGs/shopping-bags-emoji/shopping-bags-emoji.component';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SocialMediaListComponent, ShoppingBagsEmojiComponent, RouterLink],
})
export class LandingPageComponent {}
