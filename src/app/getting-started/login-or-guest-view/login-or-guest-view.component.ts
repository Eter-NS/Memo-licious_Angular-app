import { Component, HostListener, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-or-guest-view',
  templateUrl: './login-or-guest-view.component.html',
  styleUrls: ['./login-or-guest-view.component.scss'],
})
export class LoginOrGuestViewComponent implements OnInit {
  svgSize!: string;
  rippleColor = '';

  private router = inject(Router);

  ngOnInit(): void {
    this.changeSVGSize(); // Setting the SVG size after component initial
  }

  @HostListener('window:resize')
  private changeSVGSize() {
    const svgPercentSizeInViewport = 0.6,
      minimumSize = 225;
    let chosenValue: number;

    window.innerHeight >= window.innerWidth
      ? (chosenValue = window.innerWidth)
      : (chosenValue = window.innerHeight);

    const value = chosenValue * svgPercentSizeInViewport;

    this.svgSize =
      value >= minimumSize ? value.toString() : minimumSize.toString();
  }

  goGuestPath() {}
  goOnlinePath() {}
}
