import React from 'react';
// import fire from './../fire.js';
import { Tabs, Table } from 'antd';
import { EditableFormRow, EditableCell } from './../common/table/EditableCell.js'
import './GameTab.css';

const TabPane = Tabs.TabPane;

class GameTab extends TabPane {
	constructor(props) {
	    super(props);
	
	    this.columns = [{
	        children: [{
	            title: 'Score',
	            children: [{
	                title: 'round',
	                dataIndex: 'round',
	                width: 75,
	            }]
	        }]
	    }, {
	        title: 'player 1',
	        editable: true,
	        children: [{
	            title: 'score',
	            children: [{
	                title: 'Bid',
	                dataIndex: 'bid1',
	                width: 100,
	                onCell: record => ({
			          record,
			          editable: true,
			          dataIndex: 'bid1',
			          title: 'Bid',
			          handleSave: this.handleSave,
			        }),
	            }, {
	                title: 'Won',
	                dataIndex: 'won1',
	                width: 100,
	            }]
	        }],
	    }, {
	        title: 'player 2',
	        children: [{
	            title: 'score',
	            children: [{
	                title: 'Bid',
	                dataIndex: 'bid2',
	                width: 100,
	            }, {
	                title: 'Won',
	                dataIndex: 'won2',
	                width: 100,
	            }]
	        }],
	    }, {
	        title: 'player 3',
	        children: [{
	            title: 'score',
	            children: [{
	                title: 'Bid',
	                dataIndex: 'bid3',
	                width: 100,
	            }, {
	                title: 'Won',
	                dataIndex: 'won3',
	                width: 100,
	            }]
	        }],
	    }, {
	        title: 'player 4',
	        children: [{
	            title: 'score',
	            children: [{
	                title: 'Bid',
	                dataIndex: 'bid4',
	                width: 100,
	            }, {
	                title: 'Won',
	                dataIndex: 'won4',
	                width: 100,
	            }]
	        }],
	    }];
	}

	handleSave = (row) => {}
    render() {       

     //    const columns = this.columns.map((col) => {      
	    //   return {
	    //     ...col,
	    //     onCell: record => ({
	    //       record,
	    //       editable: col.editable,
	    //       dataIndex: col.dataIndex,
	    //       title: col.title,
	    //       handleSave: this.handleSave,
	    //     }),
	    //   };
	    // });

        const dataSource = []

        for (let i = 0; i < 13; i++) {
            dataSource.push({
                round: i + 1,
                bid1: '',
                won1: null,
                bid2: null,
                won2: null,
                bid3: null,
                won3: null,
                bid4: null,
                won4: null,
            });
        }

        const components = {
	      body: {
	        row: EditableFormRow,
	        cell: EditableCell,
	      },
	    };

        return (
            <Table
                className='game-table'
                components={components}
                columns={this.columns}
                rowKey='round'
                dataSource={dataSource}
                size='small'
                bordered
                pagination={false}
            	scroll={{ y: 520 }}
            />
        );
    }
}

export default GameTab;
