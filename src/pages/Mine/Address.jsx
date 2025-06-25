import React, { useState, useEffect } from 'react';
import styles from './Address.module.css';
import AddressModal from './components/AddressModal';
import { message, Modal, Spin } from 'antd';
import axios from 'axios';

let lastTimestamp = 0;
let counter = 0;

const generateUniqueId = () => {
  const now = Date.now();
  if (now === lastTimestamp) {
    counter += 1;
  } else {
    lastTimestamp = now;
    counter = 0;
  }
  // 拼成一个大数字，保证唯一且递增
  return Number(`${now}${counter.toString().padStart(3, '0')}`);
};

const Address = () => {
  const [addresses, setAddresses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 获取当前用户ID
  const userStr = localStorage.getItem('token');
  let userid = '';
  if (userStr) {
    try {
      const userArr = JSON.parse(userStr);
      if (userArr) {
        userid = userArr._id;
      }
    } catch (e) {
      userid = '';
    }
  }

  // 页面初次加载
  useEffect(() => {
    setIsLoading(true);
    axios.get('/wsj/list', {
        params: { userid },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
    }).then(response => {
      setAddresses(sortAddresses(response.data.status === 1 ? (response.data.data || []) : []));
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  // 获取地址列表（用于下拉刷新）
  const fetchAddresses = () => {
    return axios.get('/wsj/list', {
      params: { userid },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(response => {
      setAddresses(sortAddresses(response.data.status === 1 ? (response.data.data || []) : []));
    }).catch(() => {
      // 可以弹个错误提示
    }).finally(() => {
      // finally 一定会执行，resolve Promise
      return Promise.resolve();
    });
  };

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBack = () => {
    window.history.back();
  };

  const handleAdd = () => {
    setEditingAddress(null);
    setShowModal(true);
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAddress(null);
  };

  const handleDelete = (addressId) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该地址吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await axios.delete('/wsj/delete', {
            data: { id: addressId, userid }
          });
          if (response.data.status === 1) {
            message.success('删除成功');
            await fetchAddresses();
          } else {
            message.error('删除失败');
          }
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  const handleSetDefault = async (addressId) => {
    try {
      const response = await axios.post('/wsj/setDefault', {
        userid,
        id: addressId
      });
      if (response.data.status === 1) {
        message.success('设置默认地址成功');
        await fetchAddresses();
      } else {
        message.error('设置默认地址失败');
      }
    } catch (error) {
      message.error('设置默认地址失败');
    }
  };

  const handleSaveAddress = async (formData) => {
    if (formData.id) {
      await handleUpdateAddress(formData);
    } else {
      await handleAddAddress(formData);
    }
  };

  const handleAddAddress = async (formData) => {
    try {
      const addressId = generateUniqueId();
      const response = await axios.post('/wsj/add', {
        id: addressId,
        address: formData.address,
        name: formData.name,
        phone: formData.phone.replace(/\s/g, ''),
        tag: formData.tag,
        userid: userid,
        latitude: formData.latitude,
        longitude: formData.longitude,
        isDefault: formData.isDefault || false
      });
      if (response.data.status === 1) {
        message.success('添加成功');
        await fetchAddresses();
        setShowModal(false);
        setEditingAddress(null);
      } else {
        message.error('添加失败');
      }
    } catch (error) {
      message.error('添加失败');
    }
  };

  const handleUpdateAddress = async (formData) => {
    try {
      const response = await axios.post('/wsj/update', {
        id: formData.id,
        address: formData.address,
        name: formData.name,
        phone: formData.phone.replace(/\s/g, ''),
        tag: formData.tag,
        userid: userid,
        latitude: formData.latitude,
        longitude: formData.longitude,
        isDefault: formData.isDefault || false
      });
      if (response.data.status === 1) {
        message.success('修改成功');
        await fetchAddresses();
        setShowModal(false);
        setEditingAddress(null);
      } else {
        message.error('修改失败');
      }
    } catch (error) {
      message.error('修改失败');
    }
  };

  // 返回顶部函数
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // 用于排序默认地址到第一位
  function sortAddresses(addresses) {
    if (!Array.isArray(addresses)) return addresses;
    return addresses.slice().sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.backIcon} onClick={handleBack}>
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </div>
          <div className={styles.title}>收货地址</div>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.add} onClick={handleAdd}>
            + 新增地址
          </span>
        </div>
      </div>
      {isLoading ? (
        <div style={{textAlign:'center',padding:'32px 0'}}><Spin size="large" /></div>
      ) : (
      <div className={styles.content}>
        {addresses.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#bbb', marginTop: 40, fontSize: 16 }}>暂无数据</div>
        ) : (
          addresses.map(address => (
            <div key={address.id} className={styles.addressCard}>
              <div className={styles.addressInfo}>
                <div className={styles.userInfo}>
                  <div className={styles.namePhoneContainer}>
                    <div className={styles.label}>收货人：</div>
                    <span className={styles.name}>{address.name}</span>
                    <div className={styles.label}>电话：</div>
                    <span className={styles.phone}>{address.phone}</span>
                  </div>
                </div>
                <div className={styles.addressContainer}>
                  <div>
                    <div className={styles.label}>地址：</div>
                    <div className={styles.addressText}>
                      {address.address}
                    </div>
                  </div>
                </div>
                <div className={styles.bottomSection}>
                  <div className={styles.leftSection}>
                    {address.tag && (
                      <div className={styles.tag}>{address.tag}</div>
                    )}
                    <span 
                      className={styles.actionButton}
                      onClick={() => handleEdit(address)}
                    >
                      修改
                    </span>
                    <span 
                      className={styles.actionButton}
                      onClick={() => handleDelete(address.id)}
                    >
                      删除
                    </span>
                  </div>
                  <div className={styles.defaultSection}>
                    {address.isDefault ? (
                      <span className={`${styles.defaultButton} ${styles.isDefault}`}>
                        默认地址
                      </span>
                    ) : (
                      <span 
                        className={styles.defaultButton}
                        onClick={() => handleSetDefault(address.id)}
                      >
                        设为默认
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      )}
      <AddressModal
        visible={showModal}
        onClose={handleCloseModal}
        onSave={handleSaveAddress}
        initialData={editingAddress}
      />
      {showBackToTop && (
        <button 
          className={styles.backToTopButton}
          onClick={scrollToTop}
          aria-label="返回顶部"
        >
          <svg 
            viewBox="0 0 24 24" 
            width="24" 
            height="24" 
            fill="currentColor"
          >
            <path d="M12.7071 7.29289C12.3166 6.90237 11.6834 6.90237 11.2929 7.29289L5.29289 13.2929C4.90237 13.6834 4.90237 14.3166 5.29289 14.7071C5.68342 15.0976 6.31658 15.0976 6.70711 14.7071L12 9.41421L17.2929 14.7071C17.6834 15.0976 18.3166 15.0976 18.7071 14.7071C19.0976 14.3166 19.0976 13.6834 18.7071 13.2929L12.7071 7.29289Z" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Address; 