import React, { Component } from 'react';
// import fire from './../fire.js';
import { Tabs, Table } from 'antd';
import './GameTab.css';

const TabPane = Tabs.TabPane;

class GameTab extends TabPane {

    render() {
        const columns = [{
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
            children: [{
                title: 'score',
                children: [{
                    title: 'Bid',
                    dataIndex: 'bid1',
                    width: 100,
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

        const dataSource = []

        for (let i = 0; i < 13; i++) {
            dataSource.push({
                round: i + 1,
                bid1: null,
                won1: null,
                bid2: null,
                won2: null,
                bid3: null,
                won3: null,
                bid4: null,
                won4: null,
            });
        }

        return (
            <Table
                className='game-table'
                columns={columns}
                rowKey='round'
                dataSource={dataSource}
                size='small'
                bordered
                pagination={false}
            // scroll={{ y: 520 }}
            />
        );
    }
}

export default GameTab;
