import React, { useState } from 'react'
import { NavBar, Form, Input, Button, Toast } from 'antd-mobile'
import { useNavigate, useLocation } from 'react-router-dom'
import { EyeInvisibleOutline, EyeOutline } from 'antd-mobile-icons'
import axios from './axios'

import styles from './Reset.module.css'

export default function Reset() {
  const navigate = useNavigate()
  const location = useLocation()
  const phone = location.state.phone
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [visible1, setVisible1] = useState(true)
  const [visible2, setVisible2] = useState(true)

  const onFinish = async (values) => {
    try {
      setLoading(true)
      // TODO: 实现重置密码的API调用
      await axios.post('/lz/reset', {
        phone: phone,
        password: values.password
      })
      Toast.show({
        icon: 'success',
        content: '密码重置成功！',
      })
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (error) {
      Toast.show({
        icon: 'fail',
        content: '密码重置失败，请重试',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <NavBar back="返回" onBack={() => navigate('/login')} className={styles.nav}>重置密码</NavBar>
      <div className={styles.content}>
        <h2 className={styles.title}>设置新密码</h2>
        <Form
          form={form}
          onFinish={onFinish}
          footer={
            <Button
              loading={loading}
              type="submit"
              className={styles.button}
            >
              确认重置
            </Button>
          }
        >
          <Form.Item
            name="password"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6位' },
              { pattern: /^(?=.*[a-zA-Z])(?=.*\d).+$/, message: '密码需包含字母和数字' }
            ]}
          >
            <div className={styles.password_input}>
              <Input
                type={visible1 ? 'password' : 'text'}
                placeholder="请输入6位以上的新密码"
                className={styles.input}
              />
              <div className={styles.eye_icon} onClick={() => setVisible1(!visible1)}>
                {visible1 ? <EyeInvisibleOutline /> : <EyeOutline />}
              </div>
            </div>
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认密码"
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <div className={styles.password_input}>
              <Input
                type={visible2 ? 'password' : 'text'}
                placeholder="请再次输入新密码"
                className={styles.input}
              />
              <div className={styles.eye_icon} onClick={() => setVisible2(!visible2)}>
                {visible2 ? <EyeInvisibleOutline /> : <EyeOutline />}
              </div>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}
