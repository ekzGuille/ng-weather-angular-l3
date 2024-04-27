import { Component, ContentChild, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
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
export class TabGroupComponent<T> implements OnChanges {
  @Input({ required: true }) elements: T[];
  @Output() removedElement = new EventEmitter<T>();

  @ContentChild(TabGroupHeaderDirective) header: TabGroupHeaderDirective<T>;
  @ContentChild(TabGroupContentDirective) content: TabGroupHeaderDirective<T>;

  selectedIndex = 0;

 ngOnChanges(changes: SimpleChanges) {
   if(changes!== undefined) {
     if (changes['elements']) {
       this.selectedIndex = 0;
     }
   }
 }

  selectItem(index: number) {
    this.selectedIndex = index;
  }

  removeElement(event: MouseEvent, index: number) {
    event.stopPropagation();
    this.removedElement.emit(this.elements[index]);
    if (index === this.selectedIndex) {
      this.selectedIndex = 0;
    }
  }
}
