import React from 'react';
import { Button } from 'antd';
import Dialog from './../dialogs/Dialog';

const MainMenu = (props) => {
    return (
        <ul className="app-menu">
            {props.items.map((item, index) => {
                const { onClick, text, dialog, dialogProps, disabled } = item;

                // the Dialog should not be instanced unless it's visible 
                // in some Dialogs there are calls to the DB
                return <li key={index}>
                    <Button onClick={onClick} size="large" disabled={disabled} block>{text}</Button>
                    {dialog && dialogProps.visible ? <Dialog dialog={dialog} dialogProps={dialogProps} /> : ''}
                </li>;
            })}
        </ul>
    );
}

export default MainMenu;