import React, { useEffect, useState } from 'react'
import Navbar from '../component/Navbar'
import { useNavigate } from "react-router-dom";
import axios from 'axios'
import styles from './Jifen.module.css'
import { SearchBar, Popup, Button, List } from 'antd-mobile'
import 'antd-mobile/es/global'; // 确保全局样式导入

export default function JifenShop() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userJifen, setUserJifen] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [sortType, setSortType] = useState('default');
  const [showSortPopup, setShowSortPopup] = useState(false); // 控制排序弹窗的显示
  const [showBackToTop, setShowBackToTop] = useState(false); // 控制回到顶部按钮的显示
  const navigator = useNavigate();

  // 排序选项
  const sortOptions = [
    { label: '默认排序', value: 'default' },
    { label: '积分从低到高', value: 'priceAsc' },
    { label: '积分从高到低', value: 'priceDesc' },
    { label: '兑换次数从多到少', value: 'numDesc' }
  ];

  // 获取商品列表和用户积分
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userid = localStorage.getItem('user');
        if (!userid) {
          setError('请先登录');
          return;
        }

        // 获取用户积分
        const jifenRes = await axios.get('http://localhost:3000/ss/jifen/total', {
          params: { userid },
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (jifenRes.data.code === 200) {
          setUserJifen(jifenRes.data.total || 0);
        }

        // 获取商品列表
        const shopRes = await axios.get('http://localhost:3000/ss', {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (shopRes.data.code === 200) {
          const fetchedData = shopRes.data.data;
          setData(fetchedData);
          // 首次加载时应用默认排序和搜索（如果searchvalue不为空）
          filterAndSortData(searchValue, sortType, fetchedData);
        } else {
          setError(shopRes.data.msg || '获取商品列表失败');
        }
      } catch (err) {
        console.error('获取数据失败:', err);
        setError('获取数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 监听滚动事件，控制回到顶部按钮的显示
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) { // 滚动超过200px显示按钮
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 回到顶部功能
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 处理搜索
  const handleSearch = (value) => {
    setSearchValue(value);
    filterAndSortData(value, sortType, data);
  };

  // 处理排序
  const handleSort = (value) => {
    setSortType(value);
    setShowSortPopup(false); // 选中后关闭弹窗
    filterAndSortData(searchValue, value, data);
  };

  // 过滤和排序数据
  const filterAndSortData = (searchText, sort, sourceData) => {
    let result = [...sourceData];

    // 搜索过滤
    if (searchText) {
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    // 排序
    switch (sort) {
      case 'priceAsc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'numDesc':
        result.sort((a, b) => (b.num || 0) - (a.num || 0));
        break;
      default:
        // 默认排序，按兑换次数从多到少
        result.sort((a, b) => (b.num || 0) - (a.num || 0));
        break;
    }
    
    setFilteredData(result);
  };

  // 处理商品点击
  const handleItemClick = (item) => {
    if (userJifen < item.price) {
      alert('积分不足，无法兑换');
      return;
    }
    navigator(`/shopming?_id=${item._id}`);
  };

  // 加载状态
  if (loading) {
    return (
      <div className={styles.jifenPage}>
        <div className={styles.stickyHeader}>
          <div className={styles.navbar}><Navbar title="积分商城"/></div>
          <div className={styles.searchSortContainer}>
            <SearchBar placeholder='搜索商品' value={searchValue} onChange={handleSearch} style={{ '--border-radius': '100px', '--background': '#f5f5f5', '--height': '36px', '--padding-left': '12px' }} />
            <Button className={styles.sortButton} onClick={() => setShowSortPopup(true)}>排序<span className={styles.sortIcon}>▲</span></Button>
          </div>
        </div>
        <div className={styles.loading}>加载中...</div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className={styles.jifenPage}>
        <div className={styles.stickyHeader}>
          <div className={styles.navbar}><Navbar title="积分商城"/></div>
          <div className={styles.searchSortContainer}>
            <SearchBar placeholder='搜索商品' value={searchValue} onChange={handleSearch} style={{ '--border-radius': '100px', '--background': '#f5f5f5', '--height': '36px', '--padding-left': '12px' }} />
            <Button className={styles.sortButton} onClick={() => setShowSortPopup(true)}>排序<span className={styles.sortIcon}>▲</span></Button>
          </div>
        </div>
        <div className={styles.errorMessage}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.jifenPage}>
      {/* 吸顶容器：包含导航栏、搜索和排序 */}
      <div className={styles.stickyHeader}>
        <div className={styles.navbar}>
          <Navbar title="积分商城"/>
        </div>
        
        {/* 搜索和排序区域 */}
        <div className={styles.searchSortContainer}>
          <SearchBar
            placeholder='搜索商品'
            value={searchValue}
            onChange={handleSearch}
            style={{
              '--border-radius': '100px',
              '--background': '#f5f5f5',
              '--height': '36px',
              '--padding-left': '12px',
            }}
          />
          <Button
            className={styles.sortButton}
            onClick={() => setShowSortPopup(true)}
          >
            排序
            <span className={styles.sortIcon}>▲</span>
          </Button>
        </div>
      </div>
      
      {/* 排序 Popup */}
      <Popup
        visible={showSortPopup}
        onMaskClick={() => setShowSortPopup(false)}
        position='bottom'
        bodyStyle={{ borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}
      >
        <div className={styles.sortPopupContent}>
          <div className={styles.sortPopupTitle}>选择排序方式</div>
          <List>
            {sortOptions.map(option => (
              <List.Item 
                key={option.value} 
                onClick={() => handleSort(option.value)}
                className={sortType === option.value ? styles.sortItemActive : ''}
              >
                {option.label}
              </List.Item>
            ))}
          </List>
          <Button 
            block 
            onClick={() => setShowSortPopup(false)}
            className={styles.sortPopupCloseBtn}
          >
            取消
          </Button>
        </div>
      </Popup>

      {/* 商品列表 */}
      <div className={styles.shopList}>
        {filteredData.length === 0 ? (
          <div className={styles.empty}>暂无商品</div>
        ) : (
          filteredData.map(item => (
            <div 
              key={item._id} 
              className={styles.shopItem}
              onClick={() => handleItemClick(item)}
            >
              <div className={styles.shopItemImage}>
                <img src={item.img} alt={item.name} />
              </div>
              <div className={styles.shopItemInfo}>
                <div className={styles.shopItemName}>{item.name}</div>
                <div className={styles.shopItemPrice}>
                  <span className={styles.priceValue}>{item.price}</span>
                  <span className={styles.priceUnit}>积分</span>
                </div>
                {item.num !== undefined && (
                  <div className={styles.shopItemStock}>
                    已兑换: {item.num}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 回到顶部按钮 */}
      {showBackToTop && (
        <div className={styles.backToTop} onClick={scrollToTop}>
          <span className={styles.backToTopIcon}>▲</span>
        </div>
      )}
    </div>
  )
}
