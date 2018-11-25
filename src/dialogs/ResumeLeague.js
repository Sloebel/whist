import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { Modal, List } from 'antd';
import './ResumeLeague.css';


class ResumeLeague extends Component {
    state = {
        showDialog: this.props.visible,
    }

    closeModal(leagueID) {
        // if leagueID - first close the modal then afterClose will pass the leagueID to rout to the right location
        this.leagueID = leagueID;

        this.setState({
            showDialog: false
        });
    }

    render() {
        const { afterClose, activeLeagues } = this.props;
        const { showDialog } = this.state;

        return (
            <Modal
                title="Resume League"
                visible={showDialog}
                destroyOnClose={true}
                maskClosable={false}
                width="600px"
                footer={null}
                onCancel={() => this.closeModal()}
                afterClose={() => afterClose(this.leagueID)}
            >
                <p>
                    List of open leagues
                </p>
                <List
                    itemLayout="horizontal"
                    dataSource={activeLeagues}
                    renderItem={item => (
                        <List.Item>
                            <List.Item.Meta
                                title={<a onClick={() => this.closeModal(item.leagueID)}>{item.title}</a>}
                            />
                        </List.Item>
                    )}
                />

            </Modal>
        );
    }
}

export default withRouter(ResumeLeague);
