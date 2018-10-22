import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { Modal, Form, Input, Select, Spin, Collapse, Icon, Col } from 'antd';
import fire from './../fire.js';
import AddPlayerSmall from './../players/AddPlayerSmall';

const FormItem = Form.Item;
const Option = Select.Option;
const Panel = Collapse.Panel;

const NewLeague = Form.create()(
    class extends Component {
        state = {
            showDialog: this.props.visible,
            players: [],
            count: 0,
            loading: true,
            // selectedRowKeys: [], // Check here to configure the default column
            addPlayerCollapse: [],
            newPlayerLoader: false,
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

        /* Create reference to players in Firebase Database */
        playersList = fire.database().ref('players/list').orderByKey();

        fetch() {
            this.playersList.on('value', snapshot => {
                /* Update React state when a player is added at Firebase Database */
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

        componentWillUnmount() {
            this.playersList.off('value');
        }

        // returning a promise in order to let the form know it's ok to reset the form
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

                    // stop the loader and close the add player panel
                    this.setState({
                        newPlayerLoader: false,
                        addPlayerCollapse: []
                    });

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

        closeModal() {
            this.setState({
                showDialog: false
            });
        }

        render() {
            const { onCancel: onDialogClose, form } = this.props;
            const { showDialog, players, loading, newPlayerLoader, savingLeagueLoader } = this.state;
            const { getFieldDecorator } = form; // antd API

            const onCreateLeague = () => {
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

                const redirect = newID => {
                    this.setState({ savingLeagueLoader: false });
                    onDialogClose().then(() => this.props.history.push('/league/' + newID));
                };

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

                form.validateFields(fieldsNames, (err, values) => {
                    if (!err) {
                        const { names, nicknames, description } = values;
                        this.setState({ savingLeagueLoader: true });

                        // if names means the form was with less then 4 players 
                        // and players needs to be created before creating new league
                        if (names) {
                            //creating new players
                            let playerID;
                            const newPlayers = names.reduce((obj, name, i) => {
                                playerID = i + 1;
                                obj[`_${playerID}`] = { playerID, name, nickname: nicknames[i] };
                                return obj;
                            }, {});

                            const playersRef = fire.database().ref('players');
                            const { title } = values;

                            playersRef.child('list').set(newPlayers)
                                .then(createLeague({
                                    title,
                                    players: nicknames,
                                    description: description || ''
                                })
                                    .then((newID) => redirect(newID))
                                );

                            playersRef.child('lastID').set(playerID);
                        } else {
                            createLeague({
                                ...values,
                                description: description || ''
                            })
                                .then((newID) => redirect(newID));
                        }
                    }
                });
            };

            return (
                <Modal
                    title="Create League"
                    visible={showDialog}
                    destroyOnClose={true}
                    maskClosable={false}
                    confirmLoading={savingLeagueLoader}
                    onOk={onCreateLeague}
                    onCancel={this.closeModal.bind(this)}
                    afterClose={onDialogClose}
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
                                    >
                                        {players.map(p => <Option key={p.playerID} value={p.nickname}>{p.nickname}</Option>)}
                                    </Select>
                                )}
                            </FormItem> :
                            this.inlinePlayerFields(Array(4 - players.length).fill(1), players.length > 0)
                        }
                    </Form>
                    {players.length ?
                        <Collapse
                            bordered={false}
                            activeKey={this.state.addPlayerCollapse}
                            onChange={this.addPlayerCollapseChange}
                        >
                            <Panel header="add player" key="1">
                                <AddPlayerSmall
                                    callback={this.addPlayerCallback.bind(this)}
                                    players={players} // for validation purposes
                                    loading={newPlayerLoader}
                                />
                            </Panel>
                        </Collapse> : ''}
                </Modal>
            );
        }
    }
);
export default withRouter(NewLeague);