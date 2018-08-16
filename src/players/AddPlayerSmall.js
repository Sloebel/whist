import React, { Component } from 'react';
import { Form, Icon, Input, Button } from 'antd';

const FormItem = Form.Item;

function hasErrors(fieldsError) {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class AddPlayerForm extends Component {
    addPlayerSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                this.props.callback(values);
            }
        });
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <Form layout="inline" onSubmit={this.addPlayerSubmit}>
                <FormItem>
                    {getFieldDecorator('name', {
                        rules: [{ required: true, message: 'Please input your name!' }],
                    })(
                        <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Name" />
                    )}
                </FormItem>
                <FormItem>
                    {getFieldDecorator('nickname', {
                        rules: [{ required: true, message: 'Please input your Nickname!' }],
                    })(
                        <Input prefix={<Icon type="smile-o" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Nickname" />
                    )}
                </FormItem>
                <FormItem>
                    <Button
                        type="default"
                        htmlType="submit"
                    >
                        <Icon type="user-add" />
                    </Button>
                </FormItem>
            </Form>
        );
    }
}

const AddPlayerSmall = Form.create()(AddPlayerForm);

export default AddPlayerSmall;