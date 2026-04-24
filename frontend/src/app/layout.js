import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, App } from 'antd';
import viVN from 'antd/locale/vi_VN';
import './globals.css';

export const metadata = {
  title: 'Elevate Admin - Hệ Thống Quản Lý Chung Cư',
  description: 'Phần mềm quản lý chung cư cao cấp - quản lý tòa nhà, căn hộ, cư dân, hóa đơn, dịch vụ và sự cố',
};

const themeConfig = {
  token: {
    colorPrimary: '#4a90d9',
    borderRadius: 10,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    colorBgContainer: '#ffffff',
  },
  components: {
    Modal: {
      borderRadiusLG: 16,
      paddingContentHorizontalLG: 28,
    },
    Form: {
      labelFontSize: 13,
    },
    Input: {
      borderRadius: 8,
      paddingBlock: 8,
    },
    Select: {
      borderRadius: 8,
    },
    Button: {
      borderRadius: 8,
      fontWeight: 600,
    },
    DatePicker: {
      borderRadius: 8,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AntdRegistry>
          <ConfigProvider theme={themeConfig} locale={viVN}>
            <App>
              {children}
            </App>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
