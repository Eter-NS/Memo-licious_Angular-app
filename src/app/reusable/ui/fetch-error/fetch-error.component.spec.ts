import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FetchErrorComponent } from './fetch-error.component';
import { Component, Input } from '@angular/core';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { FetchErrorHarness } from './fetch-error.harness';

describe('FetchErrorComponent', () => {
  @Component({
    selector: 'app-fetch-error-wrapper',
    standalone: true,
    imports: [FetchErrorComponent],
    template: ` <app-fetch-error>
      @if(errorMessage){
      {{ errorMessage }}
      }
    </app-fetch-error>`,
  })
  class FetchErrorWrapperComponent {
    @Input() errorMessage?: string;
  }

  let fixture: ComponentFixture<FetchErrorComponent>;
  let wrapperFixture: ComponentFixture<FetchErrorWrapperComponent>;
  let component: FetchErrorComponent;
  let harness: FetchErrorHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FetchErrorWrapperComponent, FetchErrorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FetchErrorComponent);
    wrapperFixture = TestBed.createComponent(FetchErrorWrapperComponent);
    component = fixture.componentInstance;
    const loader = TestbedHarnessEnvironment.loader(wrapperFixture);
    harness = await loader.getHarness(FetchErrorHarness);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(harness).toBeTruthy();
  });
});
