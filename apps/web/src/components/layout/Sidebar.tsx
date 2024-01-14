import { Menu, Tooltip } from "antd";
import {
  AppstoreOutlined,
  AreaChartOutlined,
  UserOutlined,
  ClockCircleOutlined,
  WalletOutlined,
  RobotOutlined,
  GlobalOutlined,
  SettingOutlined,
  ScanOutlined,
  ToolOutlined
} from "@ant-design/icons";
import { Link, useHistory } from "react-router-dom";
import { getBasePathFromHistory } from "../../shared/helpers";
import { RoleGuard } from '../../guards';
import { EUserRole } from '../../types';

export const Sidebar = () => {
  const history = useHistory();
  const currentPath = getBasePathFromHistory(history);

  return (
    <Menu
      mode="inline"
      style={{ height: "100%", borderRight: 0, background: "#24262d" }}
      selectedKeys={[currentPath]}
      theme="dark"
    >
      {RoleGuard({roles: [EUserRole.ADMIN, EUserRole.TRADER, EUserRole.MONITOR, EUserRole.MAINTAINER]}) && 
        <Menu.Item key="/monitor" icon={<AreaChartOutlined />}>
          <Tooltip placement="right" title="">
            <Link to="/monitor" className="flex w-full">Monitor</Link>
          </Tooltip>
        </Menu.Item>
      }
      
      {RoleGuard({roles: [EUserRole.ADMIN]}) && 
        <Menu.Item key="/dashboard" icon={<AppstoreOutlined />}>
          <Tooltip placement="right" title="">
            <Link to="/dashboard" className="flex w-full">Dashboard</Link>
          </Tooltip>
        </Menu.Item>
      }

      {RoleGuard({roles: [EUserRole.ADMIN, EUserRole.TRADER, EUserRole.MONITOR]}) && 
        <Menu.Item key="/scanner" icon={<ScanOutlined />}>
          <Tooltip placement="right" title="">
            <Link to="/scanner" className="flex w-full">Token Scan</Link>
          </Tooltip>
        </Menu.Item>
      }

      {RoleGuard({roles: [EUserRole.ADMIN, EUserRole.TRADER]}) && 
        <Menu.Item key="/bot" icon={<RobotOutlined />}>
          <Tooltip placement="right" title="">
            <Link to="/bot" className="flex w-full">Bot</Link>
          </Tooltip>
        </Menu.Item>
      }

      {RoleGuard({roles: [EUserRole.ADMIN, EUserRole.TRADER]}) && 
        <Menu.Item key="/volume" icon={<ToolOutlined />}>
          <Tooltip placement="right" title="">
            <Link to="/volume" className="flex w-full">Volume Tool</Link>
          </Tooltip>
        </Menu.Item>
      }

      {RoleGuard({roles: [EUserRole.ADMIN]}) && 
        <Menu.Item key="/history" icon={<ClockCircleOutlined />}>
          <Tooltip placement="right" title="">
            <Link to="/history" className="flex w-full">History</Link>
          </Tooltip>
        </Menu.Item>
      }

      {RoleGuard({roles: [EUserRole.ADMIN]}) && 
        <Menu.Item key="/wallet" icon={<WalletOutlined />}>
          <Tooltip placement="right" title="">
            <Link to="/wallet" className="flex w-full">Wallet</Link>
          </Tooltip>
        </Menu.Item>
      }

      {RoleGuard({roles: [EUserRole.ADMIN, EUserRole.MAINTAINER]}) && 
        <Menu.Item key="/network" icon={<GlobalOutlined />}>
          <Tooltip placement="right" title="">
            <Link to="/network" className="flex w-full">Network</Link>
          </Tooltip>
        </Menu.Item>
      }

      {RoleGuard({roles: [EUserRole.ADMIN]}) && 
        <Menu.Item key="/admin" icon={<UserOutlined />}>
          <Tooltip placement="right" title="">
            <Link to="/admin" className="flex w-full">Admin</Link>
          </Tooltip>
        </Menu.Item>
      }

      {RoleGuard({roles: [EUserRole.ADMIN, EUserRole.TRADER, EUserRole.MONITOR, EUserRole.MAINTAINER]}) && 
        <Menu.Item key="/setting" icon={<SettingOutlined />}>
          <Tooltip placement="right" title="">
            <Link to="/setting" className="flex w-full">Setting</Link>
          </Tooltip>
        </Menu.Item>
      }
    </Menu>
  );
};
