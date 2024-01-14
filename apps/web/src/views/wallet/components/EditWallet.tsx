import { useEffect, useMemo } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import { updateWallet } from '../../../store/wallet/wallet.actions';
import { selectUsers } from "../../../store/user/user.selectors";
import { EUserStatus, IWallet, IWalletEditRequest } from '../../../types';

interface Props {
  wallet: IWallet,
  visible: boolean,
  setVisible: (visible: boolean) => void
}

export const EditWallet = (props: Props) => {
  const { wallet, visible, setVisible } = props;
  const dispatch = useDispatch();
  
  const [form] = Form.useForm();
  const { Option } = Select;
  const users = useSelector(selectUsers);

  useEffect(() => {
    let users: string[] = [];
    wallet.users.forEach(user => {
      if (user._id) {
        users.push(user._id);
      }
    });

    const formData: IWalletEditRequest = {
      _id: wallet._id,
      name: wallet.name,
      // privateKey: wallet.privateKey,
      publicKey: wallet.publicKey,
      users
    };

    form.setFieldsValue(formData);
  }, [form, wallet]);

  const filteredUsers = useMemo(() => {
    let computed = users;
    const me = localStorage.getItem("id");
    computed = computed.filter(user => user.status !== EUserStatus.BLOCKED && user._id !== me);
    return computed;
  }, [users]);

  const handleCancel = () => {
    form.resetFields();
    setVisible(false);
  };

  const onFinish = (updatedWallet: IWalletEditRequest) => {
    const users = updatedWallet.users ? updatedWallet.users.slice() : [];

    dispatch(updateWallet({
      ...updatedWallet,
      users
    }));
    form.resetFields();
    setVisible(false);
  };

  return (
    <Modal
      title="Add New Wallet"
      visible={visible}
      onOk={form.submit}
      // confirmLoading={confirmLoading}
      onCancel={handleCancel}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          label="Id"
          name="_id"
          hidden
        >
          <Input hidden />
        </Form.Item>

        <Form.Item
          label="Wallet Name"
          name="name"
          rules={[{ required: true, message: 'Please enter wallet name!' }]}
        >
          <Input />
        </Form.Item>

        {/* <Form.Item
          label="Private Key"
          name="privateKey"
          rules={[{ required: true, message: 'Please enter private key!' }]}
        >
          <Input placeholder="input private key" />
        </Form.Item> */}

        <Form.Item
          label="Wallet Address"
          name="publicKey"
          rules={[{ required: true, message: 'Please find wallet address!' }]}
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
  );
};
