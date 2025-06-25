import React, { useEffect, useState } from 'react'
import Navbar from '../component/Navbar'
import { Button, Toast, TextArea, Input, Popup, List, Form, Dialog } from 'antd-mobile'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import styles from './Jifen.module.css'

export default function ShopTi() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get('id');

  const [user, setUser] = useState({ name: '', phone: '', address: '' });
  const [goods, setGoods] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [remark, setRemark] = useState('');
  const [count, setCount] = useState(1);
  const [addressList, setAddressList] = useState([]);
  const [addressPopupVisible, setAddressPopupVisible] = useState(false);
  const [addAddressVisible, setAddAddressVisible] = useState(false);
  const [form] = Form.useForm();

  // 预设的地址标签选项
  const addressTags = ['家', '公司', '学校', '其他'];

  // 获取用户信息（可根据实际情况调整）
  useEffect(() => {
    // 自动获取地址信息并选中默认地址
    fetchAddressList(true);
  }, []);

  // 获取商品信息
  useEffect(() => {
    if (!id) {
      setError('未找到商品ID');
      setLoading(false);
      return;
    }
    axios.get(`http://localhost:3000/ss?_id=${id}`)
      .then(res => {
        if (res.data && res.data.data && res.data.data.length > 0) {
          setGoods(res.data.data[0]);
        } else {
          setError('未找到商品信息');
        }
      })
      .catch(() => {
        setError('获取商品信息失败');
      })
      .finally(() => setLoading(false));
  }, [id]);

  // 处理数量变化
  const handleCountChange = (value) => {
    const num = parseInt(value);
    if (isNaN(num)) {
      setCount(1);
      return;
    }
    if (num < 1) {
      Toast.show({ icon: 'fail', content: '最小数量为1' });
      setCount(1);
      return;
    }
    if (num > 99) {
      Toast.show({ icon: 'fail', content: '最大数量为99' });
      setCount(99);
      return;
    }
    setCount(num);
  };

  // 处理数量增减
  const handleCountAdjust = (delta) => {
    const newCount = count + delta;
    if (newCount < 1) {
      Toast.show({ icon: 'fail', content: '最小数量为1' });
      return;
    }
    if (newCount > 99) {
      Toast.show({ icon: 'fail', content: '最大数量为99' });
      return;
    }
    setCount(newCount);
  };

  // 获取地址列表
  const fetchAddressList = async (autoSelect = false) => {
    const userid = localStorage.getItem('user');
    if (!userid) {
      Toast.show({ icon: 'fail', content: '请先登录' });
      return;
    }
    try {
      const res = await axios.get('http://localhost:3000/wsj/list', { params: { userid } });
      if (res.data.status === 1) {
        const addresses = res.data.data || [];
        setAddressList(addresses);
        
        // 只有在需要自动选择时才选中默认地址或第一个地址
        if (autoSelect && addresses.length > 0) {
          const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
          setUser({
            name: defaultAddress.name,
            phone: defaultAddress.phone,
            address: defaultAddress.address,
          });
        } else if (addresses.length === 0) {
          // 没有地址时，清空用户信息并显示提示
          setUser({ name: '', phone: '', address: '' });
          Toast.show({ 
            icon: 'fail', 
            content: '暂无地址，请添加收货地址',
            duration: 2000
          });
        }
      } else {
        Toast.show({ icon: 'fail', content: '获取地址失败' });
      }
    } catch {
      Toast.show({ icon: 'fail', content: '获取地址失败' });
    }
  };

  // 地址弹窗点击
  const handleAddrClick = async () => {
    await fetchAddressList(false); // 不自动选择
    setAddressPopupVisible(true);
  };

  // 选择地址
  const handleSelectAddr = (addr) => {
    setUser({
      name: addr.name,
      phone: addr.phone,
      address: addr.address,
    });
    setAddressPopupVisible(false);
  };

  // 设置默认地址
  const handleSetDefault = async (addr) => {
    const userid = localStorage.getItem('user');
    if (!userid) {
      Toast.show({ icon: 'fail', content: '请先登录' });
      return;
    }
    try {
      const res = await axios.post('http://localhost:3000/wsj/setDefault', {
        id: addr.id,
        userid
      });
      if (res.data.status === 1) {
        Toast.show({ icon: 'success', content: '设置成功' });
        await fetchAddressList(false); // 重新获取地址列表，但不自动选中
      } else {
        Toast.show({ icon: 'fail', content: res.data.message || '设置失败' });
      }
    } catch {
      Toast.show({ icon: 'fail', content: '设置失败' });
    }
  };

  // 添加地址
  const handleAddAddress = () => {
    setAddressPopupVisible(false); // 先隐藏地址选择弹窗
    setAddAddressVisible(true); // 显示添加地址弹窗
  };

  // 选择地址标签
  const handleSelectTag = (tag) => {
    form.setFieldValue('tag', tag);
  };

  // 提交添加地址
  const handleSubmitAddress = async (values) => {
    const userid = localStorage.getItem('user');
    if (!userid) {
      Toast.show({ icon: 'fail', content: '请先登录' });
      return;
    }
    try {
      const res = await axios.post('http://localhost:3000/wsj/add', {
        ...values,
        userid
      });
      if (res.data.status === 1) {
        Toast.show({ icon: 'success', content: '添加成功' });
        setAddAddressVisible(false); // 隐藏添加地址弹窗
        form.resetFields();
        
        // 重新获取地址列表并显示地址选择弹窗
        await fetchAddressList(false); // 不自动选择
        setAddressPopupVisible(true); // 重新显示地址选择弹窗
      } else {
        Toast.show({ icon: 'fail', content: res.data.message || '添加失败' });
      }
    } catch {
      Toast.show({ icon: 'fail', content: '添加失败' });
    }
  };

  // 生成订单
  const handleOrder = async () => {
    if (!goods) return;
    if (count < 1) return;
    
    // 检查是否有收货地址
    if (!user.name || !user.phone || !user.address) {
      Toast.show({ icon: 'fail', content: '请先选择收货地址' });
      return;
    }
    
    setSubmitting(true);
    try {
      const userid = localStorage.getItem('user');
      if (!userid) {
        Toast.show({ icon: 'fail', content: '请先登录' });
        setSubmitting(false);
        return;
      }
      // 这里补充所有参数
      const res = await axios.post('http://localhost:3000/ss/order/create', {
        userid,
        goodsid: goods._id,
        goodsname: goods.name,
        img: goods.img,
        price: goods.price * count, // 总积分
        unitPrice: goods.price, // 单价
        count,
        status:0,
        username: user.name,
        phone: user.phone,
        address: user.address,
        remark: remark || '',
        yunfei: 0 // 运费
      });
      if (res.data && res.data.code === 200) {
        Toast.show({ icon: 'success', content: '兑换成功！' });
        setTimeout(() => {
          navigate('/jifendui');
        }, 1200);
      } else {
        Toast.show({ icon: 'fail', content: res.data.msg || '兑换失败' });
      }
    } catch (err) {
      Toast.show({ icon: 'fail', content: '兑换失败，请稍后重试' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.shoptiPage}>
        <div className={styles.navbar}><Navbar title="提交订单"/></div>
        <div className={styles.loading}>加载中...</div>
      </div>
    )
  }
  if (error) {
    return (
      <div className={styles.shoptiPage}>
        <div className={styles.navbar}><Navbar title="提交订单"/></div>
        <div className={styles.errorMessage}>{error}</div>
      </div>
    )
  }

  return (
    <div className={styles.shoptiPage}>
      <div className={styles.navbar}><Navbar title="提交订单"/></div>
      {/* 顶部蓝色背景和白色卡片包裹地址 */}
      <div className={styles.shoptiTopBg}>
        <div className={styles.shoptiAddrCard} onClick={handleAddrClick} style={{cursor:'pointer'}}>
          <div className={styles.shoptiAddrIcon}>
            {/* 定位图标SVG */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2C6.13 2 3 5.13 3 9c0 5.25 6.25 8.75 6.53 8.9.3.16.64.16.94 0C10.75 17.75 17 14.25 17 9c0-3.87-3.13-7-7-7zm0 11.5c-2.48 0-4.5-2.02-4.5-4.5S7.52 4.5 10 4.5s4.5 2.02 4.5 4.5-2.02 4.5-4.5 4.5zm0-7A2.5 2.5 0 1 0 10 11a2.5 2.5 0 0 0 0-5z" fill="#1677ff"/></svg>
          </div>
          <div className={styles.shoptiAddrInfo}>
            {user.name && user.phone && user.address ? (
              <>
                <div className={styles.shoptiAddrUser}><span>{user.name}</span> <span className={styles.shoptiAddrPhone}>{user.phone}</span></div>
                <div className={styles.shoptiAddrDetail}>{user.address}</div>
              </>
            ) : (
              <>
                <div className={styles.shoptiAddrUser} style={{ color: '#999' }}>请选择收货地址</div>
                <div className={styles.shoptiAddrDetail} style={{ color: '#ccc' }}>点击添加收货地址</div>
              </>
            )}
          </div>
          <div className={styles.shoptiAddrArrow}>›</div>
        </div>
      </div>
      
      {/* 地址选择弹窗 */}
      <Popup
        visible={addressPopupVisible}
        onMaskClick={() => setAddressPopupVisible(false)}
        bodyStyle={{ borderRadius: '12px 12px 0 0', minHeight: 200 }}
      >
        <div style={{ padding: '16px', borderBottom: '1px solid #eee' }}>
          <div style={{ 
            background: '#f5f5f5', 
            padding: '8px 12px', 
            borderRadius: '6px', 
            fontSize: '12px', 
            color: '#666',
            marginBottom: '12px'
          }}>
            💡 完整功能请前往"我的-设置地址"进行管理
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>选择收货地址</h3>
            <Button 
              size='small' 
              color='primary' 
              onClick={handleAddAddress}
              style={{ fontSize: '12px' }}
            >
              添加地址
            </Button>
          </div>
        </div>
        
        <List style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {addressList.length === 0 ? (
            <List.Item>
              <div style={{ textAlign: 'center', color: '#999', padding: '40px 20px' }}>
                <div style={{ fontSize: '16px', marginBottom: '8px' }}>暂无收货地址</div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>请添加收货地址以便完成订单</div>
                <Button 
                  size='small' 
                  color='primary' 
                  onClick={() => {
                    setAddressPopupVisible(false); // 隐藏地址选择弹窗
                    setAddAddressVisible(true); // 显示添加地址弹窗
                  }}
                >
                  立即添加
                </Button>
              </div>
            </List.Item>
          ) : (
            addressList.map(addr => (
              <List.Item 
                key={addr.id || addr._id} 
                onClick={() => handleSelectAddr(addr)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div>
                      <span style={{ fontWeight: 'bold' }}>{addr.name}</span>
                      <span style={{ marginLeft: '8px', color: '#666' }}>{addr.phone}</span>
                      {addr.isDefault && (
                        <span style={{ 
                          background: '#1677ff', 
                          color: 'white', 
                          fontSize: '10px', 
                          padding: '2px 6px', 
                          borderRadius: '4px',
                          marginLeft: '8px'
                        }}>
                          默认
                        </span>
                      )}
                    </div>
                    {!addr.isDefault && (
                      <Button 
                        size='mini' 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefault(addr);
                        }}
                        style={{ fontSize: '10px' }}
                      >
                        设为默认
                      </Button>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{addr.address}</div>
                </div>
              </List.Item>
            ))
          )}
        </List>
      </Popup>

      {/* 添加地址弹窗 */}
      <Dialog
        visible={addAddressVisible}
        onClose={() => {
          setAddAddressVisible(false);
          setAddressPopupVisible(true); // 取消时回到地址选择弹窗
        }}
        title="添加收货地址"
        content={
          <Form
            form={form}
            onFinish={handleSubmitAddress}
            layout='vertical'
            style={{ padding: '16px 0' }}
          >
            <Form.Item
              name="name"
              label="联系人"
              rules={[{ required: true, message: '请输入联系人姓名' }]}
            >
              <Input placeholder="请输入联系人姓名" />
            </Form.Item>
            <Form.Item
              name="phone"
              label="手机号"
              rules={[
                { required: true, message: '请输入手机号' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
              ]}
            >
              <Input placeholder="请输入手机号" />
            </Form.Item>
            <Form.Item
              name="address"
              label="详细地址"
              rules={[{ required: true, message: '请输入详细地址' }]}
            >
              <TextArea 
                placeholder="请输入详细地址" 
                rows={3}
                maxLength={100}
                showCount
              />
            </Form.Item>
            <Form.Item
              name="tag"
              label="地址标签"
            >
              <Input placeholder="如：家、公司、学校（选填）" />
            </Form.Item>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>快速选择标签：</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {addressTags.map(tag => (
                  <Button
                    key={tag}
                    size='small'
                    fill='outline'
                    onClick={() => handleSelectTag(tag)}
                    style={{ 
                      fontSize: '12px',
                      padding: '4px 12px',
                      borderRadius: '16px'
                    }}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <Button 
                block 
                onClick={() => {
                  setAddAddressVisible(false);
                  setAddressPopupVisible(true); // 取消时回到地址选择弹窗
                }}
                style={{ flex: 1 }}
              >
                取消
              </Button>
              <Button 
                block 
                color='primary' 
                type='submit'
                style={{ flex: 1 }}
              >
                保存
              </Button>
            </div>
          </Form>
        }
      />

      {/* 商品卡片 */}
      <div className={styles.shoptiGoodsCard}>
        <div className={styles.shoptiGoodsItem}>
          <img src={goods.img} alt={goods.name} className={styles.shoptiGoodsImg}/>
          <div className={styles.shoptiGoodsDetail}>
            <div className={styles.shoptiGoodsName}>{goods.name}</div>
            <div className={styles.shoptiGoodsPrice}><span>{goods.price}</span><span className={styles.shoptiGoodsPriceUnit}>积分</span></div>
            <div className={styles.shoptiGoodsCount}>
              <button onClick={() => handleCountAdjust(-1)} style={{marginRight:8}}>-</button>
              <Input
                type='number'
                value={count.toString()}
                onChange={handleCountChange}
                style={{
                  width: '50px',
                  textAlign: 'center',
                  padding: '0 4px'
                }}
              />
              <button onClick={() => handleCountAdjust(1)} style={{marginLeft:8}}>+</button>
            </div>
          </div>
        </div>
      </div>
      {/* 留言输入框 */}
      <div className={styles.shoptiRemarkBox}>
        <TextArea
          className={styles.shoptiRemark}
          placeholder="给买家留言"
          value={remark}
          onChange={setRemark}
          maxLength={50}
          rows={2}
          showCount
        />
      </div>
      {/* 订单信息 */}
      <div className={styles.shoptiInfoCard}>
        <div className={styles.shoptiInfoRow}>
          <span>所需积分</span>
          <span className={styles.shoptiInfoValue}>{goods.price * count}积分</span>
        </div>
        <div className={styles.shoptiInfoRow}>
          <span>运费</span>
          <span className={styles.shoptiInfoValue}>￥0.00</span>
        </div>
      </div>
      {/* 底部按钮 */}
      <div className={styles.shoptiBtnBox}>
        <Button block color='primary' size='large' loading={submitting} onClick={handleOrder} disabled={submitting}>
          立即兑换
        </Button>
      </div>
    </div>
  )
}
