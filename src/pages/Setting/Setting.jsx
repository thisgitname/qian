import React,{useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { ActionSheet, Cell } from 'react-vant'
import Navbar from "../component/Navbar";
import style from './Setting.module.css'
export default function Setting() {
    const navigate =useNavigate()
    const [visible, setVisible] = useState(false)
    const onCancel = () => setVisible(false)
    const tuichu=()=>{
      localStorage.clear('user')
      localStorage.clear('userInfo')
      localStorage.clear('token')
      localStorage.clear('userid')
      navigate('/login')
    }
    const handleLogoutClick = () => {
      if (window.confirm('确定要退出登录吗？')) {
        tuichu();
      }
    }
  return (
    <div>
      <div>
        {/* 导航栏 */}
        <Navbar title="设置"></Navbar>
      
      </div>
      {/* 内容 */}
        <div>
            {/* 点击即可跳转 */}
            {/* 进入新页面后点击可退回 使用-1 */}
            <Cell title='关于我们'   isLink onClick={()=>{navigate('/aboutus')}}/>
            <Cell title='条框和协议' isLink onClick={()=>{navigate('/clause')}}/>
        </div>
      {/* 按钮 */}
        <div>
        <button className={style.tuibutton} onClick={handleLogoutClick}>退出登录</button>
        </div>
    </div>
  )
}
