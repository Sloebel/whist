import React, { Component } from 'react';
//import { withRouter } from "react-router-dom";
import { Modal } from 'antd';
import fire from './../fire.js';


class ResumeLeague extends Component {
    state = {
        showDialog: this.props.visible
    }

    /* Create reference to messages in Firebase Database */
    activeLeagues = fire.database().ref('leagues/list').orderByChild("active").equalTo(true);

    fetch() {
        this.activeLeagues.on('value', snapshot => {
            /* Update React state when a player is added at Firebase Database */
            console.log(snapshot.val());
            // if (snapshot.val()) {
            //     this.setState({ players: Object.values(snapshot.val()), loading: false });
            // } else {
            //     this.setState({ loading: false });
            // }
        });
    }

    componentDidMount() {
        this.fetch();
    }

    componentWillUnmount() {
        this.activeLeagues.off('value');
    }

    closeModal() {
        this.setState({
            showDialog: false
        });
    }

    render() {
        const { onCancel } = this.props;
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