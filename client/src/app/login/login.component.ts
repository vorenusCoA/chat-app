import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../login.service';
import { User } from '../model/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  user: User = { username: "", isConnected: false };
  errorMessage: string = "";

  constructor(private loginService: LoginService, private router: Router) { }

  login(form: NgForm) {

    if (form.invalid)
      return;

    this.loginService.login(this.user).subscribe({
      next: (user) => {
        this.loginService.setUsername(user.username);
        this.router.navigate(["/chat"]);
      }, error: (error) => {
        this.errorMessage = "Username already taken, please choose a different one";
      }
    })
  }

}
