import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from './model/user';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private http: HttpClient) { }

  public getLoggedUsers(): Observable<User[]> {
    return this.http.get<User[]>("http://localhost:8080/user");
  }

}
