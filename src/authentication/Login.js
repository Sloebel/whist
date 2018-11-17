import React, { Component } from 'react';
import { withRouter, Link} from "react-router-dom";
import { Form, Icon, Input, Button, Checkbox } from 'antd';
import * as routes from '../constants/routes';
import { fire } from '../firebase';
import './Login.css';

const FormItem = Form.Item;

const Login = Form.create()(
    class extends Component {
        handleSubmit = (e) => {
            e.preventDefault();
            this.props.form.validateFields((err, values) => {
                if (!err) {
                    console.log('Received values of form: ', values);
                    const { email, password } = values;
                    fire.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
                        // Handle Errors here.
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        // ...
                        alert(error.message);
                    });
                }
            });
        }

        render() {
            const { getFieldDecorator } = this.props.form;
            return (
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
                        {/* {getFieldDecorator('remember', {
                            valuePropName: 'checked',
                            initialValue: true,
                        })(
                            <Checkbox>Remember me</Checkbox>
                        )} */}
                        <a className="login-form-forgot" href="">Forgot password</a>
                        <Button type="primary" htmlType="submit" className="login-form-button">
                            Log in
                        </Button>
                        Or <Link to={routes.SIGN_UP}>register now!</Link>                        
                    </FormItem>
                </Form>
            );
        }
    }
);

export default withRouter(Login);