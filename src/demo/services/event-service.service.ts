import { Injectable } from '@angular/core';
import {HttpClient,HttpHeaders} from '@angular/common/http'
import {Observable} from 'rxjs';
import { CalendarEvent } from 'calendar-utils';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type' : 'application/json'
  })
}


interface Film {
  id: number;
  text: string;
  day: string;
  reminder: boolean,
  start: Date
}
@Injectable({
  providedIn: 'root'
})


export class EventServiceService {
  calendarEvent!: CalendarEvent<{ film: Film; }>;
  private apiUrl = "http://localhost:5000/events"

  constructor(private http:HttpClient) { }


  getEvents():Observable<Film[]> {
    return this.http.get<Film[]>(this.apiUrl);
  }

  updateEvent(event:Film) : Observable<Film>{
    const url = `${this.apiUrl}/${event.id}`;
    return this.http.put<Film>(url,event,httpOptions)
  }
}
