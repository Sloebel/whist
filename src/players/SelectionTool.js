import React, { Component } from "react";
import { Table, Button } from "antd";
import "./SelectionTool.css";

const columns = [
  {
    title: "Name",
    dataIndex: "name"
  },
  {
    title: "Nick Name",
    dataIndex: "nickname"
  }
];

class SelectionTool extends Component {
  componentDidMount() {
    this.props.fetch();
  }

  render() {
    const { loading, selectedRowKeys, players, onSelectChange } = this.props;
    const rowSelection = {
      selectedRowKeys,
      onChange: onSelectChange
    };
    const hasSelected = selectedRowKeys.length > 0;
    return (
      <div>
        <h4>Choose Players</h4>
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            onClick={this.start}
            disabled={!hasSelected}
            loading={loading}
          >
            Reload
          </Button>
          <span style={{ marginLeft: 8 }}>
            {hasSelected ? `Selected ${selectedRowKeys.length} player` : ""}
          </span>
        </div>
        <Table
          loading={loading}
          rowSelection={rowSelection}
          columns={columns}
          dataSource={players}
          pagination={false}
          showHeader={true}
          locale={{ emptyText: "no players" }}
        />
      </div>
    );
  }
}

export default SelectionTool;
