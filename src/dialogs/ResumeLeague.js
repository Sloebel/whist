import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { Modal } from 'antd';
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
                <ul className="clickable-list">
                    {
                        activeLeagues.map((item, index) => {
                            const { leagueID, title } = item;
                            return <li key={index} onClick={() => this.closeModal(leagueID)}>
                                {title}
                            </li>;
                        })
                    }
                </ul>
            </Modal>
        );
    }
}

export default withRouter(ResumeLeague);