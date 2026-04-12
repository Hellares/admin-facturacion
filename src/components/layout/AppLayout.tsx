import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout, Drawer, Grid } from 'antd';
import Sidebar from './Sidebar';
import Header from './Header';

const { Content } = Layout;
const { useBreakpoint } = Grid;

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.lg;

  // Auto-collapse on mobile
  useEffect(() => {
    if (isMobile) setCollapsed(true);
  }, [isMobile]);

  if (isMobile) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Drawer
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={250}
          styles={{ body: { padding: 0, background: '#001529' } }}
          closable={false}
        >
          <Sidebar collapsed={false} onCollapse={() => setDrawerOpen(false)} />
        </Drawer>
        <Layout>
          <Header onMenuClick={() => setDrawerOpen(true)} isMobile />
          <Content style={{ margin: 12, marginTop: 12 }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout>
        <Header />
        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
