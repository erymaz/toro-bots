import { Redirect } from "react-router-dom";
import { LoginPage, SignupPage, TwoFactorAuth } from './views/auth';
import { DashboardPage } from "./views/dashboard";
import { MonitorPage } from "./views/monitor"
import { BotPage} from "./views/bot";
import { HistoryPage } from "./views/history";
import { WalletPage } from "./views/wallet";
import { NetworkPage } from "./views/network";
import { AdminPage } from "./views/admin";
import { SettingPage } from "./views/setting";
import { ScannerPage } from "./views/scanner";
import { VolumeToolPage } from "./views/volume";
import { EUserRole } from './types';

export const routes = {
  dashboard: [
    {
      path: "/dashboard",
      component: DashboardPage,
      exact: true,
      allowRoles: [EUserRole.ADMIN]
    },
    {
      path: "/monitor",
      component: MonitorPage,
      exact: true,
      allowRoles: [EUserRole.ADMIN, EUserRole.TRADER, EUserRole.MONITOR, EUserRole.MAINTAINER]
    },
    {
      path: "/bot",
      component: BotPage,
      exact: true,
      allowRoles: [EUserRole.ADMIN, EUserRole.TRADER]
    },
    {
      path: "/volume",
      component: VolumeToolPage,
      exact: true,
      allowRoles: [EUserRole.ADMIN, EUserRole.TRADER]
    },
    {
      path: "/history",
      component: HistoryPage,
      exact: true,
      allowRoles: [EUserRole.ADMIN]
    },
    {
      path: "/wallet",
      component: WalletPage,
      exact: true,
      allowRoles: [EUserRole.ADMIN]
    },
    {
      path: "/network",
      component: NetworkPage,
      exact: true,
      allowRoles: [EUserRole.ADMIN, EUserRole.MAINTAINER]
    },
    {
      path: "/admin",
      component: AdminPage,
      exact: true,
      allowRoles: [EUserRole.ADMIN]
    },
    {
      path: "/setting",
      component: SettingPage,
      exact: true,
      allowRoles: [EUserRole.ADMIN, EUserRole.TRADER, EUserRole.MONITOR, EUserRole.MAINTAINER]
    },
    {
      path: "/scanner",
      component: ScannerPage,
      exact: true,
      allowRoles: [EUserRole.ADMIN, EUserRole.TRADER, EUserRole.MONITOR]
    },
    {
      path: "**",
      exact: true,
      component: () => <Redirect to="/monitor" />,
      allowRoles: [EUserRole.ADMIN, EUserRole.TRADER, EUserRole.MONITOR, EUserRole.MAINTAINER]
    },
  ],
  minimal: [
    {
      path: "/auth/login",
      component: LoginPage,
      exact: true,
    },
    {
      path: "/auth/register",
      component: SignupPage,
      exact: true,
    },
    {
      path: "/auth/2fa-authentication",
      component: TwoFactorAuth,
      exact: true,
    },
    {
      path: "**",
      exact: true,
      component: () => <Redirect to="/auth/login" />,
    },
  ],
};
