import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import styles from './stylemodules/QuanziModule.module.css'
import { useNavigate } from 'react-router-dom'
import { Tabs } from 'antd-mobile'

export default function QuanziModule() {
    const navigate = useNavigate()

    // 跳转子路由
    const [value,setValue] = useState(null)
    const navButton = (v) => {
        const value = v
        setValue(value)
        try{
            if(value == 'gc'){
                navigate('/quan/gc')
            }
            if(value == 'dt'){
                navigate('/quan/dt')
            }
            if(value == 'wd'){
                navigate('/quan/wd')
            }
        }catch(error){
            console.log('路由错误')
        }
    }
    const ssss = (index)=>{
        setClass_show(index)
    }
  return (
    <div className={styles.quanziBox}>
        <div className={styles.quanziBoxHome}>
            <Tabs 
                style={{ '--active-line-size':'black' }}
                onChange={(v)=>{ navButton(v) }}>
                    <Tabs.Tab title='广场' key='gc' />
                    <Tabs.Tab title='动态' key='dt' />
                    <Tabs.Tab title='我的' key='wd' />
            </Tabs>
            <div><span className={`${styles.iconfont} ${styles.iconBiji3}`}></span></div>
        </div>
        <div style={{padding:'0 14px'}}>
            <Outlet />
        </div>
    </div>
  )
}
