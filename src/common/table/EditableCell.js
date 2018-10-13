import React, { Component } from 'react';
import { Form, Select } from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;
const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends Component {
  state = {
    editing: false,
  }

  componentDidMount() {
    if (this.props.editable) {
      document.addEventListener('click', this.handleClickOutside, true);
    }
  }

  componentWillUnmount() {
    if (this.props.editable) {
      document.removeEventListener('click', this.handleClickOutside, true);
    }
  }
  
  getOptionList(editorType) {
    if (editorType === 'bidWin') {
      return [...Array(15)].map((_, i) => {
        const value = (i - 1) < 0 ? '' : i - 1;
        return <Option key={i} value={`${value}`}>{value}</Option>;
      });
    } else if (editorType === 'trump') {
      return ['Spade', 'Hart', 'Diamond', 'Club', 'NT'].map((value, i) => {
        return <Option key={i} value={`${value}`}>{value}</Option>;
      });
    }
  }

  toggleEdit = () => {
    const editing = !this.state.editing;
    this.setState({ editing }, () => {
      if (editing) {
        this.input.focus();
      }
    });
  }

  handleClickOutside = (e) => {
    const { editing } = this.state;
    if (editing && this.cell !== e.target && !this.cell.contains(e.target) && e.target.tagName !== "LI") {
      setTimeout(this.toggleEdit, 300);
    }
  }

  save = (player) => {
    const { record, handleSave } = this.props;

    setTimeout(() => {
      this.form.validateFields((error, values) => {
        if (error) {
          return;
        }
        this.toggleEdit();
        handleSave({ ...record, ...values }, player);
      });
    }, 300)

  }

  render() {
    const { editing } = this.state;
    const {
      editable,
      editorType,
      dataIndex,
      player,
      record,
      index,
      handleSave,
      ...restProps
    } = this.props;

    return (
      <td ref={node => (this.cell = node)} {...restProps}>
        {editable ? (
          <EditableContext.Consumer>
            {(form) => {
              this.form = form;
              return (
                editing ? (
                  <FormItem style={{ margin: 0 }}>
                    {form.getFieldDecorator(dataIndex, {
                      // rules: [{
                      //   required: true,
                      //   message: `${title} is required.`,
                      // }],
                      initialValue: record[dataIndex],
                    })(
                      <Select
                        ref={node => (this.input = node)}
                        // onPressEnter={this.save}
                        onSelect={() => this.save(player)}
                        defaultOpen={true}
                        showArrow={false}
                        size={'small'}
                        style={{ width: 60 }}
                      >
                        {this.getOptionList(editorType)}
                      </Select>
                    )}
                  </FormItem>
                ) : (
                    <div
                      className="editable-cell-value-wrap"
                      // style={{ paddingRight: 24 }}
                      onClick={this.toggleEdit}
                    >
                      {restProps.children}
                    </div>
                  )
              );
            }}
          </EditableContext.Consumer>
        ) : restProps.children}
      </td>
    );
  }
}

export { EditableFormRow, EditableCell };
