/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { NoteListFormComponent } from './note-list-form.component';
import { Component, Input, Provider } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {
  NoteGroupModel,
  NoteModel,
} from 'src/app/auth/utils/Models/UserDataModels.interface';
import { By } from '@angular/platform-browser';
import * as tools from 'src/app/reusable/utils/data-tools/objectTools';
import { HarnessLoader, TestKey } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import {
  MatChipEditInputHarness,
  MatChipInputHarness,
  MatChipRemoveHarness,
  MatChipRowHarness,
} from '@angular/material/chips/testing';
import { MatChipInputEvent } from '@angular/material/chips';
import { getElement } from 'src/app/reusable/utils/testing/utils/getElement';
import { setFormInputValue } from 'src/app/reusable/utils/testing/utils/setFormInputValue';

const exampleNoteModel: NoteModel = {
  id: tools.randomId(27),
  createdAt: Date.now(),
  value: 'XYZ',
};

const exampleNoteGroupModel: NoteGroupModel = {
  id: tools.randomId(27),
  createdAt: Date.now(),
  title: 'Hello World',
  notes: [exampleNoteModel],
};

@Component({
  standalone: true,
  selector: 'app-test',
  imports: [NoteListFormComponent],
  template: `
    <p>Testing NoteListForm component</p>

    <app-note-list-form
      [notes]="group.notes"
      [environment]="environment"
      [noteListTitle]="group.title"
      (createNote)="addNote($event)"
    />
  `,
})
class TestComponent {
  @Input() group: NoteGroupModel = exampleNoteGroupModel;
  @Input() environment = 'note-creator';

  addNote(event: MatChipInputEvent) {
    this.group = {
      ...this.group,
      notes: [
        ...this.group.notes,
        { value: event.value, createdAt: Date.now(), id: tools.randomId(27) },
      ],
    };
  }
}

describe('NoteListFormComponent - template', () => {
  // dependencies

  // Component
  let loader: HarnessLoader;
  let fixture: ComponentFixture<TestComponent>;
  let component: NoteListFormComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoteListFormComponent],
      providers: [provideNoopAnimations()] as Provider[],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);

    fixture.detectChanges();
    await fixture.whenStable();

    loader = TestbedHarnessEnvironment.loader(fixture);

    component = fixture.debugElement.query(
      By.directive(NoteListFormComponent)
    ).componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe(`Form structure`, () => {
    it(`should submit form when submit button is clicked.`, async () => {
      // Arrange
      const submitFormSpy = spyOn(component, 'submitForm').and.callThrough();

      const createNoteInputHarness = await loader.getHarness(
        MatChipInputHarness.with({
          selector: `[data-test="create-note-input"]`,
        })
      );

      const groupTitleInputElement = getElement<
        TestComponent,
        HTMLInputElement
      >(fixture, `[data-test="note-list-title-input"]`);

      // Reset the amount of notes
      fixture.componentRef.setInput('group', {
        ...exampleNoteGroupModel,
        title: '',
        notes: [],
      } satisfies NoteGroupModel);
      fixture.detectChanges();
      await fixture.whenStable();

      // Act
      // Add a title
      setFormInputValue(groupTitleInputElement, 'a test group title');
      fixture.detectChanges();
      await fixture.whenStable();

      // Add a new note
      await createNoteInputHarness.focus();
      await createNoteInputHarness.setValue('Test note');
      await createNoteInputHarness.sendSeparatorKey(TestKey.ENTER);

      const submitButton = getElement<TestComponent, HTMLButtonElement>(
        fixture,
        `[data-test="note-creator-submit-button"]`
      );

      submitButton.click();
      fixture.detectChanges();
      await fixture.whenStable();

      // Assert
      expect(submitFormSpy).toHaveBeenCalled();
    });
  });

  describe(`Title Input`, () => {
    it(`should display required error message when title is empty.`, async () => {
      // Arrange
      const groupTitleInputElement = getElement<
        TestComponent,
        HTMLInputElement
      >(fixture, `[data-test="note-list-title-input"]`);

      // Act
      setFormInputValue(groupTitleInputElement, '');
      fixture.detectChanges();
      await fixture.whenStable();

      const errorMessageElement = fixture.debugElement.query(
        By.css(`[data-test="note-list-title-error-required"]`)
      );

      // Assert
      expect(errorMessageElement).toBeTruthy();
      expect(
        component.newNoteGroupForm.get('groupName')?.errors?.['required']
      ).toBeTruthy();
      expect(component.newNoteGroupForm.get('groupName')?.touched).toBeTruthy();
    });

    it(`should display maxlength error message whe title exceeds length limit.`, async () => {
      // Arrange
      const groupTitleInputElement = getElement<
        TestComponent,
        HTMLInputElement
      >(fixture, `[data-test="note-list-title-input"]`);

      // Act
      setFormInputValue(groupTitleInputElement, tools.randomId(36));
      fixture.detectChanges();
      await fixture.whenStable();

      const errorMessageElement = fixture.debugElement.query(
        By.css(`[data-test="note-list-title-error-maxlength"]`)
      );

      // Assert
      expect(errorMessageElement).toBeTruthy();
      expect(
        component.newNoteGroupForm.get('groupName')?.errors?.['maxlength']
      ).toBeTruthy();
      expect(component.newNoteGroupForm.get('groupName')?.touched).toBeTruthy();
    });
  });

  describe(`Note List`, () => {
    it(`should display all notes as mat-chip-row elements.`, () => {
      // Arrange

      // Act
      const noteElements = fixture.debugElement.queryAll(
        By.css(`[data-test-many="note-chip"]`)
      );

      // Assert
      expect(noteElements.length).toBeGreaterThanOrEqual(1);
    });

    it(`should emit removeNote event when chip remove button is clicked.`, async () => {
      // Arrange
      const emitSpy = spyOn(component.removeNote, 'emit').and.callThrough();

      const chipRemoveButton = await loader.getHarness(
        MatChipRemoveHarness.with({
          selector: `[data-test="note-chip-${exampleNoteGroupModel.notes[0].id}"] button[matChipRemove]`,
        })
      );

      // Act
      await chipRemoveButton.click();

      // Assert
      expect(emitSpy).toHaveBeenCalled();
    });

    it(`should emit editNote event when chip is edited.`, async () => {
      // Arrange
      const emitSpy = spyOn(component.editNote, 'emit').and.callThrough();

      const noteChipHarness = await loader.getHarness(
        MatChipRowHarness.with({
          selector: `[data-test="note-chip-${exampleNoteGroupModel.notes[0].id}"]`,
        })
      );

      // Act
      await noteChipHarness.startEditing();
      await (
        await noteChipHarness.getHarness(MatChipEditInputHarness)
      ).setValue('An edited note');
      await noteChipHarness.finishEditing();

      // Assert
      expect(emitSpy).toHaveBeenCalled();
    });

    it(`should call handleMobileEdit when long press is detected on a chip.`, fakeAsync(async () => {
      // Arrange
      const handleMobileEditSpy = spyOn(
        component,
        'handleMobileEdit'
      ).and.callThrough();

      const eventObject = jasmine.createSpyObj<PointerEvent>([
        'preventDefault',
        'stopPropagation',
      ]);

      const noteChipElement = fixture.debugElement.query(
        By.css(`[data-test="note-chip-${exampleNoteGroupModel.notes[0].id}"]`)
      );

      // Act
      noteChipElement.triggerEventHandler('pointerdown', eventObject);
      tick(500);
      noteChipElement.triggerEventHandler('pointerup', eventObject);

      // Assert
      expect(handleMobileEditSpy).toHaveBeenCalledWith(
        exampleNoteGroupModel.notes[0].id
      );
      await expectAsync(
        (
          await loader.getHarness(
            MatChipRowHarness.with({
              selector: `[data-test="note-chip-${exampleNoteGroupModel.notes[0].id}"]`,
            })
          )
        ).isEditing()
      ).toBeResolvedTo(true);
    }));
  });

  describe(`Environment-specific`, () => {
    it(`should show the h2 tag when environment is 'note-creator'.`, () => {
      // Arrange
      fixture.componentRef.setInput('environment', 'note-creator');
      fixture.detectChanges();

      // Act
      const h2Element = fixture.debugElement.query(By.css('h2'));

      // Assert
      expect(h2Element).toBeTruthy();
    });

    it(`should show submit button only when environment is 'note-creator' and notes exist.`, () => {
      // Act
      const submitButtonElement = fixture.debugElement.query(
        By.css(`[data-test="note-creator-submit-button"]`)
      );

      // Assert
      expect(component.notes.length).toBeGreaterThanOrEqual(1);
      expect(component.environment).toEqual('note-creator');
      expect(submitButtonElement).toBeTruthy();
    });
  });

  describe(`Error Handling`, () => {
    it(`should display validation error message when noteFormValidation.errorMessage$ emits.`, async () => {
      // Arrange
      const beforeErrorMessageEmit = fixture.debugElement.query(
        By.css(`[data-test="note-error-message"]`)
      );

      // Act
      const createNoteInputHarness = await loader.getHarness(
        MatChipInputHarness.with({
          selector: `[data-test="create-note-input"]`,
        })
      );

      await createNoteInputHarness.focus();
      await createNoteInputHarness.setValue(tools.randomId(35));
      await createNoteInputHarness.sendSeparatorKey(TestKey.COMMA);

      const afterErrorMessageEmit = fixture.debugElement.query(
        By.css(`[data-test="note-error-message"]`)
      );

      // Assert
      expect(beforeErrorMessageEmit).toBeFalsy();
      expect(afterErrorMessageEmit).toBeTruthy();
    });
  });

  describe(`Accessibility`, () => {
    it(`should have proper aria-labels on chip remove buttons.`, () => {
      const notes = [...component.notes];

      notes.forEach((note) => {
        // Act
        const chipRemoveButton = fixture.debugElement.query(
          By.css(`[aria-label="Remove ${note.value}"]`)
        );

        // Assert
        expect(chipRemoveButton).toBeTruthy();
      });
    });
  });
});
