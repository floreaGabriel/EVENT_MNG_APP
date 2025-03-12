// Looking to send emails in production? Check out our Email API/SMTP product!
import {MailtrapClient} from "mailtrap";
import dotenv from "dotenv";
dotenv.config();


const TOKEN = process.env.MAILTRAP_TOKEN;

const client = new MailtrapClient({
  token: TOKEN,
  testInboxId: 3523748,
  accountId: 2243334
});

const sender = {
  email: "hello@demomailtrap.co",
  name: "Mailtrap Test",
};
const recipients = [
  {
    email: "g.florea2004@gmail.com",
  }
];

client.send({
    from: sender,
    to: recipients,
    subject: "You are awesome!",
    text: "Congrats for sending test email with Mailtrap!",
    category: "Integration Test",
  })
  .then(console.log, console.error);