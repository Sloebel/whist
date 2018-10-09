import React, { Component } from 'react';
import { Form, Select } from 'antd';

const Option = Select.Option;

class BidWinSelect extends Component {
    constructor(props) {
        super(props);
        this.textInput = null;

        this.setTextInputRef = element => {
            this.textInput = element;
        };

        this.focusTextInput = () => {
            // Focus the text input using the raw DOM API
            if (this.textInput) this.textInput.focus();
        };
    }

    componentDidMount() {
        // autofocus the input on mount
        this.focusTextInput();
    }

    render() {
        const { onSelect } = this.props;

        return (
            <Select
                ref={this.setTextInputRef}
                defaultOpen={true}
                showArrow={false}
                style={{ width: 60 }}
                onSelect={onSelect}
            >
                {[...Array(15)].map((_, i) => {
                    const value = (i - 1) < 0 ? '' : i - 1;
                    return <Option key={i} value={`${value}`}>{value}</Option>;
                })}
            </Select >
        );
    }
}

export { BidWinSelect };