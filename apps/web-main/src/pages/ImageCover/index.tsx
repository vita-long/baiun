import React, { useState, useRef } from 'react';

const ImageCover: React.FC = () => {
  const [svgFile, setSvgFile] = useState<File | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string>('');
  const [format, setFormat] = useState<'png' | 'jpeg' | 'jpg'>('png');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number, height: number } | null>(null);
  const [transparentBackground, setTransparentBackground] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgPreviewRef = useRef<HTMLImageElement>(null);

  // 处理文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.includes('svg')) {
      setError('请上传SVG格式的文件');
      return;
    }

    setSvgFile(file);
    setError('');
    setConvertedUrl('');
  };

  // // 辅助函数：解析带单位的尺寸值
  // const parseDimension = (value: string | null): number | null => {
  //   if (!value) return null;
  
  //   // 尝试提取数字部分
  //   const match = value.match(/^(\d+(?:\.\d+)?)/);
  //   if (match) {
  //     const num = parseFloat(match[1]);
  //     return !isNaN(num) ? num : null;
  //   }
  
  //   return null;
  // };

  // 将SVG转换为图片
  const convertSvgToImage = async () => {
    if (!svgFile || !canvasRef.current) return;

    setLoading(true);
    setError('');

    try {
      // 读取SVG文件内容
      const svgContent = await readFileAsText(svgFile);
      const svgOriginRect = svgPreviewRef.current?.getBoundingClientRect();

      // 创建一个临时的SVG元素
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

      // 设置innerHTML
      svg.innerHTML = svgContent;

      // 添加到DOM以获取计算后的尺寸
      document.body.appendChild(svg);

      // 提取并解析SVG的原始尺寸（支持带单位的值）
      let width = svgOriginRect?.width ?? 24;
      let height = svgOriginRect?.height ?? 24;

      // 保存原始尺寸
      setOriginalDimensions({ width, height });

      // 设置SVG的viewBox（如果没有设置）
      if (!svg.getAttribute('viewBox')) {
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      }

      // 使用原始尺寸
      svg.setAttribute('width', width.toString());
      svg.setAttribute('height', height.toString());

      // 将SVG内容转换为data URL
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;

      // 创建图片对象加载SVG
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // 设置canvas尺寸为原始SVG尺寸
        canvas.width = width;
        canvas.height = height;

        // 绘制图片到canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // 清除canvas
          ctx.clearRect(0, 0, width, height);

          // 仅当不需要透明背景时设置白色背景
          if (!transparentBackground) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          ctx.drawImage(img, 0, 0, width, height);

          // 转换为目标格式，PNG支持透明度
          const mimeType = format === 'png' ? 'image/png' : `image/${format}`;
          const imageUrl = canvas.toDataURL(mimeType);
          setConvertedUrl(imageUrl);
          setLoading(false);
        }
      };

      img.onerror = () => {
        setError('SVG加载失败，请检查文件格式');
        setLoading(false);
      };

      img.src = svgDataUrl;
    } catch (err) {
      setError('转换失败，请重试');
      setLoading(false);
    }
  };

  // 读取文件内容
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  // 下载转换后的图片
  const downloadImage = () => {
    if (!convertedUrl) return;

    // 生成包含尺寸信息的文件名
    const dimensions = originalDimensions ? `${originalDimensions.width}x${originalDimensions.height}` : 'original';
    const fileName = `converted-image-${dimensions}.${format}`;

    const link = document.createElement('a');
    link.href = convertedUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>SVG转换工具</h1>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="file"
          accept=".svg"
          onChange={handleFileUpload}
          style={{ marginBottom: '10px' }}
        />
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px' }}>选择输出格式：</label>
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as 'png' | 'jpeg' | 'jpg')}
          disabled={!svgFile}
        >
          <option value="png">PNG</option>
          <option value="jpeg">JPEG</option>
          <option value="jpg">JPG</option>
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={transparentBackground}
            onChange={(e) => setTransparentBackground(e.target.checked)}
            disabled={format !== 'png'}
            style={{ marginRight: '8px' }}
          />
          透明背景 (仅PNG格式支持)
          {format !== 'png' && (
            <span style={{ marginLeft: '8px', fontSize: '14px', color: '#666' }}>
              (请选择PNG格式)
            </span>
          )}
        </label>
      </div>

      <button
        onClick={convertSvgToImage}
        disabled={!svgFile || loading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: !svgFile || loading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? '转换中...' : '转换SVG'}
      </button>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* SVG预览 */}
        <div style={{ flex: 1, minWidth: '300px', border: '1px solid #ddd', padding: '10px' }}>
          <h3>SVG预览</h3>
          {svgFile && (
            <div style={{ maxWidth: '100%', overflow: 'auto' }}>
              <img
                src={URL.createObjectURL(svgFile)}
                alt="SVG Preview"
                style={{ maxWidth: '100%' }}
                ref={svgPreviewRef}
              />
            </div>
          )}
        </div>

        {/* 转换后的图片预览 */}
        <div style={{ flex: 1, minWidth: '300px', border: '1px solid #ddd', padding: '10px' }}>
          <h3>转换结果</h3>
          {convertedUrl ? (
            <>
              <div style={{ maxWidth: '100%', overflow: 'auto' }}>
                <img
                  src={convertedUrl}
                  alt={`Converted ${format}`}
                  style={{ maxWidth: '100%' }}
                />
              </div>
              {originalDimensions && (
                <div style={{
                  margin: '10px 0',
                  fontSize: '14px',
                  color: '#666'
                }}>
                  尺寸: {originalDimensions.width} x {originalDimensions.height} 像素
                </div>
              )}
              <button
                onClick={downloadImage}
                style={{
                  marginTop: '10px',
                  padding: '8px 16px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                下载 {format.toUpperCase()}
              </button>
            </>
          ) : (
            <p>点击转换按钮开始转换</p>
          )}
        </div>
      </div>

      {/* 隐藏的canvas用于转换 */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ImageCover;