import {
  DeferBlockBehavior,
  DeferBlockFixture,
  DeferBlockState,
  TestBed,
} from '@angular/core/testing';

import { AppRecycleBinComponent } from './app-recycle-bin.page.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Provider } from '@angular/core';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import { By } from '@angular/platform-browser';

describe('AppRecycleBinComponent', () => {
  let harness: RouterTestingHarness;
  let component: AppRecycleBinComponent;

  let deferBlock: DeferBlockFixture;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      deferBlockBehavior: DeferBlockBehavior.Manual,
      imports: [NoopAnimationsModule, AppRecycleBinComponent],
      providers: [
        provideRouter([
          {
            path: 'recycle-bin',
            loadComponent: () =>
              import('./app-recycle-bin.page.component').then(
                (c) => c.AppRecycleBinComponent
              ),
          },
        ]),
        provideLocationMocks(),
      ] as Provider[],
    }).compileComponents();

    harness = await RouterTestingHarness.create();
    component = await harness.navigateByUrl(
      '/recycle-bin',
      AppRecycleBinComponent
    );
    harness.detectChanges();
  });

  beforeEach(async () => {
    deferBlock = (await harness.fixture.getDeferBlocks())[0];
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(`should show a mat-spinner when NoteGroupListContainer component is being loaded.`, async () => {
    // Act
    await deferBlock.render(DeferBlockState.Loading);
    const matSpinner = harness.routeDebugElement?.query(
      By.css(`[data-test="note-group-list-container-loading-spinner"]`)
    );

    // Assert
    expect(matSpinner).not.toBeUndefined();
  });

  it(`should show the NoteGroupListContainer component when it's loaded successfully.`, async () => {
    // Act
    await deferBlock.render(DeferBlockState.Complete);
    const noteGroupListContainer = harness.routeDebugElement?.query(
      By.css(`[data-test="note-group-list-container"]`)
    );

    // Assert
    expect(noteGroupListContainer).not.toBeUndefined();
  });
});
