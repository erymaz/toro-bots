import { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, TimePicker } from 'antd';
import moment from 'moment';

import { ISellingSchedule, EVolumeBotStatus } from "../../../types";

interface Props {
  visible: boolean,
  selectedSelling: (ISellingSchedule & {index: number}) | null,
  setVisible: (visible: boolean) => void,
  addSellingSchedule: (schedule: ISellingSchedule) => void,
  onUpdateSelling: (schedule: ISellingSchedule & {index: number}) => void
};

export const AddSelling = (props: Props) => {
  const { visible, selectedSelling, setVisible, addSellingSchedule, onUpdateSelling } = props;
  const [form] = Form.useForm();

  useEffect(() => {
    if (!selectedSelling) return;
    const formData = {
      token: selectedSelling?.token,
      time: {
        sellingTime: moment(selectedSelling?.time),
      },
    }
    form.setFieldsValue(formData);
  }, [form, selectedSelling]);

  const handleCancel = () => {
    form.resetFields();
    setVisible(false);
  };

  const onFinish = (values: any) => {
    if (selectedSelling) {
      onUpdateSelling({
        ...selectedSelling,
        time: values.time.sellingTime.format('YYYY-MM-DD HH:mm:ss').toString(),
        token: values.token
      });
    } else {
      let temp = {
        ...values,
        time: values.time.sellingTime.format('YYYY-MM-DD HH:mm:ss').toString(),
        status: EVolumeBotStatus.NONE
      }
      addSellingSchedule(temp);
    }
    form.resetFields();
    setVisible(false);
  };

  return (
    <Modal
      title="Selling"
      visible={visible}
      centered
      onOk={form.submit}
      onCancel={handleCancel}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item label="Date">
          <Input.Group compact>
            <Form.Item
              name={["time", "sellingTime"]}
              rules={[{ required: true, message: 'Please select day!' }]}
              noStyle
            >
              <DatePicker style={{ width: '50%' }} />
            </Form.Item>
            <Form.Item
              name={["time", "sellingTime"]}
              rules={[{ required: true, message: 'Please select time!' }]}
              noStyle
            >
              <TimePicker style={{ width: '50%' }} />
            </Form.Item>
          </Input.Group>
        </Form.Item>
        <Form.Item
          label="Token"
          name="token"
          rules={[{ required: true, message: 'Please enter amount of token!' }]}
        >
          <InputNumber className="w-full" />
        </Form.Item>
      </Form>
    </Modal>
  )
}
