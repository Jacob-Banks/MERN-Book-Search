// import user  , auth error  / sign token
const { User } = require("../models");
const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

// create resolvers
const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      // if context.user exists
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id }).select(
          "-__v -password"
        );
        // return the data
        return userData;
      }
      //
      throw new AuthenticationError("Please Log IN!");
    },
  },
  Mutation: {
    //   login with email and password
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Incorrect credentials entered!");
      }
      // verify passwrord
      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials entered!");
      }

      const token = signToken(user);
      //   return token and user
      return { token, user };
    },

    //  new user
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      // return user and token
      return { token, user };
    },

    //
    saveBook: async (parent, args, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: args.input } },
          { new: true }
        );
        // return the updatedUser with new book
        return updatedUser;
      }
      //   must be logged in to save a book
      throw new AuthenticationError("Please Log IN!");
    },

    // remove book from user's list
    removeBook: async (parent, args, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: args.bookId } } },
          { new: true }
        );
        // return updated user without book
        return updatedUser;
      }

      throw new AuthenticationError("Please Log IN!");
    },
  },
};

// export resolvers to index.js
module.exports = resolvers;
