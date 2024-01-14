import { Space, Button, Table, Popconfirm } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IMessageEvent } from "websocket";

import { selectBlockchains } from '../../../store/network/network.selectors';
import { deleteBlockchain } from '../../../store/network/network.action';
import { AddNewBlockchain } from './AddNewBlockchain';
import { EditBlockchain } from './EditBlockchain';
import { IBlockchain, ISocketData, ESocketType } from '../../../types';
import { formattedNumber } from '../../../shared';
import { ws } from '../../../services/api';

export const Blockchain = () => {
  const blockchainData = useSelector(selectBlockchains);
  const dispatch = useDispatch();

  const [visible, setVisible] = useState<boolean>(false);
  const [blockchain, setBlockchain] = useState<IBlockchain>();
  const [socketData, setSocketData] = useState<{ blockchainId: string, MaxGasPrice: number }>({
    blockchainId: '', 
    MaxGasPrice: 0
  });

  const handleDelete = (id: string) => {
    if (id === '') return;
    dispatch(deleteBlockchain(id));
  }

  useEffect(() => {
    ws.socket.onmessage = (message: IMessageEvent) => {
      const data = JSON.parse(String(message.data)) as ISocketData;
      if (data.type === ESocketType.CHAIN_MAX_GAS_PRICE) {
        setSocketData(data.data);
      }
    }
  }, []);

  const computedData = useMemo(() => {
    let computed = blockchainData;
    let temp = computed.find(el => el._id === socketData.blockchainId);
    if (temp) {
      temp.currentMaxGasPrice = socketData.MaxGasPrice;
    }
    return computed;
  }, [blockchainData, socketData]);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'index',
      render: (text: any, record: any, index: number) => (<>{index + 1}</>)
    },
    {
      title: 'Chain Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Chain ID',
      dataIndex: 'chainId',
      key: 'chainId',
    },
    {
      title: 'Coin Symbol',
      dataIndex: 'coinSymbol',
      key: 'coinSymbol',
    },
    {
      title: 'Max Gas Price (Current)',
      key: 'maxGasPrice',
      render: (bc: IBlockchain) => (
        <div>
          {formattedNumber(bc.currentMaxGasPrice ? bc.currentMaxGasPrice : bc.gasPrice, 2)}
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'action',
      width: 250,
      render: (blockchain: IBlockchain) => (
        <Space size="middle">
          <Button
            type="primary"
            shape="round"
            icon={<EditOutlined />}
            size={'small'}
            onClick={() => { setBlockchain(blockchain); setVisible(true) }}
          >
            Edit
          </Button>
          <Popconfirm
            placement="top"
            title="Are you sure you want to delete this blockchain?"
            onConfirm={() => handleDelete(blockchain._id || '')}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" shape="round" icon={<DeleteOutlined />} size={'small'} danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div className="flex justify-end">
        <AddNewBlockchain />
      </div>
      <Table
        columns={columns}
        dataSource={computedData}
        rowKey="_id"
        pagination={false}
        scroll={{ x: 1100 }}
      />
      {blockchain && <EditBlockchain
        blockchain={blockchain}
        visible={visible}
        setVisible={setVisible}
      />}
    </div>
  )
}