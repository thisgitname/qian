import React, { useState, useEffect } from 'react'
import axios from 'axios'
import styles from './dingdan.module.css'
import { NavBar, Tabs, Button, Tag } from 'antd-mobile'
import { useNavigate } from 'react-router-dom'
export default function dindan() {
    const navigate = useNavigate()
    const [list, setlist] = useState([]) //订单列表数据
    const [key, setKey] = useState('0')
    const back = () => {
        navigate('/mine')
    } //导航返回函数

    //获取数据
    const getlist = async () => {
        let userid = localStorage.getItem('user') || '68482be86c9a728862ec43f7'
        const params = {
            key: key
        }
        if (userid) params.userid = userid

        try {
            let response = await axios.get(`http://127.0.0.1:3000/orders`, { params })
            setlist(response.data.data)
        } catch (error) {
            // 错误处理
        }
    }
    useEffect(() => {
        getlist()
    }, [key])

    // 获取订单状态显示文本和颜色
    const getStatusInfo = (status) => {
        switch (status) {
            case 0:
                return { text: '待处理', color: '#999999' };
            case 1:
                return { text: '待发货', color: '#FF9900' };
            case 2:
                return { text: '待收货', color: '#0066FF' };
            case 3:
                return { text: '待评价', color: '#00CC66' };
            default:
                return { text: '未知状态', color: '#999999' };
        }
    }

    // 样式定义
    const navStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: 'white',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    };

    const contentStyle = {
        width: '100%', 
        padding: '10px',
        marginTop: '90px' // 预留导航栏和Tabs的高度
    };

    return (
        <div className={styles.mainbox} >

            <div style={navStyle}>
                <NavBar onBack={back}>订单</NavBar>
                <Tabs onChange={(key) => {
                    setKey(key)
                }}>
                    <Tabs.Tab title='全部' key='0'>

                    </Tabs.Tab>
                    <Tabs.Tab title='待发货' key='1'>

                    </Tabs.Tab>
                    <Tabs.Tab title='待收货' key='2'>

                    </Tabs.Tab>
                    <Tabs.Tab title='待评价' key='3'>

                    </Tabs.Tab>
                </Tabs>
            </div>
            <div style={contentStyle}>
                {
                    list.length > 0 ? (
                        list.map((item, index) => {
                            const statusInfo = getStatusInfo(item.status);
                            return (
                                <div key={item._id} style={{ backgroundColor: 'white', marginBottom: '20px', borderRadius: '8px', overflow: 'hidden',padding:'10px 0px' }}>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', borderBottom: '1px solid #f2f2f2', width: '100%', height: '40px', alignItems: 'center', padding: '0 10px' }}>

                                        <b>订单号:{item._id}</b>
                                        <b style={{ color: statusInfo.color }}>{statusInfo.text}</b>
                                    </div>

                                    <div style={{ display: 'flex', borderBottom: '1px solid #f2f2f2', width: '100%', height: '120px', alignItems: 'center', justifyContent: 'space-between', padding: '15px' }}>

                                        <img src={item.userDate.img} alt="" style={{ width: '25%', height: '100px', borderRadius: '4px' }} />

                                        <div style={{ width: '60%', padding: '0 10px' }}>
                                            <h6 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{item.userDate.name}</h6>
                                            <div style={{ color: '#666', fontSize: '14px' }}>{item.shangjiadesc || '暂无备注'}</div>
                                        </div>
                                        <div style={{fontSize:'16px'}}>
                                            x {item.userDate.num}
                                        </div>

                                    </div>
                                    <div style={{ width: '100%', height: '80px', alignItems: 'center', fontSize: '16px', textAlign: 'right', padding: '16px' }}>
                                        <span>共一件商品，合计：{item.userDate.price || 50}积分</span>
                                        <p style={{marginTop:'10px'}}>
                                            <Button shape='rounded' size='small'>再次购买</Button>
                                            {item.status === 2 && <Button size='small' shape='rounded' color='primary' style={{ marginLeft: '8px' }}>确认收货</Button>}
                                            {item.status === 3 && <Button size='small' shape='rounded' color='primary' style={{ marginLeft: '8px' }}>立即评价</Button>}
                                        </p>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div style={{ textAlign: 'center', padding: '30px' }}>暂无订单数据</div>
                    )
                }
            </div>


        </div>
    )
}
