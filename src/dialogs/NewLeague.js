import React, { Component } from 'react';
import { Modal, Button, Form, Input, Select, Spin, Collapse, Icon, Col } from 'antd';
import fire from './../fire.js';
import SelectionTool from './../players/SelectionTool';
import AddPlayerSmall from './../players/AddPlayerSmall';

const FormItem = Form.Item;
const Option = Select.Option;
const Panel = Collapse.Panel;
console.log(Collapse)


const NewLeague = Form.create()(
    class extends Component {
        state = {
            players: [],
            count: 0,
            loading: true,
            selectedRowKeys: [], // Check here to configure the default column
            addPlayerCollapse: []
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
                /* Update React state when message is added at Firebase Database */
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
                    this.setState({ loading: true });
                    fire.database().ref('players').once('value', snapshot => {

                        const newID = snapshot.val().lastID + 1;

                        fire.database().ref('players/list/_' + newID).set({ ...values, playerID: newID });
                        fire.database().ref('players/lastID').set(newID);
                        this.setState({ loading: false, addPlayerCollapse: [] });
                        resolve(true);
                    });
                })
        }


        inlinePlayerFields(arr) {
            const { form } = this.props;
            const { getFieldDecorator } = form;
            console.log('inlinePlayerFields');
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

        render() {
            const { visible, onCancel, content, form } = this.props;
            const { players, loading } = this.state;
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

                console.log('myOk');
                console.log(fieldsValues);

                form.validateFields(fieldsNames, (err, values) => {
                    if (!err) {
                        console.log('Received values of form: ', values);
                        const { names, nicknames } = values;

                        if (names) {
                            let playerID;
                            const players = names.reduce((obj, name, i) => {
                                playerID = i + 1;
                                obj[`_${playerID}`] = { playerID, name, nickname: nicknames[i] };
                                return obj;
                            }, {});

                            console.log(players);

                            const playersRef = fire.database().ref('players');
                            playersRef.child('list').set(players)
                                .then(function () {
                                    console.log('Synchronization succeeded');
                                });

                            playersRef.child('lastID').set(playerID);
                        }

                        onCancel();
                    }
                });
            };

            return (
                <Modal
                    title="Create League"
                    visible={visible}
                    destroyOnClose={true}
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
                        {players.length ?
                            <FormItem label="Players">
                                {getFieldDecorator('players', {
                                    rules: [{ required: true, len: 4, type: 'array' }],
                                })(
                                    <Select
                                        mode="multiple"
                                    // notFoundContent={loading ? <Spin size="small" /> : 'add players'}
                                    >
                                        {players.map(p => <Option key={p.playerID} value={p.playerID}>{p.nickname}</Option>)}
                                    </Select>
                                )}
                            </FormItem> :
                            this.inlinePlayerFields(Array(4 - players.length).fill(1), players.length > 0)
                        }
                    </Form>
                    {players.length ?
                        <Collapse bordered={false} activeKey={this.state.addPlayerCollapse} onChange={this.addPlayerCollapseChange}>
                            <Panel header="add player" key="1">
                                <AddPlayerSmall callback={this.addPlayerCallback.bind(this)} players={this.state.players} loading={loading}/>
                            </Panel>
                        </Collapse> : ''}

                    {/* <SelectionTool {...this.state} onSelectChange={this.onSelectChange} fetch={this.fetch.bind(this)} /> */}
                </Modal>
            );
        }
    }
);


// class NewLeague extends Component {
//     state = {
//         // dataSource: [{
//         //     key: '0',
//         //     name: 'Edward King 0',
//         //     nickName: 'nickName 0'
//         // }, {
//         //     key: '1',
//         //     name: 'Edward King 1',
//         //     nickName: 'nickName 1',
//         // }],
//         // count: 2,
//         dataSource: [],
//         count: 0,
//         loading: true,
//         selectedRowKeys: [], // Check here to configure the default column
//     };

//     onSelectChange = (selectedRowKeys) => {
//         this.setState({ selectedRowKeys });
//     }


//     fetch() {
//         /* Create reference to messages in Firebase Database */
//         let messagesRef = fire.database().ref('players').orderByKey().limitToLast(100);
//         messagesRef.on('value', snapshot => {
//             /* Update React state when message is added at Firebase Database */
//             // let message = { text: snapshot.val(), id: snapshot.key };
//             if (snapshot.val()) {
//                 this.setState({ dataSource: [snapshot.val()].concat(this.state.dataSource), loading: false });
//             } else {
//                 this.setState({ loading: false });
//             }

//             console.log(snapshot.val());
//         })
//     }



//     // componentDidMount() {
//     //     this.fetch();
//     // }

//     render() {
//         const { visible, onCancel, content } = this.props;
//         const onOk = () => {
//             console.log('myOk');
//             onCancel()
//         };

//         return (
//             <Modal
//                 title="Create League"
//                 visible={visible}
//                 destroyOnClose={true}
//                 onOk={onOk}
//                 onCancel={onCancel}
//                 width="600px"
//                 okText="Save & Play"
//             >
//                 <SelectionTool {...this.state} onSelectChange={this.onSelectChange} fetch={this.fetch.bind(this)} />
//             </Modal>
//         )
//     }
// }

export default NewLeague;