import React from "react";
import { withRouter, Link, RouteComponentProps } from "react-router-dom";
import { Form, Input, Button } from "antd";
import {
  MailOutlined,
  LockOutlined,
  ArrowLeftOutlined
} from "@ant-design/icons";
import * as routes from "../constants/routes";
import { auth } from "../firebase";
import AuthUserContext from "./AuthUserContext";

import "./Login.scss";
import { IFormValues } from "../models/common/BasicTypes";

const FormItem = Form.Item;

export interface ILoginState {
  isLoading: boolean;
}

export interface ILoginProps extends RouteComponentProps {}

class Login extends React.Component<ILoginProps, ILoginState> {
  state = {
    isLoading: false
  };

  private handleSubmit = (values: IFormValues) => {
    this.setState({ isLoading: true });

    const { history } = this.props;
    const { email, password } = values;

    auth
      .signInUser(email, password)
      .then(authUser => {
        console.log(authUser);
        history.push(routes.MAIN);
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
    const { history } = this.props;
    const { isLoading } = this.state;

    return (
      <AuthUserContext.Consumer>
        {authUser =>
          !authUser ? (
            <Form onFinish={this.handleSubmit} className="login-form">
              <FormItem
                name="email"
                rules={[
                  {
                    type: "email",
                    message: "The input is not valid E-mail!"
                  },
                  {
                    required: true,
                    message: "Please input your email!"
                  }
                ]}
              >
                <Input
                  prefix={<MailOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                  placeholder="email"
                  size="large"
                />
              </FormItem>
              <FormItem
                name="password"
                rules={[
                  { required: true, message: "Please input your Password!" }
                ]}
              >
                <Input
                  prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                  type="password"
                  placeholder="password"
                  size="large"
                />
              </FormItem>
              <FormItem>
                {/* <a className="login-form-forgot" href="">
                  Forgot password
                </a> */}
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  className="login-form-button"
                  loading={isLoading}
                >
                  Log in
                </Button>
                Or <Link to={routes.SIGN_UP}>register now!</Link>
              </FormItem>
            </Form>
          ) : (
            <div style={{ textAlign: "center", marginTop: "50px" }}>
              <p>You are already logged in,</p>
              <Button
                type="primary"
                size="small"
                onClick={() => history.goBack()}
                icon={<ArrowLeftOutlined />}
              >
                Go back
              </Button>{" "}
              or <Link to={routes.MAIN}>Go Home</Link>
            </div>
          )
        }
      </AuthUserContext.Consumer>
    );
  }
}

export default withRouter(Login);
