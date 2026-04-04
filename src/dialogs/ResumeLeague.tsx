import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Modal, List, Tag } from 'antd';
import { ILeagueModel } from '../models/ILeagueModel';
import { IBasicDialogProps } from './Dialog';
import './ResumeLeague.scss';

export interface IResumeLeagueProps extends IBasicDialogProps<number>, RouteComponentProps {
	activeLeagues: ILeagueModel[];
	afterClose?: (leagueID?: number) => void;
}

interface IResumeLeagueState {
	showDialog: boolean;
}

class ResumeLeague extends Component<IResumeLeagueProps, IResumeLeagueState> {
	private leagueID: number | undefined;

	constructor(props: IResumeLeagueProps) {
		super(props);

		this.state = {
			showDialog: this.props.visible
		};
	}

	private closeModal = (leagueID?: number) => {
		this.leagueID = leagueID;

		this.setState({
			showDialog: false
		});
	};

	render() {
		const { afterClose, activeLeagues } = this.props;
		const { showDialog } = this.state;

		console.log('active Leagues', activeLeagues);
		return (
			<Modal
				title="Resume League"
				visible={showDialog}
				destroyOnClose={true}
				maskClosable={false}
				width="600px"
				footer={null}
				onCancel={() => this.closeModal()}
				afterClose={() => afterClose?.(this.leagueID)}
			>
				<p>List of open leagues</p>
				<List
					itemLayout="horizontal"
					dataSource={activeLeagues}
					renderItem={(item: ILeagueModel) => (
						<List.Item>
							<List.Item.Meta
								title={
									<a href="#!" onClick={(e) => { e.preventDefault(); this.closeModal(item.leagueID); }} className="league-item">
										{item.title}
										{item.isDemo && (
											<Tag color="orange" style={{ marginLeft: 8 }}>
												Demo
											</Tag>
										)}
									</a>
								}
							/>
						</List.Item>
					)}
				/>
			</Modal>
		);
	}
}

export default withRouter(ResumeLeague);
