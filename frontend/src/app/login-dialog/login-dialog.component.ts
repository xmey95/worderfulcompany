import { Component } from '@angular/core';
import { BlockScrollService } from '../block-scroll.service';
import { UserService } from '../user.service';
@Component({
  selector: 'login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.css']
})
export class LoginDialogComponent {
  private showPassword : boolean = false;
  private email: string;
  private password: string;
  constructor(private BlockScrollService: BlockScrollService, private UserService: UserService) {
    this.BlockScrollService.disable();
  }

  toggle_show_password(){
    this.showPassword = !this.showPassword;
  }

  try_login(){
    this.UserService.try_login(this.email, this.password);
  }

  validate(){
    if(this.email && this.password){
      if(this.email != "" && this.password != ""){
        return true;
      }
    }
    return false;
  }

}
