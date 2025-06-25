/**
 * 格式化时间显示
 * @param {number} seconds - 秒数
 * @returns {string} 格式化后的时间字符串 (MM:SS)
 */
export const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00'
    
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * 格式化时间显示（包含小时）
 * @param {number} seconds - 秒数
 * @returns {string} 格式化后的时间字符串 (HH:MM:SS)
 */
export const formatTimeWithHours = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00:00'
    
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export const debounce = (func, wait) => {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 限制时间（毫秒）
 * @returns {Function} 节流后的函数
 */
export const throttle = (func, limit) => {
    let inThrottle
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args)
            inThrottle = true
            setTimeout(() => inThrottle = false, limit)
        }
    }
}

/**
 * 获取视频文件大小
 * @param {string} url - 视频URL
 * @returns {Promise<number>} 文件大小（字节）
 */
export const getVideoFileSize = async (url) => {
    try {
        const response = await fetch(url, { method: 'HEAD' })
        return response.headers.get('content-length')
    } catch (error) {
        console.error('获取视频文件大小失败:', error)
        return null
    }
}

/**
 * 检查视频格式是否支持
 * @param {string} url - 视频URL
 * @returns {boolean} 是否支持
 */
export const isVideoFormatSupported = (url) => {
    const supportedFormats = ['.mp4', '.webm', '.ogg', '.mov', '.avi']
    const extension = url.toLowerCase().split('.').pop()
    return supportedFormats.includes(`.${extension}`)
}

/**
 * 获取视频缩略图
 * @param {HTMLVideoElement} videoElement - 视频元素
 * @param {number} time - 时间点（秒）
 * @returns {string} 缩略图数据URL
 */
export const getVideoThumbnail = (videoElement, time = 0) => {
    return new Promise((resolve, reject) => {
        try {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            
            canvas.width = videoElement.videoWidth
            canvas.height = videoElement.videoHeight
            
            videoElement.currentTime = time
            
            videoElement.addEventListener('seeked', () => {
                ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)
                resolve(canvas.toDataURL())
            }, { once: true })
            
            videoElement.addEventListener('error', reject, { once: true })
        } catch (error) {
            reject(error)
        }
    })
}

/**
 * 计算视频播放进度百分比
 * @param {number} currentTime - 当前时间
 * @param {number} duration - 总时长
 * @returns {number} 进度百分比 (0-100)
 */
export const calculateProgress = (currentTime, duration) => {
    if (!duration || duration === 0) return 0
    return Math.round((currentTime / duration) * 100)
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的文件大小
 */
export const formatFileSize = (bytes) => {
    if (!bytes) return '0 B'
    
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
} 