import React, { Component } from 'react';
import { Modal, Button, Form, Input, Select, Spin, Collapse, Icon } from 'antd';
import fire from './../fire.js';
import SelectionTool from './../players/SelectionTool';
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
        };

        onSelectChange = (selectedRowKeys) => {
            this.setState({ selectedRowKeys });
        }


        fetch() {
            /* Create reference to messages in Firebase Database */
            let messagesRef = fire.database().ref('players').orderByKey().limitToLast(100);
            messagesRef.on('value', snapshot => {
                /* Update React state when message is added at Firebase Database */
                // let message = { text: snapshot.val(), id: snapshot.key };
                if (snapshot.val()) {
                    this.setState({ players: [snapshot.val()].concat(this.state.dataSource), loading: false });
                } else {
                    this.setState({ loading: false });
                }

                console.log(snapshot.val());
            })
        }

        componentDidMount() {
            this.fetch();
        }

        addPlayerCallback = (e) => {
            console.log('callback');
        }

        render() {
            const { visible, onCancel, content, form } = this.props;
            const { players, loading } = this.state;
            const { getFieldDecorator } = form;
            const onOk = () => {
                console.log('myOk');
                onCancel()
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
                                rules: [{ required: true, message: 'Please input the title of collection!' }],
                            })(
                                <Input />
                            )}
                        </FormItem>
                        <FormItem label="Description">
                            {getFieldDecorator('description')(<Input type="textarea" />)}
                        </FormItem>
                        <FormItem label="Players">
                            {getFieldDecorator('description')(
                                <Select
                                    mode="multiple"
                                    notFoundContent={loading ? <Spin size="small" /> : 'add players'}
                                >
                                    {players.map(p => <Option key={p.id}>{p.nickname}</Option>)}
                                </Select>
                            )}
                        </FormItem>

                    </Form>
                    <Collapse bordered={false}>
                        <Panel header="add player">
                            <AddPlayerSmall callback={this.addPlayerCallback} />
                        </Panel>
                    </Collapse>

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