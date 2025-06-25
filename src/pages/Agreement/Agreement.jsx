import React from 'react';
import { NavBar, Tabs } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import styles from './Agreement.module.css';

export default function Agreement() {
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <NavBar onBack={() => navigate(-1)}>用户协议与隐私政策</NavBar>
            <div className={styles.content}>
                <Tabs>
                    <Tabs.Tab title="用户协议" key="agreement">
                        <div className={styles.section}>
                            <h2>用户协议</h2>
                            <p>欢迎使用我们的在线学习平台！</p>
                            
                            <h3>1. 服务内容</h3>
                            <p>本平台提供在线学习、练习、考试等教育服务。用户可以通过本平台进行知识学习、题目练习、模拟考试等活动。</p>
                            
                            <h3>2. 账号注册</h3>
                            <p>用户需要注册账号才能使用本平台的服务。注册时应当提供真实、准确的信息，并有责任保护账号安全。</p>
                            
                            <h3>3. 使用规则</h3>
                            <p>3.1 用户应遵守相关法律法规。</p>
                            <p>3.2 不得利用本平台进行任何违法或不当行为。</p>
                            <p>3.3 不得干扰平台的正常运行。</p>
                            
                            <h3>4. 知识产权</h3>
                            <p>4.1 平台上的所有内容均受知识产权保护。</p>
                            <p>4.2 未经许可，不得复制、传播平台内容。</p>
                            
                            <h3>5. 服务变更与终止</h3>
                            <p>5.1 平台有权对服务进行变更或升级。</p>
                            <p>5.2 如用户违反协议，平台有权终止服务。</p>
                        </div>
                    </Tabs.Tab>
                    
                    <Tabs.Tab title="隐私政策" key="privacy">
                        <div className={styles.section}>
                            <h2>隐私政策</h2>
                            <p>我们重视您的隐私保护，请仔细阅读本隐私政策。</p>
                            
                            <h3>1. 信息收集</h3>
                            <p>1.1 注册信息：用户名、密码、联系方式等。</p>
                            <p>1.2 学习数据：练习记录、考试成绩、学习时长等。</p>
                            <p>1.3 设备信息：设备型号、操作系统、浏览器类型等。</p>
                            
                            <h3>2. 信息使用</h3>
                            <p>2.1 提供和改进服务。</p>
                            <p>2.2 个性化学习推荐。</p>
                            <p>2.3 统计分析和研究。</p>
                            
                            <h3>3. 信息保护</h3>
                            <p>3.1 采用加密技术保护用户数据。</p>
                            <p>3.2 严格控制数据访问权限。</p>
                            <p>3.3 定期进行安全评估。</p>
                            
                            <h3>4. 信息共享</h3>
                            <p>4.1 未经用户同意，不向第三方提供个人信息。</p>
                            <p>4.2 可能与合作伙伴共享必要的非个人信息。</p>
                            
                            <h3>5. 用户权利</h3>
                            <p>5.1 查询、更正个人信息。</p>
                            <p>5.2 删除账号及相关数据。</p>
                            <p>5.3 退订推送服务。</p>
                        </div>
                    </Tabs.Tab>
                </Tabs>
            </div>
        </div>
    );
} 