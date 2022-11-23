import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User } from './model/user';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private username: string = "";

  constructor(private http: HttpClient) { }

  setUsername(username: string): void {
    this.username = username;
  }

  getUsername(): string {
    return this.username;
  }

  login(user: User): Observable<User> {
    return this.http.post<User>("http://localhost:8080/login", user);
  }


}
