import { useState } from 'react';
import { Table, Space, Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';

import { DetailBot } from './detail';
import { EditBot } from './edit';
import { ERunningStatus, IBlockchain, IBot, IBotBuy, IBotSell, IBotState, IDex, INode, IWallet, IToken } from '../../types';
import { CopyableLabel } from '../../components/common/CopyableLabel';
import { shortenAddress } from '../../shared';
import { deleteBot } from "../../store/bot/bot.actions";

interface ContentProps {
  data: IBot[];
};

export const ListView = (props: ContentProps) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [selectedBot, setSelectedBot] = useState<IBot | null>(null);
  const [isDetail, setIsDetail] = useState<boolean>(false);

  const dispatch = useDispatch();

  const getBgColor = (status: ERunningStatus) => {
    let bgColor = '';
    if (status === ERunningStatus.DRAFT) bgColor = 'bg-red';
    else if (status === ERunningStatus.RUNNING) bgColor = 'bg-green';
    else bgColor = 'bg-blue';

    return bgColor;
  }

  const handleEdit = (bot: IBot) => {
    setSelectedBot(bot);
    setVisible(true);
  }

  const handleDetails = (bot: IBot) => {
    setSelectedBot(bot);
    setIsDetail(true);
  }

  const handleDelete = (botId: string) => {
    dispatch(deleteBot(botId));
  }

  const columns = [
    {
      title: 'No',
      key: 'index',
      render: (text: any, record: any, index: number) => (<>{index + 1}</>)
    },
    {
      title: 'Blockchain',
      dataIndex: 'blockchain',
      key: 'blockchain',
      render: (blockchain: IBlockchain) => (
        <Space size="middle">
          <div> {blockchain.name} </div>
        </Space>
      )
    },
    {
      title: 'Node',
      dataIndex: 'node',
      key: 'node',
      render: (node: INode) => (
        <Space size="middle">
          <div> {node.name} </div>
        </Space>
      )
    },
    {
      title: 'Dex',
      dataIndex: 'dex',
      key: 'dex',
      render: (dex: IDex) => (
        <Space size="middle">
          <div> {dex.name} </div>
        </Space>
      )
    },
    {
      title: 'Token address',
      dataIndex: 'token',
      key: 'token',
      render: (token: IToken) => (
        <Space size="middle">
          <div>{shortenAddress(token.address)}</div>
          <CopyableLabel value={token} label="" />
        </Space>
      )
    },
    {
      title: 'Wallet',
      dataIndex: 'wallet',
      key: 'wallet',
      render: (wallet: IWallet) => (
        <Space size="middle">
          <div>{wallet.name}</div>
          {/* <div>{shortenAddress(wallet.publicKey)}</div>
          <CopyableLabel value={wallet.publicKey} label="" /> */}
        </Space>
      )
    },
    {
      title: 'Buy',
      dataIndex: 'buy',
      key: 'buy',
      render: (buy: IBotBuy) => (
        <Space size="middle">
          <div> {buy ? buy.type : ''} </div>
        </Space>
      )
    },
    {
      title: 'Sell',
      dataIndex: 'sell',
      key: 'sell',
      render: (sell: IBotSell) => (
        <Space size="middle">
          <div> {sell ? sell.type : ''} </div>
        </Space>
      )
    },
    {
      title: 'Bot status',
      dataIndex: 'state',
      key: 'state',
      render: (state: IBotState) => (
        <div className='flex items-center'>
          <div className={`mr-2 w-3 h-3 rounded ${getBgColor(state.status)}`} />
          <div> {state.status} </div>
        </div>
      )
    },
    {
      title: 'Action',
      key: 'botDetail',
      width: 300,
      render: (bot: IBot) => (
        <Space size="middle">
          <Button 
            type='primary'
            shape="round" 
            icon={<EditOutlined />} 
            size={'small'}
            onClick={()=>handleEdit(bot)}
          >
            Edit
          </Button>
          <Button 
            type='primary'
            shape="round" 
            icon={<EditOutlined />} 
            size={'small'}
            onClick={()=>handleDetails(bot)}
          >
            Details
          </Button>
          <Popconfirm 
            placement="top" 
            title="Are you sure you want to delete this bot?" 
            onConfirm={() => handleDelete(bot._id)} 
            okText="Yes" 
            cancelText="No"
            key="delete"
          >
            <Button type="primary" size='small' shape='round' icon={<DeleteOutlined />} danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    },
  ];

  return (
    <>
      <Table columns={columns} dataSource={props.data} rowKey="_id" />
      {visible && selectedBot && <EditBot bot={selectedBot} visible={visible} setVisible={setVisible} isEdit={true} />}
      {isDetail && selectedBot && <DetailBot visible={isDetail} setVisible={setIsDetail} bot={selectedBot} />}
    </>
  );
}
