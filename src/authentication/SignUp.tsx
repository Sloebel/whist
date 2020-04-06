import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Form, Input, Button } from 'antd';
import {
  SmileOutlined,
  UserOutlined,
  MailOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { auth, db } from '../firebase';
import './Login.scss';
import { IFormValues } from '../models/common/BasicTypes';
import { FormInstance } from 'antd/lib/form';

const FormItem = Form.Item;

interface ISignUpState {
  confirmDirty: boolean;
  isLoading: boolean;
}

interface ISignUpProps extends RouteComponentProps {}

class SignUp extends React.Component<ISignUpProps, ISignUpState> {
  private formRef = React.createRef<FormInstance>();

  public constructor(props: ISignUpProps) {
    super(props);

    this.state = {
      confirmDirty: false,
      isLoading: false,
    };
  }

  private handleConfirmBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  private compareToFirstPassword = (rule: any, value: any, callback: any) => {
    const form = this.formRef.current;

    if (form && value && value !== form.getFieldValue('password')) {
      callback('Two passwords that you enter is inconsistent!');
    } else {
      callback();
    }
  };

  private validateToNextPassword = (rule: any, value: any, callback: any) => {
    const form = this.formRef.current;

    if (value && this.state.confirmDirty) {
      form && form.validateFields(['confirm']);
    }
    callback();
  };

  private handleSubmit = (values: IFormValues) => {
    this.setState({ isLoading: true });

    const { name, nickname, email, password } = values;
    auth
      .createUser(email, password)
      .then(authUser => {
        // Create a user in own accessible Firebase Database too
        authUser &&
          authUser.user &&
          db
            .doCreateUser(authUser.user.uid, { name, nickname, email })
            .then(() => {
              this.props.history.push('/');
            })
            .catch(error => {
              // Handle Errors here.
              var errorCode = error.code;
              var errorMessage = error.message;
              // ...
              alert(error.message);
              this.setState({ isLoading: false });
            });
      })
      .catch(error => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
        alert(error.message);
        this.setState({ isLoading: false });
      });
  };

  public render() {
    const { isLoading } = this.state;

    return (
      <Form
        onFinish={this.handleSubmit}
        ref={this.formRef}
        className="login-form"
      >
        <FormItem
          name="name"
          rules={[{ required: true, message: 'Please input your name!' }]}
        >
          <Input
            prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            placeholder="Name"
            size="large"
          />
        </FormItem>
        <FormItem
          name="nickname"
          rules={[
            {
              required: true,
              message: 'Please input your Nickname!',
            },
          ]}
        >
          <Input
            prefix={<SmileOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            placeholder="Nickname"
            size="large"
          />
        </FormItem>
        <FormItem
          name="email"
          rules={[
            {
              type: 'email',
              message: 'The input is not valid E-mail!',
            },
            {
              required: true,
              message: 'Please input your email!',
            },
          ]}
        >
          <Input
            prefix={<MailOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            placeholder="Email"
            size="large"
          />
        </FormItem>
        <FormItem
          name="password"
          rules={[
            {
              required: true,
              message: 'Please input your Password!',
            },
            {
              validator: this.validateToNextPassword,
            },
          ]}
        >
          <Input
            prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            type="password"
            placeholder="Password"
            size="large"
          />
        </FormItem>
        <FormItem
          name="confirm"
          rules={[
            {
              required: true,
              message: 'Please confirm your password!',
            },
            {
              validator: this.compareToFirstPassword,
            },
          ]}
        >
          <Input
            prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            type="password"
            placeholder="Confirm password"
            onBlur={this.handleConfirmBlur}
            size="large"
          />
        </FormItem>
        <FormItem>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            className="login-form-button"
            loading={isLoading}
          >
            Sign Up
          </Button>
        </FormItem>
      </Form>
    );
  }
}

export default withRouter(SignUp);
