import { useState } from 'react'

import { EditBot } from './edit';
import { IBot } from '../../types';
import Bot from './Bot';

interface ContentProps {data: IBot[]};

export const CardView = (props: ContentProps) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [isDuplicate, setIsDuplicate] = useState<boolean>(false);
  const [selectedBot, setSelectedBot] = useState<IBot | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {
        props.data.map((item, idx) => (
          <Bot 
            item={item}
            setSelectedBot={setSelectedBot}
            setVisible={setVisible}
            setIsDuplicate={setIsDuplicate}
            key={idx}
          />
        ))
      }
      {visible && selectedBot && <EditBot bot={selectedBot} visible={visible} setVisible={setVisible} isEdit={true} />}
      {isDuplicate && selectedBot && <EditBot bot={selectedBot} visible={isDuplicate} setVisible={setIsDuplicate} isEdit={false} />}
    </div>
  );
}
