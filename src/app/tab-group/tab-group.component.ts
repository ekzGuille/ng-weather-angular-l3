import { Component, ContentChild, EventEmitter, Input, Output } from '@angular/core';
import { TabGroupContentDirective } from './content/tab-group-content.directive';
import { TabGroupHeaderDirective } from './header/tab-group-header.directive';
import { NgClass, NgForOf, NgIf, NgTemplateOutlet } from '@angular/common';


@Component({
  selector: 'app-tab-group',
  templateUrl: './tab-group.component.html',
  styleUrl: './tab-group.component.css',
  imports: [TabGroupContentDirective, TabGroupHeaderDirective, NgTemplateOutlet, NgIf, NgForOf, NgClass],
  standalone: true,
})
export class TabGroupComponent<T> {
  @Input({ required: true }) elements: T[];
  @Output() removedElement = new EventEmitter<T>();

  @ContentChild(TabGroupHeaderDirective) header: TabGroupHeaderDirective<T>;
  @ContentChild(TabGroupContentDirective) content: TabGroupHeaderDirective<T>;

  private readonly LAST_SELECTED_INDEX_KEY = 'last_selected_index'

  selectedIndex = Number(window.localStorage.getItem(this.LAST_SELECTED_INDEX_KEY) ?? 0);

  selectItem(index: number) {
    this.selectedIndex = index;
    window.localStorage.setItem(this.LAST_SELECTED_INDEX_KEY, index.toString());
  }

  removeElement(event: MouseEvent, index: number) {
    event.stopPropagation();
    this.removedElement.emit(this.elements[index]);
    if (index === this.selectedIndex) {
      this.selectedIndex = 0;
      window.localStorage.setItem(this.LAST_SELECTED_INDEX_KEY, this.selectedIndex.toString());
    } else if (index < this.selectedIndex) {
      this.selectedIndex = this.selectedIndex - 1;
      window.localStorage.setItem(this.LAST_SELECTED_INDEX_KEY, this.selectedIndex.toString());
    }
  }
}
