import React, { useEffect, useState } from 'react'
import Navbar from '../component/Navbar'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function ShopMing() {
  const location = useLocation();
  const navigate = useNavigate(); // 获取导航函数
  
  // 使用 URLSearchParams 解析查询参数
  const searchParams = new URLSearchParams(location.search);
  const _id = searchParams.get('_id');
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!_id) {
      setError('未找到商品ID');
      setLoading(false);
      return;
    }
    
    axios.get(`http://localhost:3000/ss?_id=${_id}`)
      .then(res => {
        if (res.data && res.data.data && res.data.data.length > 0) {
          setItem(res.data.data[0]);
        } else {
          setError('未找到商品信息');
        }
      })
      .catch(err => {
        console.error('获取商品信息失败', err);
        setError('获取商品信息失败');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [_id]);

  // 处理加载状态
  if (loading) {
    return (
      <div>
        <Navbar title="商品详情" />
        <div className="loading">加载中...</div>
      </div>
    );
  }

  // 处理错误状态
  if (error) {
    return (
      <div>
        <Navbar title="商品详情" />
        <div className="error">{error}</div>
      </div>
    );
  }

  // 处理数据存在的情况
  if (item) {
    return (
      <div>
        <div>
          {/* 导航栏 */}
          <Navbar title="商品详情" />
        </div>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginTop:'16px'}}>
          <img src={item.img} alt={item.name} style={{width:'220px',height:'auto',borderRadius:'8px',marginBottom:'16px'}} />
        </div>
        <div style={{textAlign:'center',fontWeight:'bold',fontSize:'20px',marginBottom:'8px'}}>{item.name}</div>
        <div style={{textAlign:'center',color:'#f60',fontSize:'16px',marginBottom:'12px'}}>需要{item.price}积分</div>
        <div style={{padding:'0 20px',marginBottom:'20px'}}>
          <div style={{fontWeight:'bold',marginBottom:'6px'}}>商品介绍</div>
          <div style={{color:'#555'}}>{item.desc || '暂无商品介绍'}</div>
        </div>
        <div style={{padding:'0 20px',marginBottom:'20px'}}>
          <div style={{fontWeight:'bold',marginBottom:'6px'}}>商品规格</div>
          <div style={{color:'#555'}}>{item.guige || '暂无商品规格信息'}</div>
        </div>
        <div style={{display:'flex',justifyContent:'center',marginBottom:'20px'}}>
          {/* 使用 navigate 函数进行导航 */}
          <button style={{padding:'10px 32px',background:'#f60',color:'#fff',border:'none',borderRadius:'6px',fontSize:'16px',cursor:'pointer'}} 
                  onClick={() => navigate(`/shopti?id=${item._id}`)}>立即兑换</button>
        </div>
      </div>
    );
  }

  // 处理 item 不存在的情况
  return (
    <div>
      <Navbar title="商品详情" />
      <div className="empty">未找到商品信息</div>
    </div>
  );
}