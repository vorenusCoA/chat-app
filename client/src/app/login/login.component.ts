import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../login.service';
import { User } from '../model/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  model: User = { username: "", isConnected: false };
  errorMessage: string = "";

  constructor(private loginService: LoginService, private router: Router) { }

  ngOnInit(): void {
  }

  login(form: NgForm) {

    if (form.invalid)
      return;

    this.loginService.login(this.model).subscribe({
      next: (user) => {
        this.loginService.setUsername(user.username);
        console.log("Setting the username: ", user.username);
        this.router.navigate(["/chat"]);
      }, error: (error) => {
        this.errorMessage = "Username already taken, please choose a new one";
      }
    })

  }

}