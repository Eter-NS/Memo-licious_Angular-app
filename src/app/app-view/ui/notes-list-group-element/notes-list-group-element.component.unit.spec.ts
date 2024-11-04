/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotesListGroupElementComponent } from './notes-list-group-element.component';
import { Component, Input, Provider } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {
  NoteGroupModel,
  NoteModel,
} from 'src/app/auth/utils/Models/UserDataModels.interface';
import { By } from '@angular/platform-browser';
import * as tools from 'src/app/reusable/utils/data-tools/objectTools';
import { MatMenu } from '@angular/material/menu';

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
  template: `
    <p>Testing NotesListGroupElement component</p>

    <app-notes-list-group-element [group]="group" [done]="!!group.deleteAt" />
  `,
  imports: [NotesListGroupElementComponent],
})
class TestComponent {
  @Input() group: NoteGroupModel = exampleNoteGroupModel;
}

describe('NotesListGroupElementComponent', () => {
  // Mocks
  let clickEventMock: jasmine.SpyObj<Event>;

  let component: NotesListGroupElementComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
    clickEventMock = jasmine.createSpyObj<Event>([
      'preventDefault',
      'stopPropagation',
    ]);
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotesListGroupElementComponent],
      providers: [provideNoopAnimations()] as Provider[],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    component = fixture.debugElement.query(
      By.directive(NotesListGroupElementComponent)
    ).componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe(`view`, () => {
    it(`should not have the .to-delete class if done is false`, () => {
      // Act
      const cardElement = fixture.debugElement.query(
        By.css(`[data-test="note-list-card"]`)
      ).nativeElement as HTMLElement;

      // Assert
      expect(cardElement.classList.contains(`to-delete`)).toBeFalsy();
    });

    it(`should have the .to-delete class if done is true`, () => {
      // Arrange
      fixture.componentRef.setInput('group', {
        ...exampleNoteGroupModel,
        deleteAt: Date.now() + 1000 * 60 * 30, // 30 minutes from now
      });
      fixture.detectChanges();

      // Act
      const cardElement = fixture.debugElement.query(
        By.css(`[data-test="note-list-card"]`)
      ).nativeElement as HTMLElement;

      // Assert
      expect(cardElement.classList.contains(`to-delete`)).toBeTruthy();
    });

    it(`should call onCardClick and emit cardClick when card is clicked`, () => {
      // Arrange
      const onCardClickSpy = spyOn(component, 'onCardClick').and.callThrough();
      const emitSpy = spyOn(component.cardClick, 'emit').and.callThrough();

      // Act
      const cardElement = fixture.debugElement.query(
        By.css(`[data-test="note-list-card"]`)
      );
      cardElement.triggerEventHandler('click', clickEventMock);

      // Assert
      expect(onCardClickSpy).toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalled();
    });

    describe(`header`, () => {
      it(`should display the group's title in h3 tag.`, () => {
        // Arrange

        // Act
        const h3 = fixture.debugElement.query(By.css('h3'));

        // Assert
        expect(h3.nativeElement.textContent).toBe(exampleNoteGroupModel.title);
      });

      it(`should call stopPropagation if the button next to the title is clicked.`, () => {
        // Arrange
        const stopPropagationSpy = spyOn(
          component as any,
          'stopPropagation'
        ).and.callThrough();
        const button = fixture.debugElement.query(
          By.css(`[data-test="menu-button-toggle"]`)
        );

        // Act
        button.triggerEventHandler('click', clickEventMock);

        // Assert
        expect(stopPropagationSpy).toHaveBeenCalled();
      });

      it(`should show a menu after clicking the button next to the title is clicked.`, async () => {
        // Arrange
        const buttonElement = fixture.debugElement.query(
          By.css(`[data-test="menu-button-toggle"]`)
        );

        // Act
        buttonElement.triggerEventHandler('click', clickEventMock);

        const menuElement = fixture.debugElement.query(By.directive(MatMenu));

        await fixture.whenStable();

        // Assert
        expect(menuElement).toBeTruthy();
      });

      it(`should show a menu item able to toggle group remove when menu is open.`, async () => {
        // Arrange
        const buttonElement = fixture.debugElement.query(
          By.css(`[data-test="menu-button-toggle"]`)
        );
        buttonElement.triggerEventHandler('click', clickEventMock);

        await fixture.whenStable();

        // Act
        const toggleGroupButton = fixture.debugElement.query(
          By.css(`[data-test="menu-option-toggle-remove"]`)
        ).nativeElement;

        // Assert
        expect(toggleGroupButton).toBeTruthy();
      });

      it(`should call toggleRemoveGroup and emit toggleRemove when toggle group button is clicked.`, async () => {
        // Arrange
        const toggleRemoveGroupSpy = spyOn(
          component,
          'toggleRemoveGroup'
        ).and.callThrough();
        const emitSpy = spyOn(component.toggleRemove, 'emit').and.callThrough();

        const buttonElement = fixture.debugElement.query(
          By.css(`[data-test="menu-button-toggle"]`)
        );
        buttonElement.triggerEventHandler('click', clickEventMock);

        await fixture.whenStable();

        const toggleGroupButton = fixture.debugElement.query(
          By.css(`[data-test="menu-option-toggle-remove"]`)
        );

        // Act
        toggleGroupButton.triggerEventHandler('click', clickEventMock);

        // Assert
        expect(toggleRemoveGroupSpy).toHaveBeenCalled();
        expect(emitSpy).toHaveBeenCalledWith(true);
      });
    });

    describe(`chip-container`, () => {
      it(`should show all the notes inside note group.`, () => {
        // Arrange

        // Act
        const noteChipElements = fixture.debugElement.queryAll(
          By.css(`[data-test="chip-container"] > *`)
        );

        // Assert
        expect(noteChipElements.length).toBe(
          exampleNoteGroupModel.notes.length
        );
        expect(
          noteChipElements.every(
            (chip, i) =>
              chip.nativeElement.innerText ===
              exampleNoteGroupModel.notes[i].value
          )
        ).toBeTrue();
      });

      it(`should apply .do-not-grow class when chip container has less than 3 children.`, () => {
        // Arrange

        // Act
        const noteChipElements = fixture.debugElement.queryAll(
          By.css(`[data-test="chip-container"] > *`)
        );

        // Assert
        expect(
          noteChipElements.every((chip) => chip.classes['do-not-grow'])
        ).toBeTrue();
      });

      it(`should not apply .do-not-grow class when chip container has three children or more.`, () => {
        // Arrange
        const newGroup: NoteGroupModel = {
          ...exampleNoteGroupModel,
          notes: [
            ...exampleNoteGroupModel.notes,
            {
              id: 'note-2',
              createdAt: Date.now(),
              value: 'This is a note 2',
            },
            {
              id: 'note-3',
              createdAt: Date.now(),
              value: 'This is a note 3',
            },
          ],
        };
        fixture.componentRef.setInput('group', newGroup);
        fixture.detectChanges();

        // Act
        const noteChipElements = fixture.debugElement.queryAll(
          By.css(`[data-test="chip-container"] > *`)
        );

        // Assert
        expect(
          noteChipElements.every((chip) => !chip.classes['do-not-grow'])
        ).toBeTrue();
        expect(
          noteChipElements.every(
            (chip, i) =>
              chip.nativeElement.innerText === newGroup.notes[i].value
          )
        ).toBeTrue();
      });
    });
  });

  describe(`methods`, () => {
    describe(`onCardClick()`, () => {
      it(`should emit cardClick event.`, () => {
        // Arrange
        const emitSpy = spyOn(component.cardClick, 'emit').and.callThrough();

        // Act
        component.onCardClick(clickEventMock);

        // Assert
        expect(emitSpy).toHaveBeenCalled();
      });
    });

    describe(`toggleRemoveGroup()`, () => {
      it(`should emit toggleRemove event with negated value of 'done' input.`, () => {
        // Arrange
        const emitSpy = spyOn(component.toggleRemove, 'emit').and.callThrough();

        // Act
        component.toggleRemoveGroup(clickEventMock);

        // Assert
        expect(emitSpy).toHaveBeenCalledWith(!exampleNoteGroupModel.deleteAt);
      });
    });

    describe(`stopPropagation()`, () => {
      it(`should call stopPropagation for Event object parameter`, () => {
        // Arrange
        const stopPropagationSpy = clickEventMock.stopPropagation;

        // Act
        component['stopPropagation'](clickEventMock);

        // Assert
        expect(stopPropagationSpy).toHaveBeenCalled();
      });
    });
  });
});
