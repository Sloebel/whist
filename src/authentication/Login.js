import React, { Component } from 'react';
import { withRouter, Link } from "react-router-dom";
import { Form, Icon, Input, Button } from 'antd';
import * as routes from '../constants/routes';
import { auth } from '../firebase';
import AuthUserContext from '../authentication/AuthUserContext';

import './Login.css';

const FormItem = Form.Item;

const Login = Form.create()(
    class extends Component {
        state = {
            isLoading: false
        }

        handleSubmit = (e) => {
            e.preventDefault();

            this.props.form.validateFields((err, values) => {
                if (!err) {
                    this.setState({ isLoading: true });

                    const { history } = this.props;
                    const { email, password } = values;

                    auth.signInUser(email, password)
                        .then(() => {
                            history.push(routes.MAIN);
                        })
                        .catch(function (error) {
                            // Handle Errors here.
                            var errorCode = error.code;
                            var errorMessage = error.message;
                            // ...
                            alert(error.message);
                            this.setState({ isLoading: false });
                        });
                }
            });
        }

        render() {
            const { form, history } = this.props;
            const { getFieldDecorator } = form;
            const { isLoading } = this.state;

            return (
                <AuthUserContext.Consumer>
                    {authUser => !authUser ?
                        <Form onSubmit={this.handleSubmit} className="login-form">
                            <FormItem>
                                {getFieldDecorator('email', {
                                    rules: [{
                                        type: 'email', message: 'The input is not valid E-mail!',
                                    },
                                    {
                                        required: true, message: 'Please input your email!'
                                    }],
                                })(
                                    <Input prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="email" />
                                )}
                            </FormItem>
                            <FormItem>
                                {getFieldDecorator('password', {
                                    rules: [{ required: true, message: 'Please input your Password!' }],
                                })(
                                    <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="password" />
                                )}
                            </FormItem>
                            <FormItem>
                                <a className="login-form-forgot" href="">Forgot password</a>
                                <Button type="primary" htmlType="submit" className="login-form-button" loading={isLoading}>
                                    Log in
                                </Button>
                                Or <Link to={routes.SIGN_UP}>register now!</Link>
                            </FormItem>
                        </Form> :
                        <div style={{ textAlign: 'center', marginTop: '50px' }}>
                            <p>You are already logged in,</p>
                            <Button type="primary" size="small" onClick={() => history.goBack()}>
                                <Icon type="arrow-left" />Go back
                            </Button> or <Link to={routes.MAIN}>Go Home</Link>
                        </div>
                    }
                </AuthUserContext.Consumer>
            );
        }
    }
);

export default withRouter(Login);