import React from 'react';
import { fire } from '../firebase';
import AuthUserContext from './AuthUserContext';

const withAuthentication = (Component: React.ComponentType) => {
  class WithAuthentication extends React.Component {
    public state = {
      authUser: null,
    };

    componentDidMount() {
      fire.auth().onAuthStateChanged(authUser => {
        authUser
          ? this.setState({ authUser })
          : this.setState({ authUser: null });
      });
    }

    render() {
      const { authUser } = this.state;

      return (
        <AuthUserContext.Provider value={authUser}>
          <Component {...this.props} />
        </AuthUserContext.Provider>
      );
    }
  }

  return WithAuthentication;
};

export default withAuthentication;
