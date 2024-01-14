import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Table, Space, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, PlayCircleOutlined, StopOutlined } from '@ant-design/icons';
import { IMessageEvent } from "websocket";

import { selectVolumeBots } from "../../store/volumeBot/volumeBot.selectors";
import { getAllBlockchain } from '../../store/network/network.action';
import { getAllNode } from '../../store/network/network.action';
import { getAllDex } from '../../store/network/network.action';
import { getAllCoin } from '../../store/network/network.action';
import { loadMyWallet } from '../../store/wallet/wallet.actions';
import { getVolumeBots, deleteVolumeBot, updateVolumeBotStatus } from '../../store/volumeBot/volumeBot.actions'
import { AddVolumeBot } from './modals/AddVolumeBot';
import { EVolumeBotStatus, IBlockchain, ICoin, IDex, INode, ESocketType, IVolumeBot, ISocketData } from '../../types';
import { CopyableLabel } from '../../components/common/CopyableLabel';
import { shortenAddress } from '../../shared';
import { ws } from '../../services/api';

export const VolumeToolPage = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const [selectedBot, setSelectedBot]= useState<IVolumeBot | null>(null);
  const [startedBot, setStartedBot] = useState<IVolumeBot | null>(null);
  const [isStart, setIsStart] = useState<boolean>(false);

  const dispatch = useDispatch();
  const data = useSelector(selectVolumeBots);

  useEffect(() => {
    dispatch(getAllBlockchain());
    dispatch(getAllNode());
    dispatch(getAllDex());
    dispatch(getAllCoin());
    dispatch(loadMyWallet());
    dispatch(getVolumeBots());

    // receive socket data
    ws.socket.onmessage = (message: IMessageEvent) => {
      const data = JSON.parse(String(message.data)) as ISocketData;
      if (data.type === ESocketType.VOLUME_BOT_STATUS) {
        console.log("==========>socket received");
        if (startedBot && startedBot._id === data.data._id) {
          setIsStart(false);
        }
        dispatch(updateVolumeBotStatus(data.data));
      }
    }
  }, [dispatch, startedBot]);

  const onDeleteBot = (id: string) => {
    dispatch(deleteVolumeBot(id));
  }

  const onEditBot = (bot: IVolumeBot) => {
    setSelectedBot(bot);
    setVisible(true);
  }

  const onActionBot = (bot: IVolumeBot) => {
    if (bot.state === EVolumeBotStatus.RUNNING) {
      ws.wsAction(ESocketType.VOLUME_BOT_STOP_REQ, {
        botId: bot._id
      });
    } else {
      setStartedBot(bot);
      setIsStart(true);
      ws.wsAction(ESocketType.VOLUME_BOT_START_REQ, {
        botId: bot._id
      });
    }
  }

  const columns = [
    {
      title: '#',
      dataIndex: 'id',
      key: 'index',
      width: 50,
      render: (text: any, record: any, index: number) => (<>{index + 1}</>)
    },
    {
      title: 'Chain',
      dataIndex: 'blockchain',
      key: 'blockchain',
      render: (chain: IBlockchain) => (
        <div>{chain.name}</div>
      )
    },
    {
      title: 'Node',
      dataIndex: 'node',
      key: 'node',
      render: (node: INode) => (
        <div>{node.name}</div>
      )
    },
    {
      title: 'Dex',
      dataIndex: 'dex',
      key: 'dex',
      render: (dex: IDex) => (
        <div>{dex.name}</div>
      )
    },
    {
      title: 'Base Coin',
      dataIndex: 'coin',
      key: 'coin',
      render: (coin: ICoin) => (
        <div>{coin.name}</div>
      )
    },
    {
      title: 'Token',
      key: 'token',
      render: (bot: IVolumeBot) => (
        <Space>
          <a
            href={`${bot.blockchain.explorer}/address/${bot.token.address}`}
            target="_blank"
            rel="noreferrer"
          >
            {shortenAddress(bot.token.address)}
          </a>
          <CopyableLabel value={bot.token.address} label="" />
          <div className='ml-3 text-blue'>{bot.token.symbol}</div>
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'action',
      width: 200,
      render: (bot: IVolumeBot) => (
        <Space size="middle">
          <Button 
            loading={isStart}
            shape="round" 
            type='primary' 
            icon={bot.state === EVolumeBotStatus.RUNNING ? <StopOutlined /> : <PlayCircleOutlined />} 
            size={'small'} 
            onClick={()=>onActionBot(bot)}
            danger={bot.state === EVolumeBotStatus.RUNNING ? true : false}
          >
          </Button>
          
          <Button shape="round" icon={<EditOutlined />} size={'small'} onClick={()=>onEditBot(bot)}>
          </Button>

          <Popconfirm 
            placement="top" 
            disabled={bot.state === EVolumeBotStatus.RUNNING ? true : false}
            title="Are you sure you want to discard this bot?" 
            onConfirm={()=>onDeleteBot(bot._id)} 
            okText="Yes" 
            cancelText="No"
            key="delete"
          >
            <Button disabled={bot.state === EVolumeBotStatus.RUNNING ? true : false} shape="round" icon={<DeleteOutlined />} size={'small'}>
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-gray-dark rounded-md p-3">
      <div className="h-12 py-3 flex justify-center items-center">
        <div className="flex justify-between items-center w-full">
          <div className="text-base font-bold"> </div>
          <div className="flex">
            <Button type="primary" onClick={()=>{setSelectedBot(null); setVisible(true)}}>
              Add New
            </Button>
          </div>
        </div>
      </div>
      <div className="pb-3 bg-gray-dark">
        <Table 
          columns={columns} 
          dataSource={data} 
          rowKey="_id"
          pagination={false}
        />
      </div>
      {visible && <AddVolumeBot visible={visible} setVisible={setVisible} selectedBot={selectedBot} />}
    </div>
  );
}
