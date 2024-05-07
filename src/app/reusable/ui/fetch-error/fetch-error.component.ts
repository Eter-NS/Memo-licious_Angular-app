import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Output,
  Renderer2,
  ViewChild,
  inject,
} from '@angular/core';

@Component({
  selector: 'app-fetch-error',
  standalone: true,
  templateUrl: './fetch-error.component.html',
  styleUrl: './fetch-error.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FetchErrorComponent implements AfterViewInit {
  renderer = inject(Renderer2);
  @Output() clicked = new EventEmitter<void>();

  @ViewChild('message')
  message!: ElementRef<Node>;

  @HostBinding('role') get role() {
    return 'paragraph';
  }

  ngAfterViewInit(): void {
    const messageElement = this.message.nativeElement;
    console.log(typeof messageElement);

    if (!messageElement.textContent?.trim().length) {
      this.renderer.appendChild(
        messageElement,
        this.renderer.createText('Something went wrong.')
      );
    }
  }
}
