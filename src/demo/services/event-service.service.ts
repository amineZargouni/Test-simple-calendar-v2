import { Injectable } from '@angular/core';
import {HttpClient,HttpHeaders} from '@angular/common/http'
import {Observable} from 'rxjs';
import { CalendarEvent } from 'calendar-utils';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type' : 'application/json'
  })
}

interface User {
  id?: number;
  name:string;
}
interface Meeting {
  id?: number;
  text: string;
  day: string;
  reminder: boolean,
  start: Date,
  end?:Date,
  users?:User[]
}


interface User {
  id?: number;
  name:string;
}

@Injectable({
  providedIn: 'root'
})


export class EventServiceService {
  calendarEvent!: CalendarEvent<{ film: Meeting; }>;
  private apiUrl = "http://localhost:5000/events"
  private apiUrlusers = "http://localhost:5000/users"

  constructor(private http:HttpClient) { }


  getEvents():Observable<Meeting[]> {
    return this.http.get<Meeting[]>(this.apiUrl);
  }

  updateEvent(event:Meeting) : Observable<Meeting>{
    const url = `${this.apiUrl}/${event.id}`;
    return this.http.put<Meeting>(url,event,httpOptions)
  }

  deleteEvent(event:Meeting):Observable<Meeting> {
    const url = `${this.apiUrl}/${event.id}`;
        return this.http.delete<Meeting>(url);
  }

  addEvent(event:Meeting):Observable<Meeting>{
    return this.http.post<Meeting>(this.apiUrl,event,httpOptions);
  }





  getUsers():Observable<User[]> {
    return this.http.get<User[]>(this.apiUrlusers);
  }

  updateUser(user:User) : Observable<User>{
    const url = `${this.apiUrlusers}/${user.id}`;
    return this.http.put<User>(url,user,httpOptions)
  }

  deleteUser(user:User):Observable<User> {
    const url = `${this.apiUrlusers}/${user.id}`;
        return this.http.delete<User>(url);
  }

  addUser(user:User):Observable<User>{
    return this.http.post<User>(this.apiUrlusers,user,httpOptions);
  }

}
