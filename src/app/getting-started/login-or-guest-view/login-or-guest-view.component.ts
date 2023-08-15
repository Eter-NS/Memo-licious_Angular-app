import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  addAnimations,
  removeAnimations,
} from 'src/app/animations/animation-tools';
import { runWithDelay } from 'src/app/animations/animation-triggers';

@Component({
  selector: 'app-login-or-guest-view',
  templateUrl: './login-or-guest-view.component.html',
  styleUrls: ['./login-or-guest-view.component.scss'],
})
export class LoginOrGuestViewComponent implements OnInit {
  @ViewChild('container') hostElement!: ElementRef<HTMLElement>;
  svgSize!: string;
  rippleColor = '';

  private router = inject(Router);

  ngOnInit(): void {
    this.changeSVGSize(); // Setting the SVG size after component initial
  }

  @HostListener('window:resize')
  private changeSVGSize() {
    const svgPercentSizeInViewport = 0.6,
      minimumSize = 225,
      maximumSize = 400;
    let chosenValue: number;

    // Takes smaller viewport size as the size of the SVG
    window.innerHeight >= window.innerWidth
      ? (chosenValue = window.innerWidth)
      : (chosenValue = window.innerHeight);

    const value = chosenValue * svgPercentSizeInViewport;

    this.svgSize =
      value < minimumSize
        ? minimumSize.toString()
        : value > maximumSize
        ? maximumSize.toString()
        : value.toString();
  }

  runTransition(suffix: string) {
    removeAnimations(
      this.hostElement.nativeElement,
      'fadeIn-vol-2-animation',
      true
    );
    addAnimations(this.hostElement.nativeElement, 'fade-out-animation', true);

    runWithDelay(this.hostElement.nativeElement.children, {
      reverse: true,
      timeoutTime: 1000,
    })
      .then(() => {
        this.router.navigateByUrl(suffix);
      })
      .catch((err) => {
        console.error(err);
      });
  }
}
