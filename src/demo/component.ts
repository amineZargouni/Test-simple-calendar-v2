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
  phoneNumber:string;
}

 interface EventColor {
  primary: string;
  secondary: string;
}

interface Sms
{
  phoneNumber: string,
  message : string;

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
  end:Date,
  users:User[];
  color:EventColor
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

  @ViewChild('modalC  @ViewChild('fruitInput')
  fruitInput!: ElementRef<HTMLInputElement>;

  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any> | undefined;
  

  webSocketAPI: WebSocketAPI = new WebSocketAPI();
  greeting: any;
  name: string | undefined;
  events$!: Observable<CalendarEvent<{ meeting: Meeting; }>[]>;
  events: CalendarEvent<{ meeting: Meeting; }>[] = [];


  ngOnInit() {
    this.eventService.getUsers().subscribe((users)=>{this.users = users;
      /* console.log(users); */
      this.userNames = users.map( (user)=>{ 
        return user.name; 
       });
    this.fetchEvents();
    

    

    })
     this.connect();
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

    /* console.log("hedha " + this.greeting); */
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

  goToBottom(){
    window.scrollTo(0,document.body.scrollHeight);
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

          
          return res.map((meeting: Meeting) => {
            return {
              id: meeting.id,
              title: meeting.text,
              start: new Date(
                meeting.start
              ),
              
              end:new Date(meeting.end),
              color: meeting.color,
              
              draggable: true,
              resizable: {
                beforeStart: true,
                afterEnd: true,
              },
              meta: {
                meeting,
              },
              actions: this.actions
            };
          });
        })
      );

    this.events$.subscribe((ev) => {
      this.events = ev;
      })
    
  }



  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {



    this.events = this.events.map((iEvent) => {


      if (iEvent === event) {
        const meeting: Meeting = {
          id: event.meta.meeting.id,
          text: event.meta.meeting.text,
          day: event.meta.meeting.day,
          reminder: event.meta.meeting.reminder,
          start: newStart,
          end:newEnd,
          users:event.meta.meeting.users,
          color:event.color
        }



        this.eventService.updateEvent(meeting).subscribe(
          
        );
        return {
          ...event,
          start: newStart,
          end: newEnd,


        };


      }


      return iEvent;
    });
    this.handleEvent('Dropped or resized', event);

    const attendees  = event.meta.meeting.users.map( (user:User)=>{ 
      return user.name; 
     });

     const phoneNumbers  = event.meta.meeting.users.map( (user:User)=>{ 
      return user.phoneNumber; 
     });

    this.sendMessage("A new Event  " + event.title +"with these attendees : "+attendees + " with numbers "+ phoneNumbers);
  }

  handleEvent(action: string, event: CalendarEvent): void {
<<<<<<< HEAD
<<<<<<< HEAD

    

    this.modalEvent = {...event};

    if(action === "Clicked")
    {
      this.disabled = true;
    }


    if(action === "Edited")
    {
      this.disabled = false;
    }


    this.modalData = { event:this.modalEvent, action };
/*     console.log("hedhi el modal"+this.modalEvent.id)
 */
=======
    this.modalData = { event, action };
>>>>>>> parent of a888ba1 (updates and fixes to the modal)
=======
    this.modalData = { event, action };
>>>>>>> parent of a888ba1 (updates and fixes to the modal)
    this.modal.open(this.modalContent, { size: 'lg' });
  }

  addEvent(): void {


/*     this.modalData = { action:"test" };
 */    /* this.modal.open("Add" ); */

    const meeting = {

      text: 'New event',
      day: "test",
      reminder: true,
      start: startOfDay(new Date()),
      end: startOfDay(new Date()),
      users:[],
      color:colors.red
    }







    this.eventService.addEvent(meeting).subscribe((meeting) => {
     




      this.events.push({
        id: meeting.id,
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
          meeting,
        },
        actions:this.actions,

      })


    }


    )
  }

  deleteEvent(eventToDelete: CalendarEvent) {

    this.eventService.deleteEvent(eventToDelete.meta.meeting).subscribe(() => this.events = this.events.filter((event) => event !== eventToDelete));
  }

  updateEvent(eventToUpdate: CalendarEvent) {
    /* this.events = this.events.filter((event) => event !== eventToDelete); */

    const meeting: Meeting = {
      id: eventToUpdate.meta.meeting.id,
      text: eventToUpdate.title,
      day: eventToUpdate.meta.meeting.day,
      reminder: eventToUpdate.meta.meeting.reminder,
      start: eventToUpdate.start,
      end: eventToUpdate.end,
      users:eventToUpdate.meta.meeting.users,
      color:eventToUpdate.color
    }


    /* console.log(eventToUpdate); */
    if(meeting.end){
        if(meeting.end<meeting.start)
        {
            console.log("doesnt make sense");
            return;

        }
        else{
          this.eventService.updateEvent(meeting).subscribe((res)=> {

          let index =  this.events.findIndex((event)=> { return event.id === eventToUpdate.id});
          this.events[index].title = eventToUpdate.title;
          
        
        }
          
          );

        }

      }
      else{
        this.eventService.updateEvent(meeting).subscribe();

      }

  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  changeDay(date: Date) {
    this.viewDate = date;
    this.view = CalendarView.Day;
  }

  
  add(event: MatChipInputEvent,ev: CalendarEvent<{ meeting: Meeting; }>): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
/*       this.fruits.push(value);

 */   let obj = this.users.find(user => user.name === value);
 
 if(obj && !ev.meta?.meeting.users.find(user => user.name === value))
 ev.meta?.meeting.users.push(obj);



}

    // Clear the input value
    event.chipInput!.clear();

    this.fruitCtrl.setValue(null);
  }

  remove(user: User,ev: CalendarEvent<{ meeting: Meeting; }>): void {
    
    const index = user.id;
    let newUsers = ev.meta?.meeting.users;
    if ( newUsers) {
/*       this.events = this.events.filter((event) => event !== eventToDelete));
 */      /* newUsers = newUsers.filter((u) => u !== user) */

        ev.meta.meeting.users =ev.meta.meeting.users.filter((u) => u !== user)
      
    }
  }

  selected(event: MatAutocompleteSelectedEvent,ev:CalendarEvent<{meeting:Meeting}>): void {
/*     this.fruits.push(event.option.viewValue)


 */   
    let obj = this.users.find(user => user.name === event.option.viewValue);
      if(obj && !ev.meta?.meeting.users.find(user => user.name === event.option.viewValue))
      ev.meta?.meeting.users.push(obj);

    this.fruitInput.nativeElement.value = '';
    this.fruitCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.userNames.filter(fruit => fruit.toLowerCase().includes(filterValue));
  }


  sendSms(ev: CalendarEvent<{ meeting: Meeting; }>)
  {
    let users = ev.meta.meeting.users.map((user:User)=> {return user});

    users.forEach(user => {
      /* console.log(user); */


      /* const meeting: Meeting = {
        id: event.meta.meeting.id,
        text: event.meta.meeting.text,
        day: event.meta.meeting.day,
        reminder: event.meta.meeting.reminder,
        start: newStart,
        end:newEnd,
        users:event.meta.meeting.users,
        color:event.color
      } */
      
      
      const sms:Sms= {
        phoneNumber:user.phoneNumber,
        message:"You have a new meeting named "+ ev.title+ " at "+ ev.start
      }
      this.eventService.sendSms(sms).subscribe(()=>console.log("sms sent"));
      
<<<<<<< HEAD
    });}}
=======
    });
    
  }
    
  //select people
}
>>>>>>> parent of a888ba1 (updates and fixes to the modal)
