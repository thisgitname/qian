import React, { useRef, useState } from 'react'
import { NavBar, Space, Toast } from 'antd-mobile'
import { MoreOutline, SearchOutline } from 'antd-mobile-icons'
import styles from './stylemodules/Fbmodule.module.css'
import axios from 'axios'
import { Uploader,Cell, Dialog } from 'react-vant';
import { useNavigate } from 'react-router-dom'



const defaultValue = [
  {
    url: 'https://img.yzcdn.cn/vant/sand.png', // 图片文件
  },
  {
    url: 'https://img.yzcdn.cn/vant/sand.text', // 其他文件
  },
]


export default function Fbmodule() {
  const navigate = useNavigate()
  const fileInput = useRef(null)

  const right = (
    <div style={{ fontSize: 24 }}>
      <Space style={{ '--gap': '16px' }}>
        <SearchOutline />
        <MoreOutline />
      </Space>
    </div>
  )

  const back = () =>
    Toast.show(navigate('/quan/wd'),{
      content: '点击了返回区域',
      duration: 1000,
    })
  
  const [list,setList] = useState(JSON.parse(localStorage.getItem('token')) || [])
  const [files,setFiles] = useState([])
  const [fileDate,setFileDate] = useState([])
  const uploadButton = (v) => {
    console.log(v)
    try{
      const form = new FormData()
      form.append('files',v[0].file)
      axios.post('http://localhost:3000/gk/upload',form).then(res => {
        const file = files
        file.push({index:files.length,img:res.data})
        setFiles([...file])
      })
    }catch(error){
      return
    }
  }
  const deleteButton = (v) => {
    files.splice(v.key,1)
  }

  const [desc,setDesc] = useState('')
  const addButton = () => {
    if(desc.length === 0){
      return alert('发布内容不能为空')
    }
    const params = {}
    if(desc.length > 0){
      params.content = desc
    }
    if(list._id.length > 0){
      params.userid = list._id
    }
    if(files.length > 0){
      params.img = files
    }
    axios.post('http://localhost:3000/gk/fb',params)
  }
  return (
    <div>
      <NavBar onBack={back}>发布动态</NavBar>
      <div className={styles.container}>
        <div className={styles.title}>发布内容</div>
        <textarea
          value={desc}
          onChange={e => setDesc(e.target.value)}
          className={styles.textarea}
          placeholder="分享学习心得..."
        />
        <div style={{height:"100%"}}>
          <Uploader
              accept='*'
              onChange={v => uploadButton(v)}
              onDelete={v => deleteButton(v)}
          />
        </div>
        <button className={styles.submitBtn} onClick={()=>{ addButton() }}>发布</button>
      </div>
    </div>
  )
}
