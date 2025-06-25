import React, { useState, useEffect } from 'react';
import styles from './Profile.module.css';
import { Modal, Input, message, Spin, Radio } from 'antd';
import axios from 'axios';
import { DatePicker, Cascader, ActionSheet, PullToRefresh } from 'antd-mobile';
import dayjs from 'dayjs';
import Cropper from 'react-cropper';
import imageCompression from 'browser-image-compression';


const fieldMap = [
  { key: 'img', label: '头像' },
  { key: 'name', label: '姓名' },
  { key: 'gender', label: '性别' },
  { key: 'password', label: '密码' },
  { key: 'phone', label: '手机号' },
  { key: 'studentId', label: '学号' },
  { key: 'address', label: '地址' },
  { key: 'tag', label: '标签' },
  { key: 'birthday', label: '生日' }
];

// 简单的省市区三级联动数据
const regionData = [
  {
    label: '北京市',
    value: '110000',
    children: [
      {
        label: '北京市',
        value: '110100',
        children: [
          { label: '东城区', value: '110101' },
          { label: '西城区', value: '110102' }
        ]
      }
    ]
  },
  {
    label: '广东省',
    value: '440000',
    children: [
      {
        label: '广州市',
        value: '440100',
        children: [
          { label: '天河区', value: '440106' },
          { label: '越秀区', value: '440104' }
        ]
      },
      {
        label: '深圳市',
        value: '440300',
        children: [
          { label: '南山区', value: '440305' },
          { label: '福田区', value: '440304' }
        ]
      }
    ]
  },
  {
    label: '河北省',
    value: '330000',
    children: [
      {
        label: '石家庄市',
        value: '330100',
        children: [
          { label: '藁城区', value: '330106' },
          { label: '正定县', value: '330104' }
        ]
      },
      {
        label: '邯郸市',
        value: '330300',
        children: [
          { label: '邯山区', value: '330305' },
          { label: '复兴区', value: '330304' }
        ]
      },
      {
        label: '保定市',
        value: '330301',
        children: [
          { label: '莲池区', value: '330306' },
          { label: '清苑区', value: '330307' }
        ]
      }
    ]
  }
];

// 递归查找 value 路径对应的 label 数组
function getLabelsByValuePath(options, valuePath) {
  const labels = [];
  let currentOptions = options;
  for (const value of valuePath) {
    const found = currentOptions.find(item => item.value === value);
    if (found) {
      labels.push(found.label);
      currentOptions = found.children || [];
    } else {
      break;
    }
  }
  return labels;
}

const Profile = () => {
  const [userInfo, setUserInfo] = useState({
    name: '',
    password: '',
    phone: '',
    studentId: '',
    address: '',
    img: '',
    tag: '',
    birthday: '',
    gender: '',
    userid: ''
  });
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [cascaderVisible, setCascaderVisible] = useState(false);
  const [cascaderValue, setCascaderValue] = useState([]);
  const [detailAddress, setDetailAddress] = useState('');
  const fileInputRef = React.useRef(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // 手机号修改弹窗专用
  const [phoneHidden, setPhoneHidden] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // 页面加载时从后端获取用户信息
  useEffect(() => {
    // 从localStorage获取token
    const tokenObj = localStorage.getItem('token');
    let studentId = '';
    if (tokenObj) {
      try {
        studentId = JSON.parse(tokenObj).studentId;
      } catch (e) {
        studentId = '';
      }
    }
    console.log(studentId, 11);
    if (!studentId) {
      // 没有studentId可做跳转或提示
      return;
    }
    axios.post('/wsj/getProfile', { studentId: studentId })
      .then(res => {
        const user = res.data.data;
        user.phone = user.phone ? String(user.phone) : '';
        setUserInfo(user);
        localStorage.setItem('userInfo', JSON.stringify(user)); // 同步存储最新用户信息
        console.log(user, 22);
      })
      .catch(() => {
        // 可以加报错提示
      });
  }, []);

  const handleEdit = (field) => {
    if (field.key === 'img') {
      fileInputRef.current && fileInputRef.current.click();
      return;
    }
    setEditField(field.key);
    if (field.key === 'birthday') {
      setDatePickerVisible(true);
      return;
    }
    if (field.key === 'address') {
      setCascaderValue([]);
      setDetailAddress('');
      setCascaderVisible(true);
      return;
    }
    if (field.key === 'password') {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else if (field.key === 'phone') {
      setPhoneHidden('');
      setNewPhone('');
    } else if (field.key === 'gender') {
      setEditValue(userInfo.gender || '');
    } else {
      setEditValue(userInfo[field.key] || '');
    }
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    setLoading(true);
    try {
      if (editField === 'password') {
        if (!oldPassword || !newPassword || !confirmPassword) {
          message.error('请填写完整');
          setLoading(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          message.error('两次新密码不一致');
          setLoading(false);
          return;
        }
        const res = await axios.post('/wsj/updateProfile', {
          field: 'password',
          oldPassword,
          newPassword,
          studentId: userInfo.studentId
        });
        if (res.data && res.data.status === 0) {
          message.error(res.data.message || '旧密码输入错误');
        } else {
          setUserInfo(res.data.data);
          message.success('修改成功');
          setModalVisible(false);
        }
      } else if (editField === 'phone') {
        if (!phoneHidden || !newPhone) {
          message.error('请填写完整');
          setLoading(false);
          return;
        }
        // 拼接完整旧手机号
        const oldPhone = (userInfo.phone || '').replace(/^(\d{3})\d{6}(\d{2})$/, `$1${phoneHidden}$2`);
        const res = await axios.post('/wsj/updateProfile', {
          field: 'phone',
          oldPhone,
          newPhone,
          studentId: userInfo.studentId
        });
        if (res.data && res.data.status === 0) {
          message.error(res.data.message || '原手机号验证失败');
        } else {
          setUserInfo(res.data.data);
          message.success('修改成功');
          setModalVisible(false);
        }
      } else if (editField === 'gender') {
        const res = await axios.post('/wsj/updateProfile', {
          field: 'gender',
          value: editValue,
          studentId: userInfo.studentId
        });
        setUserInfo(res.data.data);
        message.success('修改成功');
        setModalVisible(false);
      } else {
        const res = await axios.post('/wsj/updateProfile', {
          field: editField,
          value: editValue,
          studentId: userInfo.studentId
        });
        setUserInfo(res.data.data);
        message.success('修改成功');
        setModalVisible(false);
      }
    } catch (e) {
      message.error(e.response?.data?.message || '修改失败');
    } finally {
      setLoading(false);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const handleBack = () => {
    window.history.back();
  };

  const handleCascaderConfirm = async (val, extend) => {
    setCascaderVisible(false);
    // 用 val 去 regionData 查找 label
    const fullAddress = getLabelsByValuePath(regionData, val).join('');
    setLoading(true);
    try {
      const res = await axios.post('/wsj/updateAddress', {
        address: fullAddress,
        studentId: userInfo.studentId
      });
      setUserInfo(res.data.data);
      message.success('修改成功');
    } catch (e) {
      message.error('修改失败');
    } finally {
      setLoading(false);
    }
  };

  // 头像上传
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 压缩参数
    const options = {
      maxSizeMB: 0.5, // 压缩后最大 0.5MB
      maxWidthOrHeight: 500, // 最大宽高 500px
      useWebWorker: true
    };

    setLoading(true);
    try {
      // 压缩图片
      const compressedFile = await imageCompression(file, options);

      const formData = new FormData();
      formData.append('img', compressedFile);
      formData.append('studentId', userInfo.studentId);

      const res = await axios.post('/wsj/uploadAvatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUserInfo(res.data.data);
      message.success('头像上传成功');
    } catch (e) {
      message.error('头像上传失败');
    } finally {
      setLoading(false);
    }
  };

  // 模拟刷新用户信息
  const handleRefresh = () => {
    // 这里可以调用获取用户信息的接口，演示用 Promise.resolve() 保证动画结束
    return Promise.resolve();
  };

  return (
    <div className={styles.container}>
      {/* 全局 loading 遮罩 */}
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(255,255,255,0.6)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Spin size="large" tip="图片上传中..." />
        </div>
      )}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.backIcon} onClick={handleBack}>
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </div>
          <div className={styles.title}>个人资料</div>
        </div>
      </div>
      <div className={styles.content}>
        <PullToRefresh
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          onRefresh={handleRefresh}
          renderText={status => {
            if (status === 'pulling' || status === 'canRelease') return <div className={styles.ptrText}>↓ 下拉刷新</div>;
            return '';
          }}
        >
          {fieldMap.map((item) => (
            <div
              key={item.key}
              className={styles.item}
              onClick={item.key === 'studentId' ? undefined : () => handleEdit(item)}
              style={item.key === 'studentId' ? { cursor: 'not-allowed', color: '#bbb' } : {}}
            >
              <div className={styles.label}>{item.label}</div>
              <div className={styles.value}>
                {item.key === 'img' ? (
                  <>
                    <img
                      src={userInfo.img || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                      alt="头像"
                      className={styles.avatar}
                      style={{ cursor: 'pointer' }}
                      onError={e => { e.target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'; }}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={handleAvatarChange}
                    />
                  </>
                ) : item.key === 'password' ? (
                  '******'
                ) : item.key === 'phone' ? (
                  userInfo.phone ? userInfo.phone.replace(/^(\d{3})\d{6}(\d{2})$/, '$1******$2') : <span style={{ color: '#bbb' }}>未填写</span>
                ) : item.key === 'tag' ? (
                  userInfo.tag
                    ? (userInfo.tag.length > 20 ? userInfo.tag.slice(0, 20) + '...' : userInfo.tag)
                    : <span style={{ color: '#bbb' }}>未填写</span>
                ) : item.key === 'gender' ? (
                  userInfo.gender
                    ? userInfo.gender
                    : <span style={{ color: '#bbb' }}>未填写</span>
                ) : (
                  userInfo[item.key] || <span style={{ color: '#bbb' }}>未填写</span>
                )}
                <span className={styles.arrow}>{item.key === 'studentId' ? '' : '›'}</span>
              </div>
            </div>
          ))}
        </PullToRefresh>
      </div>
      <Modal
        title={`修改${fieldMap.find(f => f.key === editField)?.label || ''}`}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={loading}
        okText="确定"
        cancelText="取消"
      >
        {editField === 'password' ? (
          <>
            <Input.Password
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              placeholder="请输入旧密码"
              style={{ marginBottom: 8 }}
            />
            <Input.Password
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="请输入新密码"
              style={{ marginBottom: 8 }}
            />
            <Input.Password
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="请确认新密码"
            />
          </>
        ) : editField === 'phone' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ letterSpacing: 2 }}>{(userInfo.phone || '').replace(/^(\d{3})\d{6}(\d{2})$/, '$1******$2')}</span>
              <Input
                value={phoneHidden}
                onChange={e => setPhoneHidden(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="请输入中间6位"
                style={{ width: 120, marginLeft: 8 }}
                maxLength={6}
              />
            </div>
            <Input
              value={newPhone}
              onChange={e => setNewPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
              placeholder="请输入新手机号"
            />
          </>
        ) : editField === 'gender' ? (
          <Radio.Group
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            style={{ width: '100%' }}
          >
            <Radio value="男">男</Radio>
            <Radio value="女">女</Radio>
          </Radio.Group>
        ) : (
          <Input
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            placeholder={`请输入${fieldMap.find(f => f.key === editField)?.label || ''}`}
          />
        )}
      </Modal>
      <DatePicker
        title="选择生日"
        visible={datePickerVisible}
        onClose={() => setDatePickerVisible(false)}
        value={userInfo.birthday ? new Date(userInfo.birthday) : undefined}
        min={new Date('1925-01-01')}
        max={new Date()}
        onConfirm={async (val) => {
          setDatePickerVisible(false);
          const dateString = dayjs(val).format('YYYY-MM-DD');
          setLoading(true);
          try {
            await axios.post('/wsj/updateProfile', {
              field: 'birthday',
              value: dateString,
              studentId: userInfo.studentId,
            });
            setUserInfo(prev => ({ ...prev, birthday: dateString }));
            message.success('修改成功');
          } catch (e) {
            message.error('修改失败');
          } finally {
            setLoading(false);
          }
        }}
      />
      <div style={{ borderRadius: 16, overflow: 'hidden' }}>
        <Cascader
          options={regionData}
          visible={cascaderVisible}
          value={cascaderValue}
          onClose={() => setCascaderVisible(false)}
          onConfirm={handleCascaderConfirm}
          title="选择省市区"
        />
      </div>
    </div>
  );
};

export default Profile; 