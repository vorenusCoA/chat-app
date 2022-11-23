import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LoginService } from '../login.service';
import { Router } from '@angular/router';
import { RxStompService } from '../rx-stomp.service';
import { Subscription } from 'rxjs';
import { Message } from '@stomp/stompjs';
import { ChatMessage } from '../model/chatMessage';
import { ChatService } from '../chat.service';
import { MessageType } from '../model/messageType';
import { User } from '../model/user';

const GENERAL_CHAT = "General Chat";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewChecked, OnDestroy {

  @ViewChild('messagescard')
  private myScrollContainer!: ElementRef;

  username: string = "";
  message: string = "";
  messages = new Map<string, any>();
  activeChat = GENERAL_CHAT;
  listOfAvailableChats: Map<string, any> = new Map();

  // @ts-ignore
  private topicSubscription: Subscription;
  // @ts-ignore
  private privateSubscription: Subscription;

  constructor(private loginService: LoginService, private router: Router, private rxStompService: RxStompService, private chatService: ChatService) {

    this.messages.set(GENERAL_CHAT, []);
    this.listOfAvailableChats.set(GENERAL_CHAT, { isConnected: true, isSelected: true, hasNewMessages: false} );

  }

  ngOnInit(): void {

    // If there is no username then go to login page
    if (!this.loginService.getUsername()) {
      this.router.navigate(["/login"])
      return
    }

    this.username = this.loginService.getUsername();

    console.log("Calling chat.addUser with user: ", this.username);

    // Let the server know your username
    this.rxStompService.publish({
      destination: '/app/chat.addUser',
      body: JSON.stringify({
        sender: this.username,
        type: 'JOIN',
        content: this.username + " joined!",
        receiver: GENERAL_CHAT
      })
    });

    console.log("Subscribing to topic/public");

    this.topicSubscription = this.rxStompService.watch('/topic/public').subscribe((message: Message) => {
      let chatMessage = JSON.parse(message.body);
      console.log("chatMessage: ", chatMessage)
      let messages = this.messages.get(GENERAL_CHAT);
      messages?.push(chatMessage);
      this.messages.set(GENERAL_CHAT, messages);

      if (chatMessage.receiver !== this.activeChat) {
        let options = this.listOfAvailableChats.get(chatMessage.receiver);
        options.hasNewMessages = true;
      }

      if (chatMessage.type === 'LEAVE') {
        this.removeLoggedUser(chatMessage.sender);
      }

      if (chatMessage.type === 'JOIN') {
        this.addLoggedUser(chatMessage.sender);
      }

    });


    this.privateSubscription = this.rxStompService.watch('/user/' + this.username + "/").subscribe((message: Message) => {

      let chatMessage: ChatMessage = JSON.parse(message.body);
      let messages = this.messages.get(chatMessage.sender);
      if (!messages)
        messages = []
      messages?.push(chatMessage);
      this.messages.set(chatMessage.sender, messages);
      if (chatMessage.sender !== this.activeChat) {
        let options = this.listOfAvailableChats.get(chatMessage.sender);
        options.hasNewMessages = true;
      }

    });

    this.chatService.getLoggedUsers().subscribe((data) => {
      console.log("Loading logged users for first time");
      for (let user of data) {
        this.addLoggedUser(user.username);
      }

    });


  }

  ngOnDestroy(): void {
    this.topicSubscription.unsubscribe();
    this.privateSubscription.unsubscribe();
  }

  addLoggedUser(user: string) {
    console.log("Adding logged user to list: ", user);
    // We don't want our user in the list
    if (user !== this.username) {
      let options = this.listOfAvailableChats.get(user);
      if (options) {
        options.isConnected = true;
      } else {
        options = { isConnected: true, isSelected: false, hasNewMessages: false };
      }
      this.listOfAvailableChats.set(user, options);
    }
  }

  removeLoggedUser(user: string) {
    console.log("Removing logged user from list: ", user);

    let options = this.listOfAvailableChats.get(user);
    options.isConnected = false;
    this.listOfAvailableChats.set(user, options);
  }

  hideSender(message: any): boolean {
    if (message.type !== 'CHAT')
      return true;
    
    if (this.activeChat !== GENERAL_CHAT)
      return true;

    return false;
  }

  ngAfterViewChecked() {
    console.log("CALLING SCROLL");
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.log("err: ", err)
    }
  }

  prepareMessage() {

    if (!this.message)
      return;

    const destination = this.activeChat === GENERAL_CHAT ? '/app/chat.sendMessage' : '/app/private-message';

    const chatMessage: ChatMessage = {sender: this.username, type: MessageType.CHAT, content: this.message, receiver: this.activeChat};
    

    if (this.activeChat !== GENERAL_CHAT) {
      console.log("adding private message")
      let messages = this.messages.get(this.activeChat);
      if (!messages)
        messages = []
      messages?.push(chatMessage);
      this.messages.set(this.activeChat, messages);
      console.log("messages in private chat: ", this.messages)
    }

    this.sendMessage(destination, JSON.stringify(chatMessage));
  }

  sendMessage(destination: any, body: any): void {
    this.rxStompService.publish({ destination: destination, body: body });
    this.message = "";
  }

  loadMessages(chat: string) {

    let options = this.listOfAvailableChats.get(chat);
    options.isSelected = true;
    options.hasNewMessages = false;

    options = this.listOfAvailableChats.get(this.activeChat);
    options.isSelected = false;

    this.activeChat = chat;



  }

}