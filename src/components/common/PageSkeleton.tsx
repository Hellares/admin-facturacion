import { Card, Skeleton, Space } from 'antd';

interface PageSkeletonProps {
  type?: 'list' | 'form' | 'detail';
}

export default function PageSkeleton({ type = 'list' }: PageSkeletonProps) {
  if (type === 'form') {
    return (
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Skeleton.Input active style={{ width: 300, height: 32 }} />
        <Card>
          <Skeleton active paragraph={{ rows: 3 }} />
        </Card>
        <Card>
          <Skeleton active paragraph={{ rows: 5 }} />
        </Card>
        <Card>
          <Skeleton active paragraph={{ rows: 2 }} />
        </Card>
      </Space>
    );
  }

  if (type === 'detail') {
    return (
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Skeleton.Input active style={{ width: 400, height: 32 }} />
        <Card>
          <Skeleton active paragraph={{ rows: 4 }} />
        </Card>
        <Card>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      </Space>
    );
  }

  // list
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Skeleton.Input active style={{ width: 200, height: 32 }} />
        <Skeleton.Button active style={{ width: 120 }} />
      </div>
      <Card>
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    </Space>
  );
}
