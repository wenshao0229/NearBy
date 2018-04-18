import React from 'react';
import { Modal, Button, message } from 'antd';
import { WrappedCreatePostForm } from './CreatePostForm';
import { API_ROOT, AUTH_PREFIX} from '../constants';
import PropTypes from 'prop-types';
import $ from 'jquery';

export class CreatePostButton extends React.Component {
    static propTypes = {
        loadNearbyPosts: PropTypes.func.isRequired,
    }
    state = {
        visible: false,
        confirmLoading: false,
    }

    showModal = () => {
        this.setState({
            visible: true,
        });
    }

    handleOk = () => {
        // get value
        const form = this.form.getWrappedForm();
        form.validateFields((err, values) => {
            if (err) { return; }
            console.log('Received values of form: ', values);

            const {lat, lon} = JSON.parse(localStorage.getItem('POS_KEY'));
            const formData = new FormData();
            formData.set('lat', lat + Math.random() * 0.1 - 0.05);
            formData.set('lon', lon + Math.random() * 0.1 - 0.05);
            formData.set('message', form.getFieldValue('message'));
            formData.set('image', form.getFieldValue('image')[0]);
            this.setState({ confirmLoading: true });

            // submit request
            $.ajax({
                url: `${API_ROOT}/post`,
                method: 'POST',
                headers: {
                    Authorization: `${AUTH_PREFIX} ${localStorage.getItem('TOKEN_KEY')}`
                },
                processData: false,
                contentType: false,
                dataType: 'text',
                data: formData,
            }).then(() => {
                message.success('created a post successfully.');
                form.resetFields();
                },(error) => {
                    message.error(error.responseText);
                    form.resetFields();
            }).then(() => {
                this.props.loadNearbyPosts().then(() => {
                    this.setState({ visible: false, confirmLoading: false });
                });
            }).catch((error) => {
                message.error('create post failed.');
                console.error(error);
            });
        });
    }

    handleCancel = () => {
        console.log('Clicked cancel button');
        this.setState({
            visible: false,
        });
    }

    saveFormRef = (form) => {
        this.form = form;
    }

    render() {
        return (
            <div>
                <Button type="primary" onClick={this.showModal}>Create New Post</Button>
                <Modal title="Create New Post"
                       visible={this.state.visible}
                       okText="Create"
                       cancelText="Cancel"
                       onOk={this.handleOk}
                       confirmLoading={this.state.confirmLoading}
                       onCancel={this.handleCancel}
                >
                    <WrappedCreatePostForm wrappedComponentRef={this.saveFormRef}/>
                </Modal>
            </div>
        );
    }
}