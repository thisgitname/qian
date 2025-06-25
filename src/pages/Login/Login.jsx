import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Dialog, Toast } from 'antd-mobile';
import { EyeInvisibleOutline, EyeOutline } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCurrentUser as setCollectUser } from '../../store/collect';
import { setCurrentUser as setWrongUser } from '../../store/wrong';
import axios from './axios';
import styles from './Login.module.css';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [checked, setChecked] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // 组件加载时检查是否有保存的账号密码
  useEffect(() => {
    const savedCredentials = localStorage.getItem('userCredentials');
    if (savedCredentials) {
      const credentials = JSON.parse(savedCredentials);
      form.setFieldsValue(credentials);
      setRememberMe(true);
    }
  }, [form]);

  const onFinish = async (values) => {
    if (!checked) {
      Toast.show({
        content: '请先同意用户协议和隐私政策',
        position: 'center',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/lz/login', values);
      if (res.data.code === 200) {
        // 如果勾选了记住我，保存账号密码
        if (rememberMe) {
          localStorage.setItem('userCredentials', JSON.stringify({
            studentId: values.studentId,
            password: values.password,
          }));
        } else {
          localStorage.removeItem('userCredentials');
        }

        // 从响应中获取用户ID
        const userId = res.data.data.studentId;
        if (!userId) {
          throw new Error('登录响应中缺少学生ID');
        }

        // 保存用户数据
        console.log(res.data.data)
        localStorage.setItem('token', JSON.stringify(res.data.data));
        // console.log(res.data.data._id);
        
        localStorage.setItem('userid', userId);
        localStorage.setItem('user',res.data.data._id)
        
        // 设置用户ID到Redux store
        dispatch(setCollectUser(userId));
        dispatch(setWrongUser(userId));
        
        Toast.show({
          icon: 'success',
          content: '登录成功！',
        });
        navigate('/');
      } else {
        Toast.show({
          icon: 'fail',
          content: res.data.msg || '登录失败',
        });
      }
    } catch (error) {
      console.error('登录失败：', error);
      Toast.show({
        icon: 'fail',
        content: error.message === '登录响应中缺少学生ID' ? '服务器返回数据格式错误' : '登录失败，请稍后重试',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.login_container}>
      <div className={styles.background_image}></div>

      <div className={styles.login_form}>
        <h2 className={styles.form_title}>用户登录</h2>

        <Form
          form={form}
          onFinish={onFinish}
          footer={
            <Button
              block
              type="submit"
              color="primary"
              loading={loading}
              disabled={loading}
              className={styles.submit_button}
            >
              登录
            </Button>
          }
        >
          <Form.Item
            name="studentId"
            rules={[
              { required: true, message: '请输入学号' },
              { pattern: /^\d+$/, message: '学号只能包含数字' }
            ]}
          >
            <Input
              placeholder="请输入学号"
              clearable
              className={styles.input_field}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' }
            ]}
          >
            <div className={styles.password_container}>
              <Input
                placeholder="请输入密码"
                type={isPasswordVisible ? 'text' : 'password'}
                className={styles.input_field}
              />
              <div 
                className={styles.password_icon}
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                {isPasswordVisible ? <EyeOutline /> : <EyeInvisibleOutline />}
              </div>
            </div>
          </Form.Item>
        </Form>

        <div className={styles.form_actions}>
          <label className={styles.remember_me}>
            <input 
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            记住我
          </label>

          <span
            className={styles.forget_password}
            onClick={() => navigate('/forget')}
          >
            忘记密码？
          </span>
        </div>
        
        <div className={styles.privacy_agreement}>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className={styles.agreement_checkbox}
          />
          我已知晓
          <a href="/agreement" className={styles.agreement_link}>《用户协议》</a>
          和
          <a href="/privacy" className={styles.agreement_link}>《隐私政策》</a>
          ，并同意相关条款
        </div>
        
        {/* <Button 
          block 
          color="primary" 
          onClick={handleLogin}
          loading={loading}
          disabled={loading}
          className={styles.submit_button}
        >
          登录
        </Button> */}
      </div>
    </div>
  );
};

export default Login;
