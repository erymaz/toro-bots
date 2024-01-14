import { useState, useEffect, useMemo } from 'react';
import { Table, Row, Col, Select, Space, Input, DatePicker, Form, Button, Switch, Tabs } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { TablePaginationConfig } from 'antd/lib/table/interface';

import { CopyableLabel } from '../../components/common/CopyableLabel';
import { shortenAddress } from '../../shared';
import { IBlockchain, IDex, IPool, PoolFilter, ISocketData, ESocketType, IAutoBot, tradingTxt, ETradingThread } from '../../types';
import { getAllBlockchain } from '../../store/network/network.action';
import { getAllCoin } from '../../store/network/network.action';
import { getAllDex } from '../../store/network/network.action';
import { searchPools } from '../../store/pool/pool.actions';
import { loadMyWallet } from '../../store/wallet/wallet.actions';
import { getAllNode } from '../../store/network/network.action';
import { selectPools, selectTotal } from '../../store/pool/pool.selectors';
import { selectElapsedTime } from "../../store/auth/auth.selectors";
import { selectBlockchains } from '../../store/network/network.selectors';
import { selectDexs } from '../../store/network/network.selectors';
import { selectMyWallets } from "../../store/wallet/wallet.selectors";
import { formattedNumber } from '../../shared';
import { AutoBot } from './modal/AutoBot';
import { AutoBotDetails } from './modal/AutoBotDetails';
import { ws } from '../../services/api';
import { IMessageEvent } from "websocket";
import { updateBot } from '../../store/pool/pool.actions';
import IconImg from '../../images/Mallet-Icon.png';
import Balance from './Balance';
import { selectNodes } from '../../store/network/network.selectors';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

interface FilterForm {
  chain: string;
  dex: string;
  size: string;
  token: string;
  date: string[]
}

export const ScannerPage = () => {
  const dispatch = useDispatch();
  const pools = useSelector(selectPools);
  const total = useSelector(selectTotal);
  const elapsedTime = useSelector(selectElapsedTime);
  const blockchains = useSelector(selectBlockchains);
  const dexes = useSelector(selectDexs);
  const nodeData = useSelector(selectNodes);
  const walletData = useSelector(selectMyWallets);
  const [form] = Form.useForm();

  const [chain, setChain] = useState<string>("");
  const [dex, setDex] = useState<string>("");
  const [size, setSize] = useState<string>('0');
  const [token, setToken] = useState<string>("");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const [page, setPage] = useState<number>(1);
  const [pageLength, setPageLength] = useState<number>(10);
  const [sortField, setSortField] = useState<any>("created");
  const [sortOrder, setSortOrder] = useState<any>(-1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNew, setIsNew] = useState<boolean>(false);
  const [selectedPool, setSelectedPool] = useState<IPool | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<string>(walletData[0] ? walletData[0]._id : '');
  const [refresh, setRefresh] = useState<boolean>(true);
  const [hasBot, setHasBot] = useState<boolean>(false);

  useEffect(() => {
    dispatch(getAllBlockchain());
    dispatch(getAllDex());
    dispatch(getAllCoin());
    dispatch(getAllNode());
    dispatch(loadMyWallet());

    // receive socket data
    ws.socket.onmessage = (message: IMessageEvent) => {
      const data = JSON.parse(String(message.data)) as ISocketData;
      if (data.type === ESocketType.AUTO_BOT_STATE) {
        dispatch(updateBot(data.data));
      } else if (data.type === ESocketType.NEW_TOKEN_DROPPED) {
        const pool = data.data as IPool;
        showDesctopNoti('New token is dropped', 'Pool Size: $' + String(pool.size));
      }
    }
  }, [dispatch]);

  useEffect(() => {
    async function fetchData () {
      let filter: PoolFilter = {
        hasBot,
        size: Number(size),
        page,
        pageLength,
        sort: {
          field: sortField,
          order: sortOrder
        },
        chain,
        dex,
        token
      };
  
      if (startDate && endDate) {
        filter = {
          ...filter,
          startDate,
          endDate
        };
      }
  
      await dispatch(searchPools(filter));
      setIsLoading(false);
    }

    if (refresh && elapsedTime % 3 === 0) {
      fetchData();
    }
  }, [elapsedTime, chain, dex, dispatch, page, pageLength, size, sortField, sortOrder, startDate, endDate, token, refresh, hasBot]);

  const filteredPools = useMemo(() => {
    let computed = pools ? pools : [];
    
    return computed;
  }, [pools]);

  const currentWallet = useMemo(() => {
    return walletData.find(el => el._id === selectedWallet);
  }, [selectedWallet, walletData]);

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: any,
    sorter: any,
  ) => {
    setPage(pagination.current ? pagination.current : 1);
    setPageLength(pagination.pageSize ? pagination.pageSize : 10);
    setSortField(sorter.columnKey);
    setSortOrder(sorter.order === 'ascend' ? 1 : -1);
  }

  const shortcutTxt = (txt: string) => {
    if (txt.length > 10) return txt.slice(0, 10) + '...';
    else return txt;
  }

  const onFinish = async (values: FilterForm) => {
    values.chain ? setChain(values.chain) : setChain("");
    values.dex ? setDex(values.dex) : setDex("");
    values.size ? setSize(values.size) : setSize('0');
    values.token ? setToken(values.token) : setToken("");
    values.date ? setStartDate(moment(values.date[0]).format('YYYY-MM-DD') + ' 00:00:00') : setStartDate(null);
    values.date ? setEndDate(moment(values.date[1]).format('YYYY-MM-DD') + ' 23:59:59') : setEndDate(null);
    setIsLoading(true);
  }

  const showDesctopNoti = (title: string, content: string) => {
    new Notification(title, {
      body: content,
      icon: IconImg
    });
  }

  const handleBotAction = (bot?: IAutoBot) => {
    if (!bot) return;

    if (!bot.state.active) {
      ws.wsAction(ESocketType.AUTO_BOT_START_REQ, {
        botId: bot._id
      });
    } else {
      ws.wsAction(ESocketType.AUTO_BOT_STOP_REQ, {
        botId: bot._id
      });
    }
  }

  const getRpcUrl = (nodeId?: string) => {
    if (!nodeId) return '';
    const node = nodeData.find(el => el._id === nodeId);
    if(node) {
      return node.rpcProviderURL
    } else {
      return '';
    }
  }

  const handleWalletChange = (walletId: string) => {
    setSelectedWallet(walletId);
  }

  const handleRefreshChange = (e: boolean) => {
    setRefresh(e);
  }

  const handleChangeTab = (activeKey: string) => {
    if (activeKey === '1') {
      setHasBot(false);
    } else {
      setHasBot(true);
    }
  }

  const columns = [
    {
      title: '#',
      dataIndex: 'id',
      key: 'index',
      render: (text: any, record: any, index: number) => (<>{(page-1) * pageLength + index + 1}</>)
    },
    {
      title: 'Name',
      key: 'tokenSymbol',
      render: (pool: IPool) => (
        <a
          href={`${pool.blockchain.explorer}/address/${pool.token2.address}`}
          target="_blank"
          rel="noreferrer"
        >
          {pool.token2.symbol}
        </a>
      )
    },
    {
      title: 'Pool Size',
      key: 'size',
      render: (pool: IPool) => (
        <span className='mr-2'>${formattedNumber(pool.size, 2)}</span>
      ),
      sorter: true
    },
    {
      title: 'Chain',
      dataIndex: 'blockchain',
      key: 'blockchain',
      render: (blockchain: IBlockchain) => (
        <div>{shortcutTxt(blockchain.name)}</div>
      ),
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
      title: 'BaseCoin',
      key: 'address1',
      width: 150,
      render: (pool: IPool) => (
        <div>
          <div className='flex'>
            <a
              href={`${pool.blockchain.explorer}/address/${pool.token1.address}`}
              target="_blank"
              rel="noreferrer"
            >
              {shortenAddress(pool.token1.address)}
            </a>
            <CopyableLabel value={pool.token1.address} label="" />
          </div>
          <div className='flex text-xs text-blue'>
            <div>{pool.token1.symbol}&nbsp;</div>
            {currentWallet && <Balance
              rpcUrl={getRpcUrl(String(pool.blockchain.node))}
              tokenAddress={pool.token1.address}
              walletAddress={currentWallet.publicKey}
            />}
          </div>
        </div>
      )
    },
    {
      title: 'Token',
      key: 'address2',
      width: 150,
      render: (pool: IPool) => (
        <div className='flex'>
          <a
            href={`${pool.blockchain.explorer}/address/${pool.token2.address}`}
            target="_blank"
            rel="noreferrer"
          >
            {shortenAddress(pool.token2.address)}
          </a>
          <CopyableLabel value={pool.token2.address} label="" />
        </div>
      )
    },
    {
      title: 'Transaction Hash',
      key: 'transactionHash',
      width: 150,
      render: (pool: IPool) => (
        <Space>
          <a
            href={`${pool.blockchain.explorer}/tx/${pool.transactionHash}`}
            target="_blank"
            rel="noreferrer"
          >
            {shortenAddress(pool.transactionHash)}
          </a>
          <CopyableLabel value={pool.transactionHash} label="" />
        </Space>
      )
    },
    {
      title: 'Created At',
      dataIndex: 'created',
      key: 'created',
      width: 200,
      render: (created: Date) => (
        <div> {moment(created).format('M/D/YY @ LTS').toString()} </div>
      ),
      sorter: true
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 300,
      render: (pool: IPool) => (
        <Space>
          {!pool.autoBot && (
            <Button 
              onClick={() => {
                setSelectedPool(pool);
                setIsNew(true);
              }}
            >
              Create a bot
            </Button>
          )}
          {pool.autoBot && (
            <>
            {!pool.autoBot.state.active && pool.autoBot.state.thread !== ETradingThread.AUTO_FINISHED &&
              <>
                <Button type='primary' onClick={()=>handleBotAction(pool.autoBot)}>
                  Start
                </Button>
              </>
            }
            {pool.autoBot.state.active && <Button type='primary' danger onClick={()=>handleBotAction(pool.autoBot)}>
              Stop
            </Button>}
            {pool.autoBot._id && <AutoBotDetails botId={pool.autoBot._id} />}
            <span className='text-blue'>{tradingTxt[pool.autoBot.state.thread ? pool.autoBot.state.thread : ""]}</span>
            </>
          )}
        </Space>
      ),
    }
  ];
  
  return (
    <div className="bg-gray-dark rounded-md p-3">
      <div className="p-3">
        <div className='pt-6 px-5 mb-3 bg-gray-darkest rounded'>
          <Form
            name="filterForm"
            form={form}
            labelAlign="left"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            onFinish={onFinish}
            autoComplete="off"
          >
            <Row gutter={20}>
              <Col xs={24} lg={12} xl={8} xxl={6}>
                <Form.Item
                  label="Address"
                  name="token"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12} xl={8} xxl={6}>
                <Form.Item
                  label="Chain"
                  name="chain"
                  initialValue=""
                >
                  <Select>
                    <Option value="">All</Option>
                    {blockchains.map((el, idx) => (
                      <Option value={el._id} key={idx}>
                        {el.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} lg={12} xl={8} xxl={6}>
                <Form.Item
                  label="Dex"
                  name="dex"
                  initialValue=""
                >
                  <Select>
                    <Option value="">All</Option>
                    {dexes.map((el, idx) => (
                      <Option value={el._id} key={idx}>
                        {el.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} lg={12} xl={8} xxl={6}>
                <Form.Item
                  label="Pool"
                  name="size"
                  initialValue='0'
                >
                  <Input prefix="$" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12} xl={8} xxl={6}>
                <Form.Item
                  label="Date"
                  name="date"
                >
                  <RangePicker className='w-full' />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12} xl={8} xxl={6}>
                <Form.Item
                  label="Wallet"
                  name="wallet"
                  initialValue={selectedWallet}
                >
                  <Select onChange={handleWalletChange}>
                    {walletData.map((el, idx) => (
                      <Option value={el._id} key={idx}>
                        {el.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} lg={12} xl={8} xxl={6}>
                <Form.Item
                  label="Refresh"
                >
                  <Switch checked={refresh} onChange={handleRefreshChange} />
                </Form.Item>
              </Col>
              <Col className='ml-auto'>
                <Button type='primary' className='w-40 mb-3' onClick={form.submit}>
                  Filter
                </Button>
              </Col>
            </Row>
          </Form>
        </div>

        <Tabs className="" onChange={handleChangeTab}>
          <TabPane tab="All" key="1">
            <Table
              loading={isLoading}
              columns={columns} 
              dataSource={filteredPools}
              rowKey="_id"
              onChange={handleTableChange}
              pagination={{total: total}}
              scroll={{ x: 1200 }}
            />
          </TabPane>
          <TabPane tab="Auto Bots" key="2">
            <Table
              loading={isLoading}
              columns={columns} 
              dataSource={filteredPools}
              rowKey="_id"
              onChange={handleTableChange}
              pagination={{total: total}}
              scroll={{ x: 1200 }}
            />
          </TabPane>
        </Tabs>
      </div>

      {selectedPool && <AutoBot pool={selectedPool} visible={isNew} setVisible={setIsNew} />}
    </div>
  )
}
