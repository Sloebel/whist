import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { Modal, Form, Input, Select, Spin } from 'antd';
import { fire } from '../firebase';
import { onceGetUsers } from '../firebase/db';

const FormItem = Form.Item;
const Option = Select.Option;

const NewLeague = Form.create()(
    class extends Component {
        state = {
            showDialog: this.props.visible,
            users: {},
            count: 0,
            loading: true,
            // selectedRowKeys: [], // Check here to configure the default column
            addPlayerCollapse: [],
            savingLeagueLoader: false
        };

        // onSelectChange = (selectedRowKeys) => {
        //     this.setState({ selectedRowKeys });
        // }

        // set add player panel collapse state value
        // we keep this state to close up the panel after a player was added
        addPlayerCollapseChange = (key) => {
            this.setState({
                addPlayerCollapse: key,
            });
        }

        fetchPlayers() {
            onceGetUsers().then(snapshot => {
                console.log(snapshot.val());
                if (snapshot.val()) {
                    this.setState({ users: snapshot.val(), loading: false });
                } else {
                    this.setState({ loading: false });
                }
            });
        }

        componentDidMount() {
            this.fetchPlayers();
        }

        onCreateLeague() {
            const { form } = this.props;
            // const { users } = this.state;
            const fieldsValues = form.getFieldsValue();

            const createLeague = (params) => new Promise((resolve) => {
                const leaguesRef = fire.database().ref('leagues');

                leaguesRef.once('value', snapshot => {
                    const lastID = snapshot.val() && snapshot.val().lastID;
                    const newID = lastID ? lastID + 1 : 1;

                    fire.database().ref('leagues/list/_' + newID).set({ ...params, leagueID: newID, active: true })
                        .then(() => resolve(newID));
                    fire.database().ref('leagues/lastID').set(newID);
                });
            });

            // form.validateFields(fieldsNames, (err, values) => {
            form.validateFields(fieldsValues, (err, values) => {
                if (!err) {
                    const { description } = values;
                    this.setState({ savingLeagueLoader: true });

                    createLeague({
                        ...values,
                        description: description || ''
                    })
                        .then((newID) => this.closeModal(newID));

                    // }
                }
            });
        }

        focusPlayersSelect = function () {
            this.playersSelect.focus();
        }

        // in order to preserve the animation when closing 
        // there is also an inner state although visible state initialy is from props
        closeModal(leagueID) {
            this.leagueID = leagueID;

            this.setState({
                showDialog: false
            });
        }

        render() {
            const { afterClose, form } = this.props;
            const { showDialog, users, loading, savingLeagueLoader } = this.state;
            const { getFieldDecorator } = form; // antd API            

            return (
                <Modal
                    title="Create League"
                    visible={showDialog}
                    destroyOnClose={true}
                    maskClosable={false}
                    confirmLoading={savingLeagueLoader}
                    onOk={() => this.onCreateLeague()}
                    onCancel={() => this.closeModal()}
                    afterClose={() => afterClose(this.leagueID)}
                    width="600px"
                    okText="Save & Play"
                >
                    <Form layout="vertical">
                        <FormItem label="Title">
                            {getFieldDecorator('title', {
                                rules: [{ required: true, message: 'Please input the league title!' }],
                            })(
                                <Input />
                            )}
                        </FormItem>
                        <FormItem label="Description">
                            {getFieldDecorator('description')(<Input type="textarea" />)}
                        </FormItem>
                        {
                            <FormItem label="Players">
                                {getFieldDecorator('players', {
                                    rules: [{ required: true, len: 4, type: 'array' }],
                                })(
                                    <Select
                                        mode="multiple"
                                        ref={node => this.playersSelect = node}
                                        notFoundContent={loading ? <Spin size="small" /> : null}
                                    >
                                        {Object.keys(users).map(key =>
                                            <Option key={key} value={users[key].nickname}>{users[key].nickname}</Option>
                                        )}
                                    </Select>
                                )}
                            </FormItem>
                        }
                    </Form>
                </Modal>
            );
        }
    }
);
export default withRouter(NewLeague);