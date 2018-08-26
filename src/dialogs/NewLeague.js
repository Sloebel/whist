import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { Modal, Form, Input, Select, Spin, Collapse, Icon, Col } from 'antd';
import fire from './../fire.js';
// import SelectionTool from './../players/SelectionTool';
import AddPlayerSmall from './../players/AddPlayerSmall';

const FormItem = Form.Item;
const Option = Select.Option;
const Panel = Collapse.Panel;

const NewLeague = Form.create()(
    class extends Component {
        state = {
            players: [],
            count: 0,
            loading: true,
            selectedRowKeys: [], // Check here to configure the default column
            addPlayerCollapse: [],
            newPlayerLoader: false,
            savingLeagueLoader: false
        };

        onSelectChange = (selectedRowKeys) => {
            this.setState({ selectedRowKeys });
        }

        addPlayerCollapseChange = (key) => {
            this.setState({
                addPlayerCollapse: key,
            });
        }

        fetch() {
            /* Create reference to messages in Firebase Database */
            const playersList = fire.database().ref('players/list').orderByKey();

            playersList.on('value', snapshot => {
                /* Update React state when a player is added at Firebase Database */
                console.log(snapshot.val());
                if (snapshot.val()) {
                    this.setState({ players: Object.values(snapshot.val()), loading: false });
                } else {
                    this.setState({ loading: false });
                }
            });
        }

        componentDidMount() {
            this.fetch();
        }

        addPlayerCallback(values) {
            return new Promise((resolve, reject) => {
                this.setState({ newPlayerLoader: true });
                fire.database().ref('players').once('value', snapshot => {

                    const newID = snapshot.val().lastID + 1;
                    const playersValue = this.playersSelect.props.value || [];

                    fire.database().ref('players/list/_' + newID).set({ ...values, playerID: newID }, () => {
                        this.props.form.setFieldsValue({ players: playersValue.concat([values.nickname]) });
                        this.focusPlayersSelect();
                    });
                    fire.database().ref('players/lastID').set(newID);
                    this.setState({ newPlayerLoader: false, addPlayerCollapse: [] });
                    resolve(true);
                });
            });
        }

        inlinePlayerFields(arr) {
            const { form } = this.props;
            const { getFieldDecorator } = form;

            return arr.map((v, i) => <FormItem label={'Player ' + (v + i)} key={'player_' + (v + i)}>
                <Col span={12} style={{ paddingRight: '4px' }}>
                    <FormItem>
                        {getFieldDecorator('names[' + i + ']', {
                            rules: [{ required: true, message: 'Name is required!' }],
                        })(
                            <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Name" />
                        )}
                    </FormItem>
                </Col>
                <Col span={12} style={{ paddingLeft: '4px' }}>
                    <FormItem>
                        {getFieldDecorator('nicknames[' + i + ']', {
                            rules: [{ required: true, message: 'Nickname is required!' }],
                        })(
                            <Input prefix={<Icon type="smile-o" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Nickname" />
                        )}
                    </FormItem>
                </Col>
            </FormItem>);
        }

        focusPlayersSelect = function () {
            this.playersSelect.focus();
        }

        render() {
            const { visible, onCancel, form } = this.props;
            const { players, loading, newPlayerLoader, savingLeagueLoader } = this.state;
            const { getFieldDecorator } = form;
            const onOk = () => {
                const fieldsValues = form.getFieldsValue();
                const fieldsNames = Object.keys(fieldsValues).filter((name) => {
                    switch (name) {
                        case 'names':
                        case 'nicknames':
                            if (players.length) {
                                return false;
                            }
                            break;
                        case 'players':
                            if (!players.length) {
                                return false;
                            }
                            break;
                    }

                    return true;
                });

                const redirect = () => {
                    this.setState({ savingLeagueLoader: false });
                    onCancel().then(() => this.props.history.push('/about'));
                };

                // to do: check an error in console
                const createLeague = (params) => new Promise((resolve) => {
                    const leaguesRef = fire.database().ref('leagues');
                    leaguesRef.once('value', snapshot => {
                        const lastID = snapshot.val() && snapshot.val().lastID;
                        const newID = lastID ? lastID + 1 : 1;

                        fire.database().ref('leagues/list/_' + newID).set({ ...params, leagueID: newID })
                            .then(() => resolve(true));
                        fire.database().ref('leagues/lastID').set(newID);
                    });
                });

                form.validateFields(fieldsNames, (err, values) => {
                    if (!err) {
                        console.log('Received values of form: ', values);
                        const { names, nicknames, description } = values;
                        this.setState({ savingLeagueLoader: true });

                        if (names) {
                            //creating new players
                            let playerID;
                            const newPlayers = names.reduce((obj, name, i) => {
                                playerID = i + 1;
                                obj[`_${playerID}`] = { playerID, name, nickname: nicknames[i] };
                                return obj;
                            }, {});

                            console.log(newPlayers);

                            const playersRef = fire.database().ref('players');
                            playersRef.child('list').set(newPlayers)
                            //.then(createLeague(values)
                            //    .then(() => redirect())
                            //);

                            playersRef.child('lastID').set(playerID);
                        } else {
                            createLeague({
                                ...values,
                                description: description || ''
                            })
                                .then(() => redirect());
                        }
                    }
                });
            };

            return (
                <Modal
                    title="Create League"
                    visible={visible}
                    destroyOnClose={true}
                    maskClosable={false}
                    confirmLoading={savingLeagueLoader}
                    onOk={onOk}
                    onCancel={onCancel}
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
                        {loading ? <Spin size="small" style={{ width: '100%', marginBottom: '24px', height: '69px', paddingBottom: '8px' }} /> : players.length ?
                            <FormItem label="Players">
                                {getFieldDecorator('players', {
                                    rules: [{ required: true, len: 4, type: 'array' }],
                                })(
                                    <Select
                                        mode="multiple"
                                        ref={node => this.playersSelect = node}
                                    // notFoundContent={loading ? <Spin size="small" /> : 'add players'}
                                    >
                                        {players.map(p => <Option key={p.playerID} value={p.nickname}>{p.nickname}</Option>)}
                                    </Select>
                                )}
                            </FormItem> :
                            this.inlinePlayerFields(Array(4 - players.length).fill(1), players.length > 0)
                        }
                    </Form>
                    {players.length ?
                        <Collapse bordered={false} activeKey={this.state.addPlayerCollapse} onChange={this.addPlayerCollapseChange}>
                            <Panel header="add player" key="1">
                                <AddPlayerSmall callback={this.addPlayerCallback.bind(this)} players={this.state.players} loading={newPlayerLoader} />
                            </Panel>
                        </Collapse> : ''}

                    {/* <SelectionTool {...this.state} onSelectChange={this.onSelectChange} fetch={this.fetch.bind(this)} /> */}
                </Modal>
            );
        }
    }
);
export default withRouter(NewLeague);