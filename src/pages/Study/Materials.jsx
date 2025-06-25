import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { NavBar, DotLoading, Empty, Toast } from "antd-mobile";
import { ClockCircleOutline } from "antd-mobile-icons";
import axios from "./axios";
import dayjs from "dayjs";
import styles from "./Materials.module.css";

export default function Materials() {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const location = useLocation();
    const course = location.state?.course;
    const navigate = useNavigate();

    useEffect(() => {
        getData();
    }, []);

    const getData = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get("/lz/source", {
                params: { course }
            });
            setMaterials(res.data.data || []);
            console.log(res.data.data);
        } catch (err) {
            setError(err.message || "获取数据失败");
            Toast.show({
                icon: "fail",
                content: "获取学习资料失败",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleItemClick = (item) => {
        navigate("/source", {
            state: {
                course,
                video: item
            }
        });
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <NavBar onBack={() => navigate(-1, { state: { course } })}>学习资料</NavBar>
                <div className={styles.loading}>
                    <DotLoading color="primary" />
                    <span>加载中...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <NavBar onBack={() => navigate(-1, { state: { course } })}>学习资料</NavBar>
                <div className={styles.error}>
                    <Empty description={error} />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <NavBar onBack={() => navigate(-1, { state: { course } })}>学习资料</NavBar>
            {materials.length === 0 ? (
                <Empty description="暂无学习资料" />
            ) : (
                <div className={styles.materialList}>
                    {materials.map((item, index) => (
                        <div 
                            key={index} 
                            className={styles.materialCard}
                            onClick={() => handleItemClick(item)}
                        >
                            <img src={item.img} alt={item.title} className={styles.materialImage} />
                            <div className={styles.materialInfo}>
                                <p className={styles.materialTitle}>{item.title}</p>
                                <div className={styles.materialMeta}>
                                    <ClockCircleOutline className={styles.clockIcon} />
                                    <span className={styles.materialTime}>{dayjs(item.time).format("YYYY-MM-DD")}</span>
                                    <span className={styles.materialDuration}>{item.minutes || 1250} 阅读</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}