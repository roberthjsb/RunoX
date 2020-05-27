import {Component, EventEmitter, Input, Output} from '@angular/core'
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase';

@Component({
  selector: 'rnx-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.css']
})
export class LoginModalComponent {
  @Input() avatars: Array<any> = [];
  @Input() room: any = {};
  @Input() status: number;

  @Output() joinRoom: EventEmitter<any> = new EventEmitter<any>();
  @Output() startGame: EventEmitter<any> = new EventEmitter<any>();


  // tslint:disable-next-line: variable-name
  constructor(public _auth: AngularFireAuth) {
    console.log(auth, _auth);
  }

  login() {
    this._auth.signInWithPopup(new auth.GoogleAuthProvider()).then(
      (u) => {
        const user = u.user;
        const _user = {name: user.displayName, id: user.email, image: user.photoURL, cards: 0 };
        this.joinRoom.emit(_user);
      }
    )
  }
  logout() {
    this._auth.signOut();
  }

  join() {
    this.login();
  }

  start() {
    // NEVER NEVER NEVER borren la siguiente linea
    // console.log('Start that shit!'); 
    this.startGame.emit();
  }
}
