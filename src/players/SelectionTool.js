import React, { Component } from 'react';
import { Table, Button } from 'antd';
import './SelectionTool.css';


const columns = [{
    title: 'Name',
    dataIndex: 'name',
}, {
    title: 'Nick Name',
    dataIndex: 'nickname',
}];

// const data = [];
// for (let i = 0; i < 4; i++) {
//     data.push({
//         key: i,
//         name: `Edward King ${i}`,
//         nickname: `nickname ${i}`,
//     });
// }

class SelectionTool extends Component {
    // state = {
    //     selectedRowKeys: [], // Check here to configure the default column
    //     loading: false,
    // };

    // start = () => {
    //     this.setState({ loading: true });
    //     // ajax request after empty completing
    //     setTimeout(() => {
    //         this.setState({
    //             selectedRowKeys: [],
    //             loading: false,
    //         });
    //     }, 2000);
    // }

    // onSelectChange = (selectedRowKeys) => {
    //     this.setState({ selectedRowKeys });
    // }

    componentDidMount() {
        this.props.fetch();
    }

    render() {
        const { loading, selectedRowKeys, players, onSelectChange } = this.props;
        const rowSelection = {
            selectedRowKeys,
            onChange: onSelectChange,
        };
        const hasSelected = selectedRowKeys.length > 0;
        return (
            <div>
                <h4>Choose Players</h4>
                <div style={{ marginBottom: 16 }}>
                    <Button
                        type="primary"
                        onClick={this.start}
                        disabled={!hasSelected}
                        loading={loading}
                    >
                        Reload
                    </Button>
                    <span style={{ marginLeft: 8 }}>
                        {hasSelected ? `Selected ${selectedRowKeys.length} player` : ''}
                    </span>
                </div>
                <Table loading={loading} rowSelection={rowSelection} columns={columns} dataSource={players} pagination={false} showHeader={true} locale={{ emptyText: "no players" }} />
            </div>
        );
    }
}

// import { Table, Input, Button, Popconfirm, Form } from 'antd';

// const FormItem = Form.Item;
// const EditableContext = React.createContext();

// const EditableRow = ({ form, index, ...props }) => (
//     <EditableContext.Provider value={form}>
//         <tr {...props} />
//     </EditableContext.Provider>
// );

// const EditableFormRow = Form.create()(EditableRow);

// class EditableCell extends Component {
//     state = {
//         editing: false,
//     }

//     componentDidMount() {
//         if (this.props.editable) {
//             document.addEventListener('click', this.handleClickOutside, true);
//         }
//     }

//     componentWillUnmount() {
//         if (this.props.editable) {
//             document.removeEventListener('click', this.handleClickOutside, true);
//         }
//     }

//     toggleEdit = () => {
//         const editing = !this.state.editing;
//         this.setState({ editing }, () => {
//             if (editing) {
//                 this.input.focus();
//             }
//         });
//     }

//     handleClickOutside = (e) => {
//         const { editing } = this.state;
//         if (editing && this.cell !== e.target && !this.cell.contains(e.target)) {
//             this.save();
//         }
//     }

//     save = () => {
//         const { record, handleSave } = this.props;
//         this.form.validateFields((error, values) => {
//             if (error) {
//                 return;
//             }
//             this.toggleEdit();
//             handleSave({ ...record, ...values });
//         });
//     }

//     render() {
//         const { editing } = this.state;
//         const {
//             editable,
//             dataIndex,
//             title,
//             record,
//             index,
//             handleSave,
//             ...restProps
//         } = this.props;
//         return (
//             <td ref={node => (this.cell = node)} {...restProps}>
//                 {editable ? (
//                     <EditableContext.Consumer>
//                         {(form) => {
//                             this.form = form;
//                             return (
//                                 editing ? (
//                                     <FormItem style={{ margin: 0 }}>
//                                         {form.getFieldDecorator(dataIndex, {
//                                             rules: [{
//                                                 required: true,
//                                                 message: `${title} is required.`,
//                                             }],
//                                             initialValue: record[dataIndex],
//                                         })(
//                                             <Input
//                                                 ref={node => (this.input = node)}
//                                                 onPressEnter={this.save}
//                                             />
//                                         )}
//                                     </FormItem>
//                                 ) : (
//                                         <div
//                                             className="editable-cell-value-wrap"
//                                             style={{ paddingRight: 24 }}
//                                             onClick={this.toggleEdit}
//                                         >
//                                             {restProps.children}
//                                         </div>
//                                     )
//                             );
//                         }}
//                     </EditableContext.Consumer>
//                 ) : restProps.children}
//             </td>
//         );
//     }
// }

// class SelectionTool extends Component {
//     constructor(props) {
//         super(props);
//         this.columns = [{
//             title: 'name',
//             dataIndex: 'name',
//             width: '30%',
//             editable: true,
//         }, {
//             title: 'Nick Name',
//             dataIndex: 'nickName',
//             editable: true,
//         }, {
//             title: 'operation',
//             dataIndex: 'operation',
//             render: (text, record) => {
//                 return (
//                     this.state.dataSource.length > 1
//                         ? (
//                             <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(record.key)}>
//                                 <a href="javascript:;">Delete</a>
//                             </Popconfirm>
//                         ) : null
//                 );
//             },
//         }];

//         this.state = {
//             // dataSource: [{
//             //     key: '0',
//             //     name: 'Edward King 0',
//             //     nickName: 'nickName 0'
//             // }, {
//             //     key: '1',
//             //     name: 'Edward King 1',
//             //     nickName: 'nickName 1',
//             // }],
//             // count: 2,
//             dataSource: [],
//             count: 0,
//             selectedRowKeys: [], // Check here to configure the default column
//         };
//     }

//     onSelectChange = (selectedRowKeys) => {
//         this.setState({ selectedRowKeys });
//     }

//     handleDelete = (key) => {
//         const dataSource = [...this.state.dataSource];
//         this.setState({ dataSource: dataSource.filter(item => item.key !== key) });
//     }

//     handleAdd = () => {
//         const { count, dataSource } = this.state;
//         const newData = {
//             key: count,
//             name: '',
//             nickName: '',
//         };
//         this.setState({
//             dataSource: [...dataSource, newData],
//             count: count + 1,
//         });
//     }

//     handleSave = (row) => {
//         const newData = [...this.state.dataSource];
//         const index = newData.findIndex(item => row.key === item.key);
//         const item = newData[index];
//         newData.splice(index, 1, {
//             ...item,
//             ...row,
//         });
//         this.setState({ dataSource: newData });
//     }

//     render() {
//         const { dataSource, selectedRowKeys } = this.state;
//         const rowSelection = {
//             selectedRowKeys,
//             onChange: this.onSelectChange,
//         };
//         const hasSelected = selectedRowKeys.length > 0;
//         const components = {
//             body: {
//                 row: EditableFormRow,
//                 cell: EditableCell,
//             },
//         };
//         const columns = this.columns.map((col) => {
//             if (!col.editable) {
//                 return col;
//             }
//             return {
//                 ...col,
//                 onCell: record => ({
//                     record,
//                     editable: col.editable,
//                     dataIndex: col.dataIndex,
//                     title: col.title,
//                     handleSave: this.handleSave,
//                 }),
//             };
//         });
//         return (
//             <div>
//                 <Button onClick={this.handleAdd} type="primary" style={{ marginBottom: 16 }}>
//                     Add a row
//                 </Button>
//                 <span style={{ marginLeft: 8 }}>
//                     {hasSelected ? `Selected ${selectedRowKeys.length} players` : ''}
//                 </span>
//                 <Table
//                     components={components}
//                     rowSelection={rowSelection}
//                     rowClassName={() => 'editable-row'}
//                     bordered
//                     dataSource={dataSource}
//                     columns={columns}
//                     pagination={false}
//                     locale={{ emptyText: "no players" }}
//                 />
//             </div>
//         );
//     }
// }

export default SelectionTool;