// Dependency Injection
class MessageService {
  sendMessage(message) {
      console.log(`Sending message: ${message}`);
  }
}

class User {
  constructor(messageService) {
      this.messageService = messageService;
  }

  notifyUser(message) {
      this.messageService.sendMessage(message);
  }
}

const messageService = new MessageService();
const user = new User(messageService);

user.notifyUser("Hello, User!"); // Output: Sending message: Hello, User!
