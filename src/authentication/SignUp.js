import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { Form, Icon, Input, Button, Checkbox } from 'antd';
import { auth } from '../firebase';
import './Login.css';

const FormItem = Form.Item;

const SignUp = Form.create()(
	 class extends Component {
	 	state = {
	 		confirmDirty: false
	 	}

	 	handleConfirmBlur = (e) => {
		    const value = e.target.value;
		    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
	  	}

		compareToFirstPassword = (rule, value, callback) => {
		    const form = this.props.form;
		    if (value && value !== form.getFieldValue('password')) {
		      callback('Two passwords that you enter is inconsistent!');
		    } else {
		      callback();
		    }
		}

		validateToNextPassword = (rule, value, callback) => {
		    const form = this.props.form;
		    if (value && this.state.confirmDirty) {
		      form.validateFields(['confirm'], { force: true });
		    }
		    callback();
		}

        handleSubmit = (e) => {
            e.preventDefault();
            this.props.form.validateFields((err, values) => {
                if (!err) {
                    console.log('Received values of form: ', values);
                    const { email, password } = values;
                    auth.createUser(email, password)
                    	.then(authUser => this.props.history.push('/'))
                    	.catch(function (error) {
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
	                    {getFieldDecorator('name', {
	                        rules: [{ required: true, message: 'Please input your name!' }],
	                    })(
	                        <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Name" />
	                    )}
	                </FormItem>
                    <FormItem>
                        {getFieldDecorator('nickname', {
                            rules: [{ 
                                required: true, message: 'Please input your Nickname!' 
                            }],
                        })(
                            <Input prefix={<Icon type="smile-o" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Nickname" />
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('email', {
                            rules: [{
                                type: 'email', message: 'The input is not valid E-mail!',
                            },
                            { 
                                required: true, message: 'Please input your email!' 
                            }],
                        })(
                            <Input prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Email" />
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('password', {
                            rules: [{ 
                            	required: true, message: 'Please input your Password!' 
                            }, {
				              	validator: this.validateToNextPassword,
				            }],
                        })(
                            <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Password" />
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('confirm', {
                            rules: [{ 
                            	required: true, message: 'Please confirm your password!' 
                            }, {
				              	validator: this.compareToFirstPassword,
				            }],
                        })(
                            <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} >*</Icon>} type="password" placeholder="Confirm password" onBlur={this.handleConfirmBlur}/>
                        )}
                    </FormItem>
                    <FormItem>
                        <Button type="primary" htmlType="submit" className="login-form-button">
                            Sign Up
                        </Button>
                    </FormItem>
                </Form>
            );
        }
    }
);

export default withRouter(SignUp);