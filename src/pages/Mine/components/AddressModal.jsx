import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './AddressModal.module.css';
import { message } from 'antd';
import debounce from 'lodash/debounce';

const AddressModal = ({ visible, onClose, onSave, initialData }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  const searchInputRef = useRef(null);
  const placeSearchRef = useRef(null);
  const inputWrapperRef = useRef(null);
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    area: '',
    address: '',
    name: '',
    phone: '',
    tag: '家',
    latitude: '',
    longitude: ''
  });

  const [errors, setErrors] = useState({
    phone: ''
  });

  const tags = ['家', '公司', '学校', '父母', '朋友'];

  // 重置所有状态的函数
  const resetAllStates = () => {
    if (initialData) {
      // 如果是编辑模式，使用初始数据
      const { area, address, name, phone, tag, latitude, longitude } = initialData;
      setFormData({
        area: area || '',
        address: address || '',
        name: name || '',
        phone: phone || '',
        tag: tag || '家',
        latitude: latitude || '',
        longitude: longitude || ''
      });
      // 如果有坐标，设置地图位置
      if (latitude && longitude) {
        setSelectedLocation({
          lng: longitude,
          lat: latitude
        });
        // 如果有地图实例，设置地图中心点和标记
        if (map && marker) {
          map.setCenter([longitude, latitude]);
          marker.setPosition([longitude, latitude]);
        }
      }
    } else {
      // 如果是新增模式，重置所有数据
      setFormData({
        area: '',
        address: '',
        name: '',
        phone: '',
        tag: '家',
        latitude: '',
        longitude: ''
      });
      setSelectedLocation(null);
    }
    setSearchKeyword('');
    setSearchResults([]);
    setDebugInfo('');
  };

  // 监听visible和initialData变化，当模态框显示时重置状态
  useEffect(() => {
    if (visible) {
      resetAllStates();
    }
  }, [visible, initialData]);

  // 初始化地图和插件
  useEffect(() => {
    if (!visible || !window.AMap) return;
    
    const initMap = async () => {
      try {
        // 加载插件
        await new Promise((resolve, reject) => {
          window.AMap.plugin(['AMap.PlaceSearch', 'AMap.Geocoder'], () => {
            resolve();
          });
        });

        const newMap = new window.AMap.Map(mapRef.current, {
          zoom: 15, // 增大缩放级别
          center: [116.397428, 39.90923],
          viewMode: '2D',
          resizeEnable: true
        });

        const newMarker = new window.AMap.Marker({
          position: [116.397428, 39.90923],
          draggable: true,
          cursor: 'move',
          map: newMap
        });

        // 初始化 PlaceSearch
        placeSearchRef.current = new window.AMap.PlaceSearch({
          city: '全国',
          citylimit: false,
          autoFitView: true
        });

        newMarker.on('dragend', () => {
          const position = newMarker.getPosition();
          handleLocationSelect({
            lng: position.getLng(),
            lat: position.getLat()
          });
        });

        newMap.on('click', (e) => {
          const { lng, lat } = e.lnglat;
          newMarker.setPosition([lng, lat]);
          handleLocationSelect({ lng, lat });
        });

        setMap(newMap);
        setMarker(newMarker);
        setMapLoading(false);

        // 尝试获取当前位置
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { longitude, latitude } = position.coords;
              newMap.setCenter([longitude, latitude]);
              newMap.setZoom(15); // 确保缩放级别
              newMarker.setPosition([longitude, latitude]);
              handleLocationSelect({ lng: longitude, lat: latitude });
            },
            (error) => {
              console.error('定位失败:', error);
              setDebugInfo('定位失败，请手动选择位置');
            },
            {
              timeout: 10000,
              maximumAge: 0,
              enableHighAccuracy: true
            }
          );
        }
      } catch (error) {
        console.error('地图初始化失败:', error);
        setDebugInfo('地图加载失败，请刷新重试');
        setMapLoading(false);
      }
    };

    initMap();

    return () => {
      if (map) {
        map.destroy();
      }
    };
  }, [visible]);

  // 新增：监听initialData和地图实例，自动定位到经纬度
  useEffect(() => {
    if (
      visible &&
      initialData &&
      initialData.latitude &&
      initialData.longitude &&
      map && marker
    ) {
      const lng = Number(initialData.longitude);
      const lat = Number(initialData.latitude);
      map.setCenter([lng, lat]);
      marker.setPosition([lng, lat]);
    }
  }, [visible, initialData, map, marker]);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    if (window.AMap) {
      const geocoder = new window.AMap.Geocoder();
      geocoder.getAddress([location.lng, location.lat], (status, result) => {
        if (status === 'complete' && result.regeocode) {
          const address = result.regeocode;
          console.log('地址信息:', address); // 添加日志
          setFormData(prev => ({
            ...prev,
            area: address.addressComponent.district || '',
            address: address.formattedAddress || '',
            latitude: location.lat,
            longitude: location.lng
          }));
          // 设置输入框的值
          const detailInput = document.querySelector('input[placeholder="请输入详细地址"]');
          if (detailInput) {
            detailInput.value = address.formattedAddress || '';
          }
        } else {
          console.error('地址解析失败:', status);
          setDebugInfo('地址解析失败，请重试');
        }
      });
    }
  };

  // 实时搜索（防抖）
  const handleSearchDebounced = useCallback(
    debounce((keyword) => {
      if (!keyword.trim() || !placeSearchRef.current) return;
      placeSearchRef.current.search(keyword, (status, result) => {
        if (status === 'complete' && result.poiList) {
          setSearchResults(result.poiList.pois.map(poi => ({
            name: poi.name,
            address: poi.address,
            location: {
              lng: poi.location.lng,
              lat: poi.location.lat
            }
          })));
        } else {
          setSearchResults([]);
          setDebugInfo('未找到相关地址');
        }
      });
    }, 500),
    []
  );

  const handleSearch = () => {
    if (!searchKeyword.trim() || !placeSearchRef.current) return;

    placeSearchRef.current.search(searchKeyword, (status, result) => {
      if (status === 'complete' && result.poiList) {
        setSearchResults(result.poiList.pois.map(poi => ({
          name: poi.name,
          address: poi.address,
          location: {
            lng: poi.location.lng,
            lat: poi.location.lat
          }
        })));
      } else {
        setSearchResults([]);
        setDebugInfo('未找到相关地址');
      }
    });
  };

  const handleSearchResultClick = (result) => {
    if (!map || !marker) return;
    
    map.setCenter([result.location.lng, result.location.lat]);
    marker.setPosition([result.location.lng, result.location.lat]);
    handleLocationSelect(result.location);
    setSearchResults([]);
    setSearchKeyword('');
  };

  // 手机号验证规则
  const validatePhone = (phone) => {
    // 移除所有空格
    phone = phone.replace(/\s/g, '');
    
    // 严格的手机号验证规则
    const phoneRegex = /^1[3456789]\d{9}$/;
    
    if (!phone) {
      return '请输入手机号码';
    }
    
    if (!phoneRegex.test(phone)) {
      return '请输入正确的11位手机号码,第二位不能是1或2';
    }
    
    return '';
  };

  // 处理手机号输入
  const handlePhoneChange = (e) => {
    const phone = e.target.value;
    // 只允许输入数字和空格
    const filteredPhone = phone.replace(/[^\d\s]/g, '');
    
    setFormData(prev => ({
      ...prev,
      phone: filteredPhone
    }));

    // 实时验证
    const error = validatePhone(filteredPhone);
    setErrors(prev => ({
      ...prev,
      phone: error
    }));
  };

  // 校验规则
  const validateField = (field, value) => {
    switch (field) {
      case 'address':
        if (!value || value.trim() === '') return '请输入详细地址';
        return '';
      case 'name':
        if (!value || value.trim() === '') return '请输入联系人姓名';
        return '';
      case 'phone':
        if (!value || value.trim() === '') return '请输入手机号码';
        if (!/^1[3-9]\d{9}$/.test(value.replace(/\s/g, ''))) return '请输入正确的11位手机号码';
        return '';
      default:
        return '';
    }
  };

  // 失焦时校验
  const handleBlur = (field) => (e) => {
    const value = e.target.value;
    setErrors(prev => ({
      ...prev,
      [field]: validateField(field, value)
    }));
  };

  // 处理表单提交
  const handleSubmit = async () => {
    // 校验所有字段
    const newErrors = {
      address: validateField('address', formData.address),
      name: validateField('name', formData.name),
      phone: validateField('phone', formData.phone)
    };
    setErrors(newErrors);
    // 如果有错误，阻止提交
    if (Object.values(newErrors).some(msg => msg)) {
      message.error('请完善表单信息');
      return;
    }
    // 提交表单
    try {
      await onSave({
        ...formData,
        phone: formData.phone.replace(/\s/g, ''),
        id: initialData?.id // 关键：编辑时带上id
      });
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败，请重试');
    }
  };

  // 监听地址输入变化，自动搜索位置
  const handleAddressChange = async (e) => {
    const newAddress = e.target.value;
    setFormData(prev => ({ ...prev, address: newAddress }));

    try {
      // 当地址长度超过5个字符时，尝试搜索位置
      if (newAddress.length > 5 && window.AMap) {
        const geocoder = new window.AMap.Geocoder();
        const result = await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('获取位置超时，请重试'));
          }, 5000);

          geocoder.getLocation(newAddress, (status, result) => {
            clearTimeout(timeout);
            if (status === 'complete' && result.geocodes.length) {
              resolve(result.geocodes[0].location);
            } else {
              reject(new Error('无法获取位置信息'));
            }
          });
        });

        setSelectedLocation({
          lng: result.lng,
          lat: result.lat
        });

        // 更新地图位置
        if (map && marker) {
          map.setCenter([result.lng, result.lat]);
          marker.setPosition([result.lng, result.lat]);
        }
      }
    } catch (error) {
      console.error('地址搜索失败:', error);
      // 这里不显示错误信息，因为是自动搜索
    }
  };

  // 监听全局点击，点击外部关闭下拉框
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        inputWrapperRef.current &&
        !inputWrapperRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setSearchResults([]);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>选择收货地址</span>
          <span className={styles.closeIcon} onClick={onClose}>×</span>
        </div>

        <div className={styles.mapWrapper}>
          <div className={styles.searchContainer}>
            <div className={styles.searchBox} ref={inputWrapperRef}>
              <input
                ref={searchInputRef}
                type="text"
                value={searchKeyword}
                onChange={e => {
                  setSearchKeyword(e.target.value);
                  handleSearchDebounced(e.target.value);
                }}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="搜索地址，如：学校、小区、写字楼"
                className={styles.searchInput}
              />
              <button
                className={styles.searchButton}
                onClick={handleSearch}
                disabled={!searchKeyword.trim()}
              >
                搜索
              </button>
            </div>
            {searchResults.length > 0 && (
              <div className={styles.searchResults} ref={dropdownRef}>
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className={styles.searchResultItem}
                    onClick={() => handleSearchResultClick(result)}
                  >
                    <div className={styles.resultName}>{result.name}</div>
                    <div className={styles.resultAddress}>{result.address}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div ref={mapRef} className={styles.map} />
          
          {mapLoading && (
            <div className={styles.mapLoading}>
              <div className={styles.loadingSpinner} />
              <span>地图加载中...</span>
            </div>
          )}
        </div>

        <div className={styles.form}>
          <div className={styles.formItem}>
            <span className={styles.label}>详细地址</span>
            <input
              type="text"
              value={formData.address}
              onChange={handleAddressChange}
              onBlur={handleBlur('address')}
              placeholder="请输入详细地址，如：1号楼1单元101室"
              className={`${styles.input} ${errors.address ? styles.inputError : ''}`}
            />
            {errors.address && (
              <div className={styles.errorMessage}>{errors.address}</div>
            )}
          </div>

          <div className={styles.formItem}>
            <span className={styles.label}>联系人</span>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              onBlur={handleBlur('name')}
              placeholder="请输入联系人姓名"
              className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
            />
            {errors.name && (
              <div className={styles.errorMessage}>{errors.name}</div>
            )}
          </div>

          <div className={styles.formItem}>
            <span className={styles.label}>手机号码</span>
            <div className={styles.phoneInputContainer}>
              <input
                type="tel"
                value={formData.phone}
                onChange={handlePhoneChange}
                onBlur={handleBlur('phone')}
                placeholder="请输入手机号码"
                className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                maxLength="13" // 11位数字加2个空格
              />
              {errors.phone && (
                <div className={styles.errorMessage}>{errors.phone}</div>
              )}
            </div>
          </div>

          <div className={styles.formItem}>
            <span className={styles.label}>标签</span>
            <div className={styles.tags}>
              {tags.map(tag => (
                <span
                  key={tag}
                  className={`${styles.tag} ${formData.tag === tag ? styles.activeTag : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, tag }))}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <button 
            className={styles.submitButton}
            onClick={handleSubmit}
          >
            保存地址
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressModal; 