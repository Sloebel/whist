import React, { Component } from 'react';
import { Form, Icon, Input, Button } from 'antd';

const FormItem = Form.Item;

// function hasErrors(fieldsError) {
//     return Object.keys(fieldsError).some(field => fieldsError[field]);
// }

class AddPlayerForm extends Component {
    validateNickname = (rule, value, callback) => {
        const { players } = this.props;
        if (players.some(player => player.nickname === value)) {
            callback(['nickname already exist!'])
        }
        callback();
    }

    addPlayerSubmit = (e) => {
        e.preventDefault();

        const { form, callback } = this.props;

        form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);

                callback(values).then(response => {
                    // when promise resolved than reset form
                    if (response) {
                        form.resetFields();
                    }
                });

            }
        });
    }

    render() {
        const { form, loading } = this.props;
        const { getFieldDecorator } = form; // antd API
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
                        rules: [{ required: true, message: 'Please input your Nickname!' }, {
                            validator: this.validateNickname
                        }]
                    })(
                        <Input prefix={<Icon type="smile-o" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Nickname" />
                    )}
                </FormItem>
                <FormItem>
                    <Button
                        type="default"
                        htmlType="submit"
                    >
                        <Icon type="user-add" spin={loading} />
                    </Button>
                </FormItem>
            </Form>
        );
    }
}

const AddPlayerSmall = Form.create()(AddPlayerForm);

export default AddPlayerSmall;