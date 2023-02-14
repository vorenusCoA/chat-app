import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LoginService } from '../login.service';
import { Router } from '@angular/router';
import { RxStompService } from '../rx-stomp.service';
import { Subscription } from 'rxjs';
import { Message } from '@stomp/stompjs';
import { ChatMessage } from '../model/chatMessage';
import { ChatService } from '../chat.service';
import { MessageType } from '../model/messageType';
import { Options } from '../model/options';

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
  messages: Map<string, ChatMessage[]> = new Map(); // name of the chat : messages
  activeChat: string = GENERAL_CHAT;
  listOfAvailableChats: Map<string, Options> = new Map(); // name of the chat : options (state of the chat)

  // @ts-ignore-
  private topicSubscription: Subscription;
  // @ts-ignore
  private privateSubscription: Subscription;

  constructor(private loginService: LoginService, private router: Router, private rxStompService: RxStompService, private chatService: ChatService) {

    this.messages.set(GENERAL_CHAT, []);
    this.listOfAvailableChats.set(GENERAL_CHAT, { isConnected: true, isSelected: true, hasNewMessages: false });

  }

  ngOnInit(): void {

    this.username = this.loginService.getUsername();

    // If there is no username then go to login page
    if (!this.username) {
      this.router.navigate(["/login"])
      return
    }

    // Let the server know your username
    this.rxStompService.publish({
      destination: '/app/chat.addUser',
      body: JSON.stringify({
        sender: this.username,
        type: MessageType.JOIN,
        content: this.username + " joined!",
        receiver: GENERAL_CHAT
      })
    });

    // Subscribe to the public channel
    this.topicSubscription = this.rxStompService.watch('/topic/public').subscribe((message: Message) => {
      let chatMessage: ChatMessage = JSON.parse(message.body);
      let messages: ChatMessage[] = this.messages.get(GENERAL_CHAT) || [];
      messages.push(chatMessage);
      this.messages.set(GENERAL_CHAT, messages);

      if (chatMessage.receiver !== this.activeChat) {
        let options = this.listOfAvailableChats.get(chatMessage.receiver)!;
        options.hasNewMessages = true;
      }

      if (chatMessage.type === MessageType.LEAVE) {
        this.removeLoggedUser(chatMessage.sender);
      }

      if (chatMessage.type === MessageType.JOIN) {
        this.addLoggedUser(chatMessage.sender);
      }

    });

    // Subscribe to the user private channel
    this.privateSubscription = this.rxStompService.watch('/user/' + this.username + "/").subscribe((message: Message) => {

      let chatMessage: ChatMessage = JSON.parse(message.body);
      let messages: ChatMessage[] = this.messages.get(chatMessage.sender) || [];
      messages.push(chatMessage);
      this.messages.set(chatMessage.sender, messages);

      if (chatMessage.sender !== this.activeChat) {
        let options = this.listOfAvailableChats.get(chatMessage.sender)!;
        options.hasNewMessages = true;
      }

    });

    this.chatService.getLoggedUsers().subscribe((data) => {
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
    // We don't want our user in the list
    if (user !== this.username) {
      let options: Options | undefined = this.listOfAvailableChats.get(user);
      if (options) {
        options.isConnected = true;
      } else {
        options = { isConnected: true, isSelected: false, hasNewMessages: false };
      }
      this.listOfAvailableChats.set(user, options);
    }
  }

  removeLoggedUser(user: string) {
    let options: Options = this.listOfAvailableChats.get(user)!;
    options.isConnected = false;
    this.listOfAvailableChats.set(user, options);
  }

  hideSender(message: ChatMessage): boolean {
    if (message.type !== MessageType.CHAT)
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

    const destination: string = this.activeChat === GENERAL_CHAT ? '/app/chat.sendMessage' : '/app/private-message';

    const chatMessage: ChatMessage = { sender: this.username, type: MessageType.CHAT, content: this.message, receiver: this.activeChat };


    if (this.activeChat !== GENERAL_CHAT) {
      let messages = this.messages.get(this.activeChat) || [];
      messages.push(chatMessage);
      this.messages.set(this.activeChat, messages);
    }

    this.sendMessage(destination, JSON.stringify(chatMessage));
  }

  sendMessage(destination: string, body: any): void {
    this.rxStompService.publish({ destination: destination, body: body });
    this.message = "";
  }

  loadMessages(chat: string) {

    let options: Options = this.listOfAvailableChats.get(chat)!;
    options.isSelected = true;
    options.hasNewMessages = false;

    options = this.listOfAvailableChats.get(this.activeChat)!;
    options.isSelected = false;

    this.activeChat = chat;
  }

}
