import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  OnInit,
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
export class FetchErrorComponent implements OnInit {
  renderer = inject(Renderer2);
  @Output() clicked = new EventEmitter<void>();

  @ViewChild('message', { static: true })
  messageRef!: ElementRef<Node>;

  @HostBinding('role') get role() {
    return 'paragraph';
  }

  ngOnInit(): void {
    const messageElement = this.messageRef.nativeElement;
    console.log(typeof messageElement);

    if (!messageElement.textContent?.trim().length) {
      this.renderer.appendChild(
        messageElement,
        this.renderer.createText('Something went wrong.')
      );
    }
  }
}
