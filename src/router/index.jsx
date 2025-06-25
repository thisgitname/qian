import { Navigate, createBrowserRouter } from "react-router-dom";
import App from "../App.jsx";
import Study from "../pages/Study/Study.jsx";

// 圈子
import Quan from "../pages/Quan/QuanziModule.jsx";
import Guangchang from "../pages/Quan/GuangchangQuanzi.jsx";
import Dongtai from "../pages/Quan/DongtaiQuanzi.jsx";
import Wode from "../pages/Quan/WdQuanzi.jsx";
import Login from "../pages/Login/Login.jsx";
import Jing from "../pages/Jing/JxuanModule.jsx";
import Mine from "../pages/Mine/Mine.jsx";
import AI from "../pages/AI/AI.jsx";
import Dindan from "../pages/wddd/dindan.jsx";

import Forget from "../pages/Login/Forget.jsx";
import Reset from "../pages/Login/Reset.jsx";

import Fb from "../pages/Quan/Fbmodule.jsx";
import Xqing from "../pages/Quan/Xqing.jsx";
import Myclass from '../pages/Mine/pages/MyClass.jsx'
import Feedback from '../pages/Mine/pages/Feedback.jsx'
import Tell from '../pages/Mine/pages/Tell.jsx'
import Chat from '../pages/Mine/pages/Chat.jsx'
import Res from "../pages/Mine/pages/Res.jsx"
import Studyji from "../pages/Mine/pages/Studyji.jsx"
import Kaoji from "../pages/Mine/pages/Kaoji.jsx"
import Kaodetail from "../pages/Mine/pages/Kaodetail.jsx"

import WzhangModule from "../pages/Jing/components/WzhangModule.jsx"
import Gongkaike from "../pages/Jing/components/Gongkaike"
import Xiangqing from "../pages/Jing/components/Xiangqing"
import JingxuanXq from "../pages/Jing/components/JingxuanXq.jsx"
//个人资料
import Profile from '../pages/Mine/Profile.jsx'

//个人地址
import Address from '../pages/Mine/Address.jsx'
// 设置以及积分商城
import Setting from "../pages/Setting/Setting.jsx"; //设置
import AboutUs from "../pages/Setting/AboutUs.jsx"; //关于我们
import Clause from "../pages/Setting/Clause.jsx"; //条款隐私
import MyJifen from "../pages/ji/MyJifen.jsx";  //我的积分
import JifenShop from "../pages/ji/JifenShop.jsx";  //积分商城
import JifenDui from "../pages/ji/JifenDui.jsx";  //积分兑换成功
import JifenMing from "../pages/ji/JifenMing.jsx";  //积分明细
import JifenLi from "../pages/ji/JifenLi.jsx";     // 积分日历
import ShopMing from "../pages/ji/ShopMing.jsx";   //商品明细
import ShopTi from "../pages/ji/ShopTi.jsx";   //商品兑换
import Course from "../pages/Study/Course.jsx";
import Detail from "../pages/Study/Detail.jsx";
import Test from "../pages/Study/Test.jsx"
import Wrong from "../pages/Study/Wrongs.jsx"
import Collect from "../pages/Study/Collection.jsx"
import Materials from "../pages/Study/Materials.jsx"
import Practice from "../pages/Study/Practice.jsx"
import Result from "../pages/Study/Result.jsx"
import Exam from "../pages/Study/Exam.jsx"
import Agreement from "../pages/Agreement/Agreement.jsx"
import Source from "../pages/Study/Source.jsx"




const AuthGuard = ({ children }) => {
  const isLogin = JSON.parse(localStorage.getItem("token")) || null;
  if (!isLogin) {
    return <Navigate to="/login" />
  }
  return children
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthGuard><App /></AuthGuard>,
    children: [
      { path: "/", element: <Navigate to="/study" /> },
      { path: "study", element: <AuthGuard><Study /></AuthGuard>, },
      {
        path: "quan", element: <AuthGuard><Quan /></AuthGuard>, children: [
          { path: "/quan", element: <Navigate to="gc"></Navigate> },
          { path: "gc", element: <Guangchang />, },
          { path: "dt", element: <Dongtai />, },
          { path: "wd", element: <Wode />, },
        ]
      },
      {
        path: "/jing", element: <Jing></Jing>, children: [
          { path: "/jing", element: <Navigate to={'/jing/gk'}></Navigate> },
          { path: "wz", element: <WzhangModule></WzhangModule>, children: [] },
          { path: "gk", element: <Gongkaike></Gongkaike> }
        ]
      },
      { path: "mine", element: <Mine />, },
    ],
  },
  { path: "/login", element: <Login />, },
  {path: "/ai",element: <AI />,}, 
  {path: "/dingdan", element: <Dindan />,},
  { path: "/forget", element: <Forget />, },
  { path: "/reset", element: <Reset />, },
  { path: "/fb", element: <Fb /> },
  { path: "/xq", element: <Xqing /> },
  { path: "/myClass", element: <Myclass />, },
  { path: "/feedback", element: <Feedback />, },
  { path: "/address", element: <Address />, },
  { path: "/profile", element: <Profile />, },
  { path: "/tell", element: <Tell />, },
  { path: "/chat", element: <Chat />, },
  {path: "/res",element: <AuthGuard><Res /></AuthGuard>,},
  {path: "/studyji",element: <AuthGuard><Studyji /></AuthGuard>,},
  {path: "/kaoji",element: <AuthGuard><Kaoji /></AuthGuard>,},
  {path: "/detail",element: <AuthGuard><Detail /></AuthGuard>,},
  {path: "/kaodetail",element: <AuthGuard><Kaodetail /></AuthGuard>,},
  { path: "/xqing", element: <Xiangqing></Xiangqing> },
  { path: "/JingxuanXq", element: <JingxuanXq></JingxuanXq> },
  {path: '/setting',element: <Setting />},
  {path: "/aboutus",element: <AboutUs />},
  {path: "/clause",element: <Clause />},
  {path: "/myjifen",element: <MyJifen />},
  {path: "/jifenshop",element: <JifenShop />},
  {path: "/jifendui",element: <JifenDui />},
  {path: "/jifenming",element: <JifenMing />},
  {path: "/jifenli",element: <JifenLi />},
  {path: "/shopming", element: <ShopMing />},
  {path: "/shopti",element: <ShopTi />},
  {path: "/course",element: <AuthGuard><Course /></AuthGuard>,},
  {path: "/detail",element: <AuthGuard><Detail /></AuthGuard>,},
  {path: "/test",element: <AuthGuard><Test /></AuthGuard>},
  {path: "/wrong",element: <AuthGuard><Wrong /></AuthGuard>,},
  {path: "/collect",element: <AuthGuard><Collect /></AuthGuard>,},
  {path: "/materials",element: <AuthGuard><Materials /></AuthGuard>,},
  {path: "/practice",element: <AuthGuard><Practice /></AuthGuard>,},
  {path: "/result",element: <AuthGuard><Result /></AuthGuard>,},
  {path: "/exam",element: <AuthGuard><Exam /></AuthGuard>,},
  {path: "/agreement",element: <Agreement />,},
  {path: "/source",element: <AuthGuard><Source /></AuthGuard>,},
]);

export default router;
