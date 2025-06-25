import styles from '../Jing/stylemodules/JxuanModule.module.css';
import React, { useState } from 'react'
import { Tabs } from 'antd-mobile'
import { Outlet } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';

export default function JxuanModule() {
  const navigate = useNavigate()

  const [nvg,setNvg] = useState(null)
  const Button = (v) => {
    setNvg(v)
    if( v === 'gk'){
      navigate('gk')
    }
    if( v === 'wz'){
      navigate('wz')
    }
  }
  return (
    <div style={{width:'100%',height:"100%"}}>
      {/* 顶部导航栏 */}
      <div className={styles.nav}>
            <Tabs
            style={{'--active-line-color': '#127DFA','--active-title-color': 'black','--title-font-size': '15px'}} 
            onChange={(v)=>{ Button(v) }}>
                <Tabs.Tab title='公开课' key='gk'>
                </Tabs.Tab>
                <Tabs.Tab title='学习文章' key='wz'>
                </Tabs.Tab>
            </Tabs>
      </div>
      <Outlet></Outlet>
    </div>
  )
}
