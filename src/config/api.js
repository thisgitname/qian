// API配置文件
const isDev = import.meta.env.DEV;

// 开发环境使用本地服务器，生产环境使用环境变量或默认地址
export const API_BASE_URL = isDev 
  ? 'http://localhost:3000' 
  : (import.meta.env.VITE_API_BASE_URL || 'http://your-production-server.com'); // 支持Vercel环境变量

// 常用API端点
export const API_ENDPOINTS = {
  // 积分相关
  JIFEN_TOTAL: '/ss/jifen/total',
  JIFEN_CHANGE: '/ss/jifen/change',
  JIFEN_MINGXI: '/ss/jifenmingxi',
  
  // 签到相关
  SIGNIN: '/ss/signin',
  SIGNIN_RECORD: '/ss/signin',
  
  // 积分商城
  SHOP_LIST: '/ss',
  SHOP_DETAIL: '/ss',
  ORDER_CREATE: '/ss/order/create',
  
  // 用户相关
  USER_LOGIN: '/lz',
  USER_INFO: '/lz',
  
  // 圈子相关
  QUANZI_LIST: '/gk/dateQuanzi',
  QUANZI_DETAIL: '/gk/dateQuanzi',
  QUANZI_COMMENTS: '/gk/comments',
  QUANZI_ADD_COMMENT: '/gk/addComment',
  QUANZI_LIKE: '/gk/xihuanGuangcheng',
  QUANZI_FOLLOW: '/gk/guanzhu',
  QUANZI_DELETE: '/gk/deleteDateQuanzi',
  QUANZI_PUBLISH: '/gk/fb',
  QUANZI_UPLOAD: '/gk/upload',
  
  // 文章相关
  ARTICLE_LIST: '/gk/wenzhang',
  ARTICLE_DETAIL: '/gk/wenzhang',
  GONGKAIKE_LIST: '/gk/gongkais',
  GONGKAIKE_DETAIL: '/gk/gongkais',
  
  // 地址相关
  ADDRESS_LIST: '/wsj/list',
  ADDRESS_ADD: '/wsj/add',
  ADDRESS_SET_DEFAULT: '/wsj/setDefault',
  
  // 聊天相关
  CHAT_SOCKET: isDev ? 'http://localhost:3000' : (import.meta.env.VITE_API_BASE_URL || 'http://your-production-server.com'),
};

// 创建完整的API URL
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// 默认axios配置
export const axiosConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
}; 