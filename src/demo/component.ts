import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { map } from 'rxjs/operators';

import { HttpClient, } from '@angular/common/http';

import {


  subDays,
  addDays,



  addHours,
} from 'date-fns';
import {
  isSameMonth,
  isSameDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  format,
} from 'date-fns';

import { Observable } from 'rxjs';

import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView,
} from 'angular-calendar';
import { WebSocketAPI } from './WebSocketAPI';
import { EventServiceService } from './services/event-service.service';
import { env } from 'process';
import { Content } from '@angular/compiler/src/render3/r3_ast';
import { FormControl } from '@angular/forms';
import {COMMA, ENTER} from '@angular/cdk/keycodes';


import { ElementRef} from '@angular/core';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatChipInputEvent} from '@angular/material/chips';
import { startWith} from 'rxjs/operators';

interface Fruit {
  name: string;
}


interface User {
  id?: number;
  name:string;
}


const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
};

interface Meeting {
  id?: number;
  text: string;
  day: string;
  reminder: boolean,
  start: Date,
  end?:Date,
  users?:User[];
}



@Component({
  selector: 'mwl-demo-component',
  /*  changeDetection: ChangeDetectionStrategy.OnPush, */
  styleUrls: ['styles.css'],
  templateUrl: 'template.html',
})
export class DemoComponent {
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  fruitCtrl = new FormControl();
  filteredFruits!: Observable<string[]>;
  fruits: string[] = ['Lemon'];
  users!: User[];
  userNames!: string[];
  allFruits: string[] = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry', 'Lemon', 'Lime', 'Orange', 'Strawberry', 'Lemon', 'Lime', 'Orange', 'Strawberry', 'Lemon', 'Lime', 'Orange', 'Strawberry', 'Lemon', 'Lime', 'Orange', 'Strawberry', 'Lemon', 'Lime', 'Orange', 'Strawberry'];

  @ViewChild('fruitInput')
  fruitInput!: ElementRef<HTMLInputElement>;

  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any> | undefined;
  

  webSocketAPI: WebSocketAPI = new WebSocketAPI();
  greeting: any;
  name: string | undefined;
  events$!: Observable<CalendarEvent<{ film: Meeting; }>[]>;
  events: CalendarEvent<{ film: Meeting; }>[] = [];


  ngOnInit() {
    this.eventService.getUsers().subscribe((users)=>{this.users = users;
      console.log(users);
      this.userNames = users.map( (user)=>{ 
        return user.name; 
       });
    this.fetchEvents();
    

    

    })
    /*  this.connect(); */
  }

  connect() {
    this.webSocketAPI._connect();
  }

  disconnect() {
    this.webSocketAPI._disconnect();
  }

  sendMessage(message: string) {
    this.webSocketAPI._send(message);
  }

  handleMessage() {
    this.greeting = "pls";

    console.log("hedha " + this.greeting);
  }

  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  viewDate: Date = new Date();


  modalData: {
    action: string;
    event: CalendarEvent;
  } | undefined;

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fas fa-fw fa-pencil-alt"></i>',
      a11yLabel: 'Edit',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      },
    },
    {
      label: '<i class="fas fa-fw fa-trash-alt"></i>',
      a11yLabel: 'Delete',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events?.filter((iEvent) => iEvent !== event);
        this.handleEvent('Deleted', event);
      },
    },
  ];

  refresh: Subject<any> = new Subject();

  /* events: CalendarEvent[] = [
    {
      start: subDays(startOfDay(new Date()), 1),
      end: addDays(new Date(), 1),
      title: 'A 3 day event',
      color: colors.red,
      actions: this.actions,
      allDay: true,
      resizable: {
        beforeStart: true,
        afterEnd: true,
      },
      draggable: true,
    },
    {
      start: startOfDay(new Date()),
      title: 'An event with no end date',
      color: colors.yellow,
      actions: this.actions,
    },
    {
      start: subDays(endOfMonth(new Date()), 3),
      end: addDays(endOfMonth(new Date()), 3),
      title: 'A long event that spans 2 months',
      color: colors.blue,
      allDay: true,
    },
    {
      start: addHours(startOfDay(new Date()), 2),
      end: addHours(new Date(), 2),
      title: 'A draggable and resizable event',
      color: colors.yellow,
      actions: this.actions,
      resizable: {
        beforeStart: true,
        afterEnd: true,
      },
      draggable: true,
    },
  ];
 */



  activeDayIsOpen: boolean = true;

  constructor(private modal: NgbModal, private http: HttpClient, private eventService: EventServiceService) { 

    this.filteredFruits = this.fruitCtrl.valueChanges.pipe(
      startWith(null),
      map((fruit: string | null) => fruit ? this._filter(fruit) : this.userNames.slice()));
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  

  fetchEvents(): void {
    const getStart: any = {
      month: startOfMonth,
      week: startOfWeek,
      day: startOfDay,
    }[this.view];

    const getEnd: any = {
      month: endOfMonth,
      week: endOfWeek,
      day: endOfDay,
    }[this.view];



    this.events$ = this.eventService.getEvents()
      .pipe(
        map((res: any) => {

          
          return res.map((film: Meeting) => {
            return {
              id: film.id,
              title: film.text,
              start: new Date(
                film.start
              ),
              end:film.end,
              color: colors.yellow,
              allDay: true,
              draggable: true,
              meta: {
                film,
              },
              actions: this.actions
            };
          });
        })
      );

    this.events$.subscribe((ev) => {
      this.events = ev;
      console.log(this.events);})
    
  }



  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {



    this.events = this.events.map((iEvent) => {


      if (iEvent === event) {
        const film: Meeting = {
          id: event.meta.film.id,
          text: event.meta.film.text,
          day: event.meta.film.day,
          reminder: event.meta.film.reminder,
          start: newStart,
          end:newEnd,
          users:event.meta.film.users,
        }



        this.eventService.updateEvent(film).subscribe();
        return {
          ...event,
          start: newStart,
          end: newEnd,


        };


      }


      return iEvent;
    });
    this.handleEvent('Dropped or resized', event);

    this.sendMessage("action happened to " + event.title);
  }

  handleEvent(action: string, event: CalendarEvent): void {
    this.modalData = { event, action };
    this.modal.open(this.modalContent, { size: 'lg' });
  }

  addEvent(): void {


/*     this.modalData = { action:"test" };
 */    /* this.modal.open("Add" ); */

    const film = {

      text: 'New event',
      day: "test",
      reminder: true,
      start: startOfDay(new Date()),
      end: startOfDay(new Date()),
      users:[]
    }







    this.eventService.addEvent(film).subscribe((film) => {
      console.log("meeh")




      this.events.push({
        id: film.id,
        title: 'New event',
        start: startOfDay(new Date()),
        end: endOfDay(new Date()),
        color: colors.red,
        draggable: true,
        resizable: {
          beforeStart: true,
          afterEnd: true,
        },
        meta: {
          film,
        },
        actions:this.actions,

      })


    }


    )
  }

  deleteEvent(eventToDelete: CalendarEvent) {

    this.eventService.deleteEvent(eventToDelete.meta.film).subscribe(() => this.events = this.events.filter((event) => event !== eventToDelete));
  }

  updateEvent(eventToUpdate: CalendarEvent) {
    /* this.events = this.events.filter((event) => event !== eventToDelete); */

    const film: Meeting = {
      id: eventToUpdate.meta.film.id,
      text: eventToUpdate.title,
      day: eventToUpdate.meta.film.day,
      reminder: eventToUpdate.meta.film.reminder,
      start: eventToUpdate.start,
      end: eventToUpdate.end,
      users:eventToUpdate.meta.film.users,
    }

    if(film.end){
        if(film.end<film.start)
        {
            console.log("doesnt make sense");
            return;

        }
        else{
          this.eventService.updateEvent(film).subscribe();

        }

      }
      else{
        this.eventService.updateEvent(film).subscribe();

      }

  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  
  add(event: MatChipInputEvent,ev: CalendarEvent<{ film: Meeting; }>): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
/*       this.fruits.push(value);

 */   let obj = this.users.find(user => user.name === value);
      if(obj)
      ev.meta?.film.users?.push(obj);



}

    // Clear the input value
    event.chipInput!.clear();

    this.fruitCtrl.setValue(null);
  }

  remove(user: User,ev: CalendarEvent<{ film: Meeting; }>): void {
    
    const index = user.id;
    
    if ( index && index >= 0) {
      ev.meta?.film.users?.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent,ev:CalendarEvent<{film:Meeting}>): void {
/*     this.fruits.push(event.option.viewValue)


 */   
    let obj = this.users.find(user => user.name === event.option.viewValue);
      if(obj)
      ev.meta?.film.users?.push(obj);

    this.fruitInput.nativeElement.value = '';
    this.fruitCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.userNames.filter(fruit => fruit.toLowerCase().includes(filterValue));
  }
    
  //select people
}
