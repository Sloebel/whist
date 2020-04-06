import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Spin } from 'antd';
import { fire } from '../firebase';
import * as routes from '../constants/routes';
import AuthUserContext, { UserContext } from './AuthUserContext';

interface IWithAuthorizationProps extends RouteComponentProps {}

const withAuthorization = <TProps,>(
  authCondition: (authUser: UserContext) => boolean
) => (Component: React.ComponentType<TProps>) => {
  class WithAuthorization extends React.Component<
    IWithAuthorizationProps & TProps
  > {
    public componentDidMount() {
      fire.auth().onAuthStateChanged((authUser: UserContext) => {
        if (!authCondition(authUser)) {
          this.props.history.push(routes.SIGN_IN);
        }
      });
    }

    public render() {
      return (
        <AuthUserContext.Consumer>
          {authUser =>
            authUser ? (
              <Component {...this.props} />
            ) : (
              <div className="full-view loader">
                <Spin
                  size="large"
                  style={{ width: '100%', position: 'relative', top: '50%' }}
                />
              </div>
            )
          }
        </AuthUserContext.Consumer>
      );
    }
  }

  return withRouter(WithAuthorization);
};

export default withAuthorization;
