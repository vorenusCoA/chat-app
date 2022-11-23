import { MessageType } from "./messageType";

export interface ChatMessage {

    sender: string,
    receiver: string,
    content: string,
    type: MessageType

}