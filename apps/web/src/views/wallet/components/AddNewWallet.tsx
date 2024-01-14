import { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, Input, Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import { addWallet } from '../../../store/wallet/wallet.actions';
import { selectUsers } from "../../../store/user/user.selectors";
import { getUsers } from '../../../store/user/user.actions';
import { EUserStatus } from '../../../types';

interface WalletForm {
  name: string;
  privateKey: string;
  publicKey: string;
  users: string[];
}

export const AddNewWallet = () => {
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
  // const [confirmLoading, _] = useState(false);
  const [form] = Form.useForm();
  const { Option } = Select;
  const users = useSelector(selectUsers);

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  const filteredUsers = useMemo(() => {
    let computed = users;
    const me = localStorage.getItem("id");
    computed = computed.filter(user => user.status !== EUserStatus.BLOCKED && user._id !== me);
    return computed;
  }, [users]);

  const showModal = () => {
    setVisible(true);
  };

  const handleOk = async () => {
    await form.validateFields();
    form.submit();
    setVisible(false);
  };

  const handleCancel = () => {
    form.resetFields();
    setVisible(false);
  };

  const onFinish = (values: WalletForm) => {
    const users = values.users ? values.users.slice() : [];
    dispatch(addWallet({
      name: values.name,
      privateKey: values.privateKey,
      publicKey: values.publicKey,
      users
    }));
    form.resetFields();
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        Add New
      </Button>
      <Modal
        title="Add New Wallet"
        visible={visible}
        onOk={handleOk}
        // confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            label="Wallet Name"
            name="name"
            rules={[{ required: true, message: 'Please enter wallet name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Private Key"
            name="privateKey"
            rules={[{ required: true, message: 'Please enter private key!' }]}
          >
            <Input placeholder="input private key" />
          </Form.Item>

          <Form.Item
            label="Wallet Address"
            name="publicKey"
            rules={[{ required: true, message: 'Please find public key!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="users"
            label="Shared Users"
          >
            <Select mode="multiple" showArrow placeholder="Select Users">
              {filteredUsers.map((user, idx) => (
                <Option value={user._id ? user._id : 'unknown'} key={idx}>{user.username}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
