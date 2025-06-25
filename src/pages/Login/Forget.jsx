import React, { useState } from 'react'
import styles from './Forget.module.css'
import { Input, Button, NavBar, Toast } from 'antd-mobile'
import { useNavigate } from 'react-router-dom'
import axios from './axios'

export default function Forget() {
    const navigate = useNavigate()
    const [phone, setPhone] = useState('')
    const [code, setCode] = useState('')
    const [serverCode, setServerCode] = useState('') // 存储服务器返回的验证码
    const [isGettingCode, setIsGettingCode] = useState(false) // 获取验证码的loading状态
    const [countdown, setCountdown] = useState(0) // 倒计时状态

    // 验证手机号格式
    const validatePhone = (phone) => {
        const phoneRegex = /^1[3-9]\d{9}$/
        return phoneRegex.test(phone)
    }

    // 处理倒计时
    const startCountdown = () => {
        setCountdown(60)
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    // 处理获取验证码
    const handleGetCode = async () => {
        if (!validatePhone(phone)) {
            Toast.show({
                content: '请输入正确的手机号',
                position: 'top',
            })
            return
        }

        setIsGettingCode(true)
        try {
            const response = await axios.post('/lz/code', { phone })
            if (response.data.success) {
                setServerCode(response.data.code)
                Toast.show({
                    content: response.data.message || '验证码已发送',
                    position: 'top',
                })
                startCountdown() // 开始倒计时
            } else {
                Toast.show({
                    content: response.data.message || '获取验证码失败',
                    position: 'top',
                })
            }
        } catch (error) {
            Toast.show({
                content: '获取验证码失败，请稍后重试',
                position: 'top',
            })
        } finally {
            setIsGettingCode(false)
        }
    }

    // 处理下一步
    const handleNext = () => {
        if (code !== serverCode) {
            Toast.show({
                content: '验证码错误',
                position: 'top',
            })
            return
        }
        navigate('/reset',{
            state:{
                phone:phone
            }
        })
    }

    return (
        <div>
            <NavBar back="返回" onBack={() => navigate('/login')} className={styles.nav}>
                忘记密码
            </NavBar>
            <div className={styles.forget}>
                <div className={styles.forget_title}>
                    校园通
                </div>
                <div className={styles.forget_input}>
                    <Input 
                        placeholder='请输入手机号' 
                        className={styles.forget_input_item}
                        value={phone}
                        onChange={setPhone}
                    />
                    <div style={{ position: 'relative' }}>
                        <Input
                            placeholder='请输入验证码'
                            className={styles.forget_input_item}
                            value={code}
                            onChange={setCode}
                        />
                        <Button
                            className={styles.forget_input_btn}
                            style={{
                                position: 'absolute',
                                right: '8px',
                                top: '50%',
                                transform: 'translateY(-50%)'
                            }}
                            disabled={!validatePhone(phone) || countdown > 0 || isGettingCode}
                            onClick={handleGetCode}
                            loading={isGettingCode}
                        >
                            {countdown > 0 ? `${countdown}s` : '获取验证码'}
                        </Button>
                    </div>
                    <Button 
                        className={styles.forget_btn} 
                        color='primary' 
                        fill='solid' 
                        onClick={handleNext}
                        disabled={!phone || !code}
                    >
                        下一步
                    </Button>
                </div>
            </div>
        </div>
    )
}