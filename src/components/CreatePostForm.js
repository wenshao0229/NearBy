import React from 'react';
import { Form, Input, Icon, Upload } from 'antd';

const FormItem = Form.Item;

class CreatePostForm extends React.Component {
    normFile = (e) => {
        console.log('Upload event:', e);
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    }

    beforeUpload = () => {
        return false;
    }

    getWrappedForm = () => {
        return this.props.form;
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 14 },
        };

        return(
            <Form layout="vertical">
                <FormItem
                    {...formItemLayout}
                    label="Message"
                >
                    {getFieldDecorator('message', {
                        rules: [{ required: true, message: 'Please input the title of post' }],
                    })(
                        <Input />
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="Image"
                >
                    <div className="image">
                        {getFieldDecorator('image', {
                            rules: [{ required: true, message: 'Please upload the image' }],
                            valuePropName: 'fileList',
                            getValueFromEvent: this.normFile,
                        })(
                            <Upload.Dragger
                                name="files"
                                action="/upload.do"
                                beforeUpload={this.beforeUpload}
                            >
                                <p className="ant-upload-drag-icon">
                                    <Icon type="inbox" />
                                </p>
                                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                                <p className="ant-upload-hint">Support for a single or bulk upload.</p>
                            </Upload.Dragger>
                        )}
                    </div>
                </FormItem>
            </Form>
        );
    }
}

export const WrappedCreatePostForm = Form.create()(CreatePostForm)