'use client';

import { useState } from 'react';
import { Modal, App as AntdApp } from 'antd';

// Thông tin tài khoản BQL chung cư
const BANK_INFO = {
  bankName: 'Vietcombank',
  bankCode: 'VCB',
  accountNumber: '1234567890',
  accountHolder: 'BQL CHUNG CƯ ELEVATE',
  branch: 'Chi nhánh TP.HCM',
};

const PAYMENT_METHODS = [
  {
    key: 'MoMo',
    name: 'MoMo',
    icon: '📱',
    color: '#ae2070',
    bg: '#fce4ec',
    desc: 'Quét mã QR trên ứng dụng MoMo',
  },
  {
    key: 'VNPay',
    name: 'VNPay',
    icon: '💳',
    color: '#0066b2',
    bg: '#e3f2fd',
    desc: 'Thanh toán qua cổng VNPay',
  },
  {
    key: 'ChuyenKhoan',
    name: 'Chuyển khoản',
    icon: '🏦',
    color: '#2e7d32',
    bg: '#e8f5e9',
    desc: 'Chuyển khoản ngân hàng trực tiếp',
  },
];

export default function PaymentModal({ open, onClose, invoice, onConfirm, loading }) {
  const { message } = AntdApp.useApp();
  const [step, setStep] = useState(1); // 1: chọn PT, 2: xác nhận, 3: thành công
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [processing, setProcessing] = useState(false);

  const formatCurrency = (val) => `${Number(val || 0).toLocaleString('vi-VN')} đ`;

  const handleConfirm = async () => {
    setProcessing(true);
    try {
      await onConfirm(selectedMethod);
      setStep(3);
    } catch (error) {
      message.error('Thanh toán thất bại. Vui lòng thử lại.');
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedMethod(null);
    setProcessing(false);
    onClose();
  };

  const soTien = Number(invoice?.TongTien || 0);
  const noiDungCK = `HD ${invoice?.MaHoaDon?.slice(0, 10) || ''} ${invoice?.SoPhong || ''}`.trim();
  const qrUrl = `https://img.vietqr.io/image/${BANK_INFO.bankCode}-${BANK_INFO.accountNumber}-compact2.png?amount=${soTien}&addInfo=${encodeURIComponent(noiDungCK)}&accountName=${encodeURIComponent(BANK_INFO.accountHolder)}`;

  if (!invoice) return null;

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={520}
      centered
      destroyOnHidden
      styles={{ body: { padding: 0 } }}
    >
      <div style={{ padding: 0 }}>
        {/* HEADER */}
        <div style={{
          background: 'linear-gradient(135deg, #1a2332 0%, #2d4a6f 100%)',
          padding: '24px 28px',
          color: 'white',
          borderRadius: '8px 8px 0 0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>💳</div>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                {step === 3 ? 'Thanh toán thành công' : 'Thanh toán hóa đơn'}
              </h3>
              <span style={{ fontSize: 12, opacity: 0.6 }}>
                {invoice.ThangThu ? `Kỳ thu: Tháng ${invoice.ThangThu}` : ''}
              </span>
            </div>
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px',
            marginTop: 8,
          }}>
            <span style={{ fontSize: 13, opacity: 0.7 }}>Tổng thanh toán</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: '#ffd60a' }}>
              {formatCurrency(soTien)}
            </span>
          </div>
        </div>

        {/* BODY */}
        <div style={{ padding: '24px 28px' }}>

          {/* ===== STEP 1: CHỌN PHƯƠNG THỨC ===== */}
          {step === 1 && (
            <>
              <h4 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#1a2332' }}>
                Chọn phương thức thanh toán
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {PAYMENT_METHODS.map((method) => {
                  const isSelected = selectedMethod === method.key;
                  return (
                    <div
                      key={method.key}
                      onClick={() => setSelectedMethod(method.key)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                        border: `2px solid ${isSelected ? method.color : '#e8e8e8'}`,
                        background: isSelected ? method.bg : '#fafafa',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: method.bg, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 24,
                      }}>
                        {method.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#1a2332' }}>{method.name}</div>
                        <div style={{ fontSize: 12, color: '#888' }}>{method.desc}</div>
                      </div>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        border: `2px solid ${isSelected ? method.color : '#ddd'}`,
                        background: isSelected ? method.color : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s ease',
                      }}>
                        {isSelected && <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>✓</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => selectedMethod && setStep(2)}
                disabled={!selectedMethod}
                style={{
                  width: '100%', marginTop: 20, padding: '14px',
                  background: selectedMethod ? 'linear-gradient(135deg, #1a2332, #2d4a6f)' : '#e0e0e0',
                  color: selectedMethod ? 'white' : '#999',
                  border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700,
                  cursor: selectedMethod ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                }}
              >
                Tiếp tục →
              </button>
            </>
          )}

          {/* ===== STEP 2: XÁC NHẬN THANH TOÁN ===== */}
          {step === 2 && (
            <>
              {/* Phương thức đã chọn */}
              {(() => {
                const method = PAYMENT_METHODS.find(m => m.key === selectedMethod);
                return (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', borderRadius: 10,
                    background: method?.bg, marginBottom: 20,
                  }}>
                    <span style={{ fontSize: 20 }}>{method?.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: method?.color }}>
                      Thanh toán qua {method?.name}
                    </span>
                    <button
                      onClick={() => setStep(1)}
                      style={{
                        marginLeft: 'auto', fontSize: 12, color: '#888',
                        background: 'none', border: 'none', cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >Đổi</button>
                  </div>
                );
              })()}

              {/* QR Code */}
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{
                  display: 'inline-block', padding: 12,
                  background: 'white', borderRadius: 16,
                  border: '2px solid #e8e8e8',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                }}>
                  <img
                    src={qrUrl}
                    alt="QR Thanh toán"
                    style={{ width: 200, height: 200, borderRadius: 8 }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div style={{
                    display: 'none', width: 200, height: 200,
                    alignItems: 'center', justifyContent: 'center',
                    background: '#f5f5f5', borderRadius: 8,
                    flexDirection: 'column', gap: 8,
                  }}>
                    <span style={{ fontSize: 40 }}>📱</span>
                    <span style={{ fontSize: 12, color: '#888' }}>Quét mã QR để thanh toán</span>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 10 }}>
                  Quét mã QR bằng ứng dụng {selectedMethod === 'MoMo' ? 'MoMo' : selectedMethod === 'VNPay' ? 'VNPay' : 'ngân hàng'}
                </div>
              </div>

              {/* Thông tin chuyển khoản (hiển thị cho tất cả phương thức) */}
              <div style={{
                background: '#f8f9fb', borderRadius: 12, padding: 16,
                marginBottom: 20, border: '1px solid #e8e8e8',
              }}>
                <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#1a2332', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  🏦 Thông tin chuyển khoản
                </h4>
                {[
                  ['Ngân hàng', BANK_INFO.bankName],
                  ['Số tài khoản', BANK_INFO.accountNumber],
                  ['Chủ tài khoản', BANK_INFO.accountHolder],
                  ['Nội dung CK', noiDungCK],
                  ['Số tiền', formatCurrency(soTien)],
                ].map(([label, value], i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: i < 4 ? '1px solid #eee' : 'none',
                  }}>
                    <span style={{ fontSize: 13, color: '#888' }}>{label}</span>
                    <span style={{
                      fontSize: 13, fontWeight: 600, color: '#1a2332',
                      fontFamily: i === 1 ? 'monospace' : 'inherit',
                    }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Lưu ý */}
              <div style={{
                background: '#fff8e1', borderRadius: 10, padding: '10px 14px',
                display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 20,
                border: '1px solid #ffe082',
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
                <span style={{ fontSize: 12, color: '#856404', lineHeight: 1.5 }}>
                  Sau khi chuyển khoản thành công, bấm <strong>"Xác nhận đã thanh toán"</strong> bên dưới.
                  Ban quản lý sẽ kiểm tra và xác nhận giao dịch trong vòng 24h.
                </span>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    flex: 1, padding: '12px', border: '1px solid #ddd',
                    background: 'white', borderRadius: 10, fontSize: 14,
                    fontWeight: 600, cursor: 'pointer', color: '#666',
                  }}
                >← Quay lại</button>
                <button
                  onClick={handleConfirm}
                  disabled={processing}
                  style={{
                    flex: 2, padding: '12px',
                    background: processing ? '#ccc' : 'linear-gradient(135deg, #34c759, #2ac3a2)',
                    color: 'white', border: 'none', borderRadius: 10,
                    fontSize: 14, fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {processing ? '⏳ Đang xử lý...' : '✓ Xác nhận đã thanh toán'}
                </button>
              </div>
            </>
          )}

          {/* ===== STEP 3: THÀNH CÔNG ===== */}
          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg, #34c759, #2ac3a2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', fontSize: 36,
                boxShadow: '0 8px 24px rgba(52,199,89,0.3)',
                animation: 'popIn 0.4s ease',
              }}>
                ✓
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1a2332', margin: '0 0 8px' }}>
                Yêu cầu đã được gửi!
              </h3>
              <p style={{ fontSize: 14, color: '#888', margin: '0 0 6px', lineHeight: 1.6 }}>
                Số tiền: <strong style={{ color: '#1a2332' }}>{formatCurrency(soTien)}</strong>
              </p>
              <p style={{ fontSize: 13, color: '#888', margin: '0 0 24px', lineHeight: 1.6 }}>
                Ban quản lý sẽ xác nhận thanh toán trong vòng 24h.<br />
                Trạng thái hóa đơn sẽ chuyển thành <strong style={{ color: '#f59e0b' }}>"Chờ xác nhận"</strong>.
              </p>

              <div style={{
                background: '#f0f9ff', borderRadius: 12, padding: 16,
                display: 'flex', alignItems: 'center', gap: 12,
                border: '1px solid #bae6fd',
              }}>
                <span style={{ fontSize: 24 }}>📋</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0369a1' }}>Theo dõi trạng thái</div>
                  <div style={{ fontSize: 12, color: '#888' }}>
                    Kiểm tra mục "Hóa đơn" để xem kết quả xác nhận.
                  </div>
                </div>
              </div>

              <button
                onClick={handleClose}
                style={{
                  width: '100%', marginTop: 20, padding: '14px',
                  background: 'linear-gradient(135deg, #1a2332, #2d4a6f)',
                  color: 'white', border: 'none', borderRadius: 12,
                  fontSize: 15, fontWeight: 700, cursor: 'pointer',
                }}
              >
                Đóng
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes popIn {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </Modal>
  );
}
