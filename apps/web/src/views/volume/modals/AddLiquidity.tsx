import { useEffect } from "react";
import { Modal, Form, Input, DatePicker, TimePicker, InputNumber } from 'antd';
import moment from "moment";

import { IAddLiquiditySchedule, EVolumeBotStatus } from '../../../types';

interface Props {
  visible: boolean,
  selectedLiquidity: (IAddLiquiditySchedule & {index: number}) | null,
  setVisible: (visible: boolean) => void
  addLiquiditySchedule: (schedule: IAddLiquiditySchedule) => void
  onUpdateLiquidity: (schedule: IAddLiquiditySchedule & {index: number}) => void
};

export const AddLiquidity = (props: Props) => {
  const { visible, selectedLiquidity, setVisible, addLiquiditySchedule, onUpdateLiquidity } = props;
  const [form] = Form.useForm();

  useEffect(() => {
    if (!selectedLiquidity) return;
    const formData = {
      baseCoin: selectedLiquidity.baseCoin,
      time: {
        liquidityTime: moment(selectedLiquidity.time),
      },
    }
    form.setFieldsValue(formData);
  }, [form, selectedLiquidity]);

  const handleCancel = () => {
    form.resetFields();
    setVisible(false);
  };

  const onFinish = (values: any) => {
    if (selectedLiquidity) {
      onUpdateLiquidity({
        ...selectedLiquidity,
        time: values.time.liquidityTime.format('YYYY-MM-DD HH:mm:ss').toString(),
        baseCoin: values.baseCoin
      });
    } else {
      const temp = {
        ...values,
        time: values.time.liquidityTime.format('YYYY-MM-DD HH:mm:ss').toString(),
        status: EVolumeBotStatus.NONE
      }
      addLiquiditySchedule(temp);
    }
    form.resetFields();
    setVisible(false);
  };

  return (
    <Modal
      title="Liquidity"
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
              name={["time", "liquidityTime"]}
              rules={[{ required: true, message: 'Please select day!' }]}
              noStyle
            >
              <DatePicker style={{ width: '50%' }} />
            </Form.Item>
            <Form.Item
              name={["time", "liquidityTime"]}
              rules={[{ required: true, message: 'Please select time!' }]}
              noStyle
            >
              <TimePicker style={{ width: '50%' }} />
            </Form.Item>
          </Input.Group>
        </Form.Item>
        <Form.Item
          label="baseCoin"
          name="baseCoin"
          rules={[{ required: true, message: 'Please enter Base Coin!' }]}
        >
          <InputNumber className="w-full" />
        </Form.Item>
      </Form>
    </Modal>
  )
}
