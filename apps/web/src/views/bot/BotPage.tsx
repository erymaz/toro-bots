import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Select, Tabs, Button } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';

import { CardView } from './CardView';
import { ListView } from './ListView';
import { EditBot } from './edit';
import { ERunningStatus } from '../../types';
import { getAllBlockchain, getAllNode, getAllDex, getAllCoin } from '../../store/network/network.action';
import { loadMyWallet } from '../../store/wallet/wallet.actions';
import { selectBots } from '../../store/bot/bot.selectors';
import { getBots, getStatuses } from '../../store/bot/bot.actions';
import { selectElapsedTime } from "../../store/auth/auth.selectors";

export interface Tab {
  name: string,
  filterKey: ERunningStatus | 'all',
};

const tabs: Tab[] = [
  {
    name: 'All',
    filterKey: 'all',
  },
  {
    name: 'Draft',
    filterKey: ERunningStatus.DRAFT,
  },
  {
    name: 'Running',
    filterKey: ERunningStatus.RUNNING,
  },
  {
    name: 'Succeeded',
    filterKey: ERunningStatus.SUCCEEDED,
  },
  {
    name: 'Failed',
    filterKey: ERunningStatus.FAILED,
  },
  {
    name: 'Archived',
    filterKey: ERunningStatus.ARCHIVED,
  },
];

export const BotPage = () => {
  const dispatch = useDispatch();
  
  const [selectedTab, setSelectedTab] = useState<string>(tabs[0].filterKey);
  const [selectedView, setSelectedView] = useState<string>('card');
  const [initTime, setInitTime] = useState<number>(0);
  const [flag, setFlag] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  
  const { TabPane } = Tabs;
  const { Option } = Select;
  const botList = useSelector(selectBots);
  const elapsedTime = useSelector(selectElapsedTime);

  useEffect(() => {
    dispatch(getAllBlockchain());
    dispatch(getAllNode());
    dispatch(getAllCoin());
    dispatch(getAllDex());
    dispatch(loadMyWallet());
    dispatch(getBots());
  }, [dispatch]);

  useEffect(() => {
    if (!flag) {
      setInitTime(elapsedTime);
    }
    setFlag(true);
    
    if ((elapsedTime - initTime) % 2 === 0) {
      dispatch(getStatuses());
    }
  }, [elapsedTime, dispatch, flag, initTime]);

  const filteredData = useMemo(() => {
    let computedData = botList;
    computedData = computedData.filter(item => (selectedTab === 'all' && item.state.status !== ERunningStatus.ARCHIVED) || item.state.status === selectedTab);

    return computedData;
  }, [selectedTab, botList]);

  const handleChange = (value: string) => {
    setSelectedView(value);
  }

  const callback = (key: string) => {
    setSelectedTab(key);
  }
  
  return (
    <div className="bg-gray-dark rounded-md p-3">
      <div className="h-12 p-3 flex justify-center items-center">
        <div className="flex justify-between items-center w-full">
          <div className="text-base text-gray-600 font-bold"> </div>
          <div className="flex">
            <Button
              type='primary'  
              icon={<PlusCircleOutlined />}
              onClick={() => setVisible(true)}
            >
              Add New
            </Button>
            <Select defaultValue="card" className="w-28 ml-2" onChange={handleChange}>
              <Option value="card">Card View</Option>
              <Option value="list">List View</Option>
            </Select>
          </div>
        </div>
      </div>
      <div className="p-3">
        <Tabs onChange={callback} >
          {
            tabs.map((item) => (
              <TabPane 
                tab={item.name} 
                key={item.filterKey}
              >
                {selectedView === 'card' ? 
                <CardView 
                  data = {filteredData}
                /> 
                : 
                <ListView 
                  data = {filteredData}
                />}
              </TabPane>
            ))
          }
        </Tabs>
      </div>
      {visible && <EditBot visible={visible} setVisible={setVisible} isEdit={false} />}
    </div>
  )
}
