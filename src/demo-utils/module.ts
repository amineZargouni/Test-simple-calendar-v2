import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'angular-calendar';
import { CalendarHeaderComponent } from './calendar-header.component';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  imports: [CommonModule, FormsModule, CalendarModule,],
  declarations: [CalendarHeaderComponent],
  exports: [CalendarHeaderComponent],
})
export class DemoUtilsModule {}
