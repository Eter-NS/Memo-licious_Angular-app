import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

export function getElement<T, K extends HTMLElement>(
  fixture: ComponentFixture<T>,
  selector: string
): K {
  return fixture.debugElement.query(By.css(selector)).nativeElement as K;
}
