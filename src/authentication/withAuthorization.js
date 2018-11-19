import React from 'react';
import { withRouter } from 'react-router-dom';
import { Spin } from 'antd';

import AuthUserContext from './AuthUserContext';
import { fire } from '../firebase';
import * as routes from '../constants/routes';

const withAuthorization = (authCondition) => (Component) => {
    class WithAuthorization extends React.Component {
        componentDidMount() {
            fire.auth().onAuthStateChanged(authUser => {
                if (!authCondition(authUser)) {
                    this.props.history.push(routes.SIGN_IN);
                }
            });
        }

        render() {
            return (
                <AuthUserContext.Consumer>
                    {authUser => authUser ?
                        <Component {...this.props} /> :
                        <div className="full-view loader"><Spin size="large" style={{ width: '100%', position: 'relative', top: '50%' }} /></div>}
                </AuthUserContext.Consumer>
            );
        }
    }

    return withRouter(WithAuthorization);
}

export default withAuthorization;