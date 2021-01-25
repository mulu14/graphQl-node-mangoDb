const bcrypt = require("bcryptjs");
const Event = require("../../models/event.js");
const User = require("../../models/user");

const events = async (eventIds) => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    events.map((event) => {
      return {
        ...event._doc,
        _id: event.id,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event.creator),
      };
    });
    return events;
  } catch (err) {
    throw err;
  }
};

const user = async (userId) => {
  try {
    const user = await User.findById(userId);
    return {
      ...user._doc,
      _id: user.id,
      password: null,
      createdEvents: events.bind(this, user.createdEvents),
    };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  events: () => {
    return Event.find()
      .then((events) => {
        return events.map((event) => {
          return {
            ...event._doc,
            _id: event.id,
            creator: user.bind(this, event._doc.creator),
          };
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
      date: new Date(event._doc.date).toISOString(),
      creator: "600e992434c9b0167cd1123f",
    });
    let createdEvent;
    return event
      .save()
      .then((result) => {
        createdEvents = {
          ...result._doc,
          _id: result.id,
          date: new Date(result._doc.date).toISOString(),
          creator: user.bind(this, result._doc.creator),
        };
        return User.findById("600e992434c9b0167cd1123f");
      })
      .then((user) => {
        if (!user) {
          throw new Error("User does not exist");
        }
        user.createdEvents.push(event);
        return user.save();
      })
      .then((result) => {
        return createdEvent;
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
};
