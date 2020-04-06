import React, { Component } from 'react';
import { Modal, Form, Input, Select, Spin } from 'antd';
import { fire } from '../firebase';
import { onceGetUsers, onceGetLeagues } from '../firebase/db';
import { IBasicDialogProps } from './Dialog';
import { IPlayer, IRawPlayer } from '../models/ILeagueModel';
import { FormInstance } from 'antd/lib/form/Form';

const FormItem = Form.Item;
const Option = Select.Option;

interface INewLeagueState {
  showDialog: boolean;
  loading: boolean;
  savingLeagueLoader: boolean;
  users: { [userKey: string]: IRawPlayer };
  count: number;
}

export interface INewLeagueProps extends IBasicDialogProps<number> {}

class NewLeague extends Component<INewLeagueProps, INewLeagueState> {
  private leagueID: number | undefined;
  private formRef = React.createRef<FormInstance>();

  constructor(props: INewLeagueProps) {
    super(props);

    this.state = {
      showDialog: this.props.visible,
      users: {},
      count: 0,
      loading: true,
      // addPlayerCollapse: [],
      savingLeagueLoader: false,
    };
  }

  fetchPlayers() {
    onceGetUsers().then((snapshot) => {
      if (snapshot.val()) {
        this.setState({ users: snapshot.val(), loading: false });
      } else {
        this.setState({ loading: false });
      }
    });
  }

  componentDidMount() {
    this.fetchPlayers();
  }

  render() {
    const { showDialog, users, loading, savingLeagueLoader } = this.state;

    return (
      <Modal
        title="Create League"
        visible={showDialog}
        destroyOnClose={true}
        maskClosable={false}
        confirmLoading={savingLeagueLoader}
        onOk={this.onCreateLeague}
        onCancel={this.closeModal}
        afterClose={this.afterClose}
        // width="600px"
        okText="Save & Play"
        getContainer=".app"
      >
        <Form ref={this.formRef} layout="vertical">
          <FormItem
            label="Title"
            name="title"
            rules={[
              { required: true, message: 'Please input the league title!' },
            ]}
          >
            <Input />
          </FormItem>
          <FormItem label="Description" name="description">
            <Input type="textarea" />
          </FormItem>
          {
            <FormItem
              label="Players"
              name="players"
              rules={[{ required: true, len: 4, type: 'array' }]}
            >
              <Select
                mode="multiple"
                notFoundContent={loading ? <Spin size="small" /> : null}
              >
                {Object.keys(users).map((key) => (
                  <Option key={key} value={key}>
                    {users[key].nickname}
                  </Option>
                ))}
              </Select>
            </FormItem>
          }
        </Form>
      </Modal>
    );
  }

  private onCreateLeague = () => {
    const form = this.formRef.current;
    const { users } = this.state;

    form &&
      form
        .validateFields(['title', 'description', 'players'])
        .then((values) => {
          const { description } = values;
          this.setState({ savingLeagueLoader: true });

          const players: IPlayer[] = values.players.map((key: string) => ({
            key,
            nickname: users[key].nickname,
          }));

          onceGetLeagues().then((snapshot) => {
            const lastID = snapshot.val() && snapshot.val().lastID;
            const newID = lastID ? lastID + 1 : 1;

            fire
              .database()
              .ref('leagues/list/_' + newID)
              .set({
                ...values,
                players,
                description: description || '',
                leagueID: newID,
                active: true,
              })
              .then(() => this.setNewLeagueID(newID));
            fire.database().ref('leagues/lastID').set(newID);
          });
        });
  };

  private setNewLeagueID = (leagueID: number) => {
    this.leagueID = leagueID;

    this.closeModal();
  };
  // in order to preserve the animation when closing
  // there is also an inner state although visible state initialy is from props
  private closeModal = () => {
    this.setState({
      showDialog: false,
    });
  };

  private afterClose = () => {
    const { onAfterClose } = this.props;

    if (typeof onAfterClose === 'function') {
      onAfterClose(this.leagueID);
    }
  };
}

export default NewLeague;
