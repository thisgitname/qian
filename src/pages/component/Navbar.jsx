import React from 'react'
import { useNavigate } from "react-router-dom";
import { Toast, NavBar } from "react-vant";
import { Sticky, Button } from "react-vant";
export default function Navbar(props) {
  const navigate = useNavigate();
  return (
    <div>
        {/* 封装的Navbar组件 */}
        {/* 导航栏,具有吸顶效果 */}
        <Sticky>
        <NavBar
            title={props.title}
            leftText="返回"
            rightText="···"
            onClickLeft={() => navigate(-1)}
            onClickRight={() => Toast("没有更多了")}
        />
        </Sticky>
    </div>
  )
}
