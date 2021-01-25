const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { URLSearchParams } = require("url");
global.URLSearchParams = URLSearchParams;

const Event = require("./models/event.js");
const User = require("./models/user");

const app = express();

app.use(bodyParser.json());
app.use(
  "/graphql",
  graphqlHTTP({
    schema: buildSchema(`
       type Event {
           _id: ID
           title: String!
           description: String!
           price: Float!
           date:String
        }
        type User {
          _id: ID!
          email:String! 
          password: String
        } 
        input UserInput {
          email: String!
          password: String!
        }
        input EventInput {
           title: String!
           description: String!
           price: Float!
           date:String
        }
        type RootQuery {
            events: [Event!]!
        }
        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }
        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
      events: () => {
        return Event.find()
          .then((events) => {
            return events.map((event) => {
              return { ...event._doc, _id: event.id };
            });
          })
          .catch((err) => {
            throw err;
          });
      },
      createEvent: (args) => {
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date),
          creator: "600e992434c9b0167cd1123f",
        });
        return event
          .save()
          .then((result) => {
            return User.findById("600e992434c9b0167cd1123f");
            return { ...result._doc, _id: result._doc._id.toString() };
          })
          .then((user) => {
            if (!user) {
              throw new Error("User does not exist");
            }
            user.createEvent.push(event);
          })
          .catch((err) => {
            console.log(err);
          });
      },
      createUser: (args) => {
        return User.findOne({ email: args.userInput.email })
          .then((user) => {
            if (user) {
              throw new Error("User exists already");
            }
            return bcrypt.hash(args.userInput.password, 12);
          })
          .then((hashpassword) => {
            const user = new User({
              email: args.userInput.email,
              password: hashpassword,
            });
            return user.save();
          })
          .then((result) => {
            return { ...result._doc, password: null, _id: result.id };
          })
          .catch((err) => {
            throw err;
          });
      },
    },
    graphiql: true,
  })
);
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.nngj1.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(error);
  });
