import React, { Component } from 'react';
//import { withRouter } from "react-router-dom";
import { Modal } from 'antd';
//import fire from './../fire.js';


class ResumeLeague extends Component {
    state = {
        showDialog: this.props.visible
    }

    closeModal() {
        this.setState({
            showDialog: false
        });
    }
    
    render() {
        const { visible , onCancel} = this.props;
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
            </Modal>
        );
    }
}

export default ResumeLeague;