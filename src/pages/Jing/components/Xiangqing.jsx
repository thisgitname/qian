import React,{ useState, useEffect, useRef  } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { NavBar, Space, Toast } from 'antd-mobile'

export default function Xiangqing() {
    const navgiate = useNavigate()
    const location = useLocation()
    const id = location.search.slice(4)
    const navgaite = useNavigate()
    const [list,setList] = useState([])
    const [htmlContent,setHtmlContent] = useState(null)
    const divRef = useRef(null)
    
    function getDate(){
        axios.get(`http://localhost:3000/gk/wenzhang/?id=${id}`).then(res=>{
            setList(res.data.find)
            if (res.data && Array.isArray(res.data.find) && res.data.find.length > 0) {
                setHtmlContent(res.data.find[0].desc)
                console.log(res.data.find[0].desc)
            } else {
                setHtmlContent('')
                console.log('')
            }
        })
    }

    useEffect(()=>{
        getDate()
    },[])

    // 监听 htmlContent 变化，设置 innerHTML
    useEffect(() => {
        if (htmlContent && divRef.current) {
            divRef.current.innerHTML = htmlContent
        }
    }, [htmlContent])


    const back = () =>
    Toast.show({
      content: '点击了返回区域',
      duration: 1000,
    }, navgiate('/jing/wz'))

    return (
        <>
            <NavBar back='返回' onBack={back}>
                标签
            </NavBar>
            <div>
                {
                    list.map(item => {
                        return <div key={item._id}>
                            <h1>{item.title}</h1>
                            <div ref={divRef}></div>
                        </div>
                    })
                }
            </div>
        </>
    )
}
