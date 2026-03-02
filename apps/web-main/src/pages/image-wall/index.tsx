import { useState, useEffect } from 'react';
import './index.scss';

const ImageWall = () => {
  // 旋转角度状态
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    // 设置定时器，每 50 毫秒更新一次旋转角度
    const rotationInterval = setInterval(() => {
      setRotation(prevRotation => prevRotation + 0.5);
    }, 50);

    // 组件卸载时清除定时器
    return () => clearInterval(rotationInterval);
  }, []);

  return (
    <div
      className="photo-wall"
      style={{
        transform: `rotateY(${rotation}deg)`,
        transition: 'transform 0.1s ease-out'
      }}
    >
      <img src="https://picsum.photos/600/900?random=1" alt="照片1" />
      <img src="https://picsum.photos/600/900?random=2" alt="照片2" />
      <img src="https://picsum.photos/600/900?random=3" alt="照片3" />
      <img src="https://picsum.photos/600/900?random=4" alt="照片4" />
      <img src="https://picsum.photos/600/900?random=5" alt="照片5" />
      <img src="https://picsum.photos/600/900?random=6" alt="照片6" />
      <img src="https://picsum.photos/600/900?random=7" alt="照片7" />
      <img src="https://picsum.photos/600/900?random=8" alt="照片8" />
      <img src="https://picsum.photos/600/900?random=9" alt="照片9" />
      <img src="https://picsum.photos/600/900?random=10" alt="照片10" />
    </div>
  );
}

export default ImageWall;