import React, { Component } from 'react';
//import { withRouter } from "react-router-dom";
import { Modal } from 'antd';
//import fire from './../fire.js';


class ResumeLeague extends Component {
    render() {
        const { visible , onCancel} = this.props;
        return (
            <Modal
                title="Resume League"
                visible={visible}
                destroyOnClose={true}
                maskClosable={false}
                width="600px"
                footer={null}
                onCancel={onCancel}
            >
                <p>
                    List of open leagues
                </p>
            </Modal>
        );
    }
}

export default ResumeLeague;