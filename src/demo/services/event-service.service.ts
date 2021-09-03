import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs';
import { CalendarEvent } from 'calendar-utils';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT'

  })
}

interface User {
  id?: number;
  name: string;
  phoneNumber: string;
}

interface EventColor {
  primary: string;
  secondary: string;
}
interface Meeting {
  id?: number;
  text: string;
  day: string;
  reminder: boolean,
  start: Date,
  end: Date,
  users: User[],
  color: EventColor
}


interface User {
  id?: number;
  name: string;
}
interface Sms {
  phoneNumber: string,
  message: string;

}

@Injectable({
  providedIn: 'root'
})


export class EventServiceService {
  calendarEvent!: CalendarEvent<{ meeting: Meeting; }>;
  private apiUrl = "http://localhost:5000/events"
  private apiUrlusers = "http://localhost:5000/users"
  private smsApiUrl = "http://localhost:8080/api/v1/sms"

  constructor(private http: HttpClient) { }


  getEvents(): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(this.apiUrl);
  }

  updateEvent(event: Meeting): Observable<Meeting> {
    const url = `${this.apiUrl}/${event.id}`;
    return this.http.put<Meeting>(url, event, httpOptions)
  }

  deleteEvent(event: Meeting): Observable<Meeting> {
    const url = `${this.apiUrl}/${event.id}`;
    return this.http.delete<Meeting>(url);
  }

  addEvent(event: Meeting): Observable<Meeting> {
    return this.http.post<Meeting>(this.apiUrl, event, httpOptions);
  }





  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrlusers);
  }

  updateUser(user: User): Observable<User> {
    const url = `${this.apiUrlusers}/${user.id}`;
    return this.http.put<User>(url, user, httpOptions)
  }

  deleteUser(user: User): Observable<User> {
    const url = `${this.apiUrlusers}/${user.id}`;
    return this.http.delete<User>(url);
  }

  addUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrlusers, user, httpOptions);
  }



  sendSms(sms: Sms): Observable<Sms> {
    return this.http.post<Sms>(this.smsApiUrl, sms, httpOptions);
  }


}
