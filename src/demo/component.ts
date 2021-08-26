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

interface Film {
  id?: number;
  text: string;
  day: string;
  reminder: boolean,
  start: Date
}



@Component({
  selector: 'mwl-demo-component',
 /*  changeDetection: ChangeDetectionStrategy.OnPush, */
  styleUrls: ['styles.css'],
  templateUrl: 'template.html',
})
export class DemoComponent {
  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any> | undefined;


  webSocketAPI: WebSocketAPI = new WebSocketAPI();
  greeting: any;
  name: string | undefined;
  events$!: Observable<CalendarEvent<{ film: Film; }>[]>;
  events: CalendarEvent<{ film: Film; }>[] = [];


  ngOnInit() {
    this.fetchEvents();
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

  constructor(private modal: NgbModal, private http: HttpClient, private eventService: EventServiceService) { }

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

          console.log(res)
          return res.map((film: Film) => {
            return {
              id:film.id,
              title: film.text,
              start: new Date(
                film.start
              ),
              color: colors.yellow,
              allDay: true,
              draggable: true,
              meta: {
                film,
              },
            };
          });
        })
      );

    this.events$.subscribe((ev) => (this.events = ev));
    console.log(this.events);
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {



    this.events = this.events.map((iEvent) => {


      if (iEvent === event) {
        const film: Film = {
          id: event.meta.film.id,
          text: event.meta.film.text,
          day:event.meta.film.day ,
          reminder: event.meta.film.reminder,
          start: newStart
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

    const film = {
      
      text: 'New event',
      day:"test",
      reminder: true,
      start: startOfDay(new Date()),
    }
    
    

    



    this.eventService.addEvent(film).subscribe((film)=>{
      console.log("meeh")

      
      
      
      this.events.push({
        id:film.id,
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
      
      })
      

    } 
    
      
    )  }

  deleteEvent(eventToDelete: CalendarEvent) {
    
    this.eventService.deleteEvent(eventToDelete.meta.film).subscribe(()=>this.events = this.events.filter((event) => event !== eventToDelete));
  }

  updateEvent(eventToUpdate: CalendarEvent) {
    /* this.events = this.events.filter((event) => event !== eventToDelete); */

    const film: Film = {
      id: eventToUpdate.meta.film.id,
      text: eventToUpdate.title,
      day:eventToUpdate.meta.film.day ,
      reminder: eventToUpdate.meta.film.reminder,
      start: eventToUpdate.start
    }
    
    this.eventService.updateEvent(film).subscribe();
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }
}
