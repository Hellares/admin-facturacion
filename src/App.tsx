import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, App as AntApp } from 'antd';
import esES from 'antd/locale/es_ES';
import { queryClient } from '@/lib/query-client';
import { theme } from '@/styles/theme';
import { router } from '@/router';
import ErrorBoundary from '@/components/common/ErrorBoundary';

import '@/styles/global.css';

export default function App() {
  return (
    <ErrorBoundary>
      <ConfigProvider theme={theme} locale={esES}>
        <AntApp>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </AntApp>
      </ConfigProvider>
    </ErrorBoundary>
  );
}
