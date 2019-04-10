const { ApolloServer, gql } = require("apollo-server-express");
const express = require("express");
const { User, Message } = require("./db");
const { createBatchResolver } = require('graphql-resolve-batch');


const app = express();

const typeDefs = gql`
  """A great User documentation"""
  type User {
    id: ID!
    name: String!
    age: Int
    messages: [Message]
  }

  type Message {
    id: ID!
    user: User!
    text: String!
  }

  type Query {
    users(offset: Int!, limit: Int!): [User]
    user(id: ID!): User
    messages: [Message]
    message(id: ID!): Message
  }

  type Mutation {
    createUser(name: String!, age: Int): User
    updateUser(id: ID!, name: String!, age: Int): User
    deleteUser(id: ID!): Boolean

    createMessage(text: String!, userId: ID!): Message
    deleteMessage(id: ID!): Boolean
  }
`;

const resolvers = {
  Query: {
    users: async (parent, { offset, limit }, context) => {
      return await User.find();
    },
    user: async (parent, { id }, context) => {
      return await User.findOne({ _id: id });
    },
    messages: async (parent, args, context) => {
      return await Message.find();
    },
    message: async (parent, { id }, context) => {
      return await Message.find({ _id: id });
    }
  },
  Mutation: {
    createUser: async (parent, { name, age }, context) => {
      return await User.create({ name, age });
    },
    updateUser: async (parent, { id, name, age }, context) => {
      await User.updateOne({ _id: id }, { name, age });
      return await User.findOne({ _id: id });
    },
    deleteUser: async (parent, { id }, context) => {
      const deleted = await User.deleteOne({ _id: id });
      return deleted.ok === 1;;
    },
    createMessage: async (parent, { text, userId }, context) => {
        return await Message.create({ text, userId });
    },
    deleteMessage: async (parent, { id }, context) => {
        const deleted = await Message.deleteOne({ _id: id });
        return deleted.ok === 1;;
    },
  },
  User: {
    messages: createBatchResolver(async (users, args, context) => {
      const keys = users.map((user) => user.id);
      const messages = await Message.find({ userId: { $in: keys } });
      const messagesByUser = messages.reduce((acc, message) => {
        if(!acc[message.userId]) acc[message.userId] = [];
        acc[message.userId].push(message);
        return acc;
      }, {});
      return keys.map((userId) => messagesByUser[userId] || []);
    })
  },
  Message: {
    user: createBatchResolver(async (messages, args, context) => {
      const keys = new Set();
      messages.forEach(({ userId }) => {
        keys.add(userId);
      });
      const users = await User.find({ _id: { $in: Array.from(keys) } });
      const usersById = users.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {});
      return messages.map(({userId}) => usersById[userId]);
    })
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
  console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
);
