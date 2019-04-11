import React, { Component } from "react";
import "./App.css";
import gql from "graphql-tag";
import { Mutation, Query } from "react-apollo";

const UsersQuery = gql`
  query users($limit: Int!, $offset: Int!) {
    users(limit: $limit, offset: $offset) {
      id
      name
    }
  }
`;

const MessagesQuery = gql`
  query messages {
    messages {
      id
      text
      user {
        id
        name
      }
    }
  }
`;

const MessagesMutation = gql`
  mutation createMessage($text: String!, $userId: ID!){
    createMessage(text: $text, userId: $userId) {
      id
      text
    }
  }
`;


class App extends Component {
  state = {
    text: '',
    userId: '',
  }
  render() {
    const variables = { limit: 100, offset: 0 };
    return (
      <div>
        <h1>Messages</h1>
        <form>
          <div>
            <label>Message</label><br />
            <textarea value={this.state.text} onChange={event => this.setState({ text: event.target.value })} />
          </div>
          <Query query={UsersQuery} variables={variables}>
            {({ loading, error, data, fetchMore }) => {
              let options = null;
              if (!(loading || error)) {
                const { users } = data;
                options = users.map(user => ( <option value={user.id} key={user.id}> {user.name} </option>));
              }
              return (
                <div>
                  <label>User</label> <br />
                  <select className="form-control" value={this.state.userId} onChange={event => this.setState({ userId: event.target.value })}>
                    <option value="">Select a User</option>
                    {options}
                  </select>
                </div>
              );
            }}
          </Query>
          <Mutation
            mutation={MessagesMutation}
            variables={{ text: this.state.text, userId: this.state.userId }}
            update={() => this.setState({text: '', userId: ''})}
            refetchQueries={[{ query: MessagesQuery, variables }]}>
            {createMessage => ( <button type="button" onClick={createMessage}>Create</button>)}
          </Mutation>
        </form>
        <br /><br />
        <Query query={MessagesQuery} variables={{ limit: 100, offset: 0 }}>
          {({ loading, error, data, fetchMore }) => {
            if (loading || error) return null;
            return (
              <table>
                <thead>
                  <tr>
                    <th>Message</th>
                    <th>User</th>
                  </tr>
                </thead>
                <tbody>
                  {data.messages.map(message => (
                    <tr key={message.id}>
                      <td>{message.text}</td>
                      <td>{message.user.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          }}
        </Query>
      </div>
    );
  }
}

export default App;
