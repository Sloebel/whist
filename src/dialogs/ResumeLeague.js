import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { Modal } from 'antd';
// import fire from './../fire.js';


class ResumeLeague extends Component {
    state = {
        showDialog: this.props.visible,
    }

    closeModal() {
        this.setState({
            showDialog: false
        });
    }

    render() {
        const { onCancel, activeLeagues } = this.props;
        const { showDialog } = this.state;

        return (
            <Modal
                title="Resume League"
                visible={showDialog}
                destroyOnClose={true}
                maskClosable={false}
                width="600px"
                footer={null}
                onCancel={this.closeModal.bind(this)}
                afterClose={onCancel}
            >
                <p>
                    List of open leagues
                </p>
                <ul className="">
                    {
                        activeLeagues.map((item, index) => {
                            const { leagueID, title } = item;
                            return <li key={index} onClick={() => this.props.history.push('/league/' + leagueID)}>
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