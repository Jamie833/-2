import React, { useState, useEffect } from 'react';
import { PhotoUploader } from './components/PhotoUploader';
import { Controls } from './components/Controls';
import { PhotoFrameConfig } from './types';
import { generatePhotoStrip } from './services/imageProcessing';
import { analyzePhotosAndGetMood } from './services/geminiService';
import { Sparkles, CheckCircle2, Lock, Download, Trash2, KeyRound, X } from 'lucide-react';

interface SavedOrder {
  id: string;
  timestamp: number;
  imageUrl: string;
}

const App: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);
  const [sourceFiles, setSourceFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessingCanvas, setIsProcessingCanvas] = useState(false);
  
  // Admin Mode Logic
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminTapCount, setAdminTapCount] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [savedOrders, setSavedOrders] = useState<SavedOrder[]>([]);

  // Order Submitted Toast
  const [showOrderToast, setShowOrderToast] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState('');

  const [config, setConfig] = useState<PhotoFrameConfig>({
    borderColor: '#000000',
    borderWidth: 20,
    gap: 15,
    textColor: '#FFFFFF',
    fontFamily: 'Playfair Display',
    caption: '',
    showDate: true,
    filter: 'none'
  });

  // Initialize saved orders from local storage on load
  useEffect(() => {
    const saved = localStorage.getItem('life4cuts_orders');
    if (saved) {
      try {
        setSavedOrders(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse orders");
      }
    }
  }, []);

  // Handle secret admin tap (Toggle In/Out)
  const handleHeaderClick = () => {
    setAdminTapCount(prev => {
      const newCount = prev + 1;
      
      // Logic: 5 taps to enter admin, 3 taps to exit admin
      const triggerCount = isAdmin ? 3 : 5;

      if (newCount >= triggerCount) {
        if (isAdmin) {
          // Logic to Exit Admin Mode
          if (window.confirm("确认退出商家模式，返回用户界面？")) {
            setIsAdmin(false);
          }
        } else {
          // Logic to Enter Admin Mode
          setShowAdminLogin(true); 
        }
        return 0; // Reset counter
      }
      return newCount;
    });
  };

  const handleAdminLogin = () => {
    if (passwordInput === '318126') {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setPasswordInput('');
      setLoginError(false);
      // Load orders
      const saved = localStorage.getItem('life4cuts_orders');
      if (saved) setSavedOrders(JSON.parse(saved));
    } else {
      setLoginError(true);
      setPasswordInput('');
    }
  };

  const handleUpload = (files: File[]) => {
    const newFiles = files.slice(0, 4 - images.length);
    const newUrls = newFiles.map(file => URL.createObjectURL(file));
    setSourceFiles(prev => [...prev, ...newFiles]);
    setImages(prev => [...prev, ...newUrls]);
  };

  const handleRemove = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setSourceFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateConfig = (key: keyof PhotoFrameConfig, value: any) => {
    setConfig(prev => ({ 
      ...prev, 
      [key]: value,
      textColor: (key === 'borderColor' && value === '#FFFFFF') ? '#000000' : (key === 'borderColor' ? '#FFFFFF' : prev.textColor)
    }));
  };

  useEffect(() => {
    if (images.length === 0) {
      setPreviewUrl(null);
      return;
    }
    const timer = setTimeout(async () => {
      setIsProcessingCanvas(true);
      try {
        const url = await generatePhotoStrip(images, config);
        setPreviewUrl(url);
      } catch (err) {
        console.error("Canvas error", err);
      } finally {
        setIsProcessingCanvas(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [images, config]);

  const handleAIMagic = async () => {
    if (sourceFiles.length === 0) return;
    setIsGenerating(true);
    try {
      const mood = await analyzePhotosAndGetMood(sourceFiles);
      setConfig(prev => ({
        ...prev,
        caption: mood.caption,
        borderColor: mood.suggestedColor,
        textColor: ['#FFFFFF', '#fdf2f8', '#fce7f3'].includes(mood.suggestedColor) ? '#000000' : '#FFFFFF',
        filter: 'vintage'
      }));
    } catch (e) {
      alert("AI 正在休息，请稍后再试！");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
  };

  const handleDownload = () => {
    if (previewUrl) {
      downloadImage(previewUrl, `life4cuts-current-${Date.now()}.jpg`);
    }
  };

  const handleUserSubmit = () => {
    if (!previewUrl) return;

    // Simulate sending order by saving to localStorage
    const orderId = Math.floor(Math.random() * 9000) + 1000 + '';
    const newOrder: SavedOrder = {
      id: orderId,
      timestamp: Date.now(),
      imageUrl: previewUrl
    };

    const updatedOrders = [newOrder, ...savedOrders];
    setSavedOrders(updatedOrders);
    localStorage.setItem('life4cuts_orders', JSON.stringify(updatedOrders));

    setCurrentOrderId(orderId);
    setShowOrderToast(true);
    setTimeout(() => setShowOrderToast(false), 4000);
  };

  const clearOrders = () => {
    if (confirm("确定要清空所有历史订单吗？此操作无法撤销。")) {
      setSavedOrders([]);
      localStorage.removeItem('life4cuts_orders');
    }
  };

  return (
    <div className="min-h-screen max-w-md mx-auto bg-gray-50 flex flex-col shadow-2xl relative">
      
      {/* Header */}
      <header className="px-6 py-5 bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100 flex items-center justify-between select-none" onClick={handleHeaderClick}>
        <div className="flex items-center gap-2 cursor-pointer">
          {/* Changed color to blue */}
          <Sparkles className="text-blue-500" size={24} />
          {/* Changed title */}
          <h1 className="text-xl font-bold font-serif tracking-tight text-gray-900">等待戈多</h1>
        </div>
        <div className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-md text-gray-500 flex items-center gap-1">
          {isAdmin ? <Lock size={10} className="text-green-500" /> : null}
          {isAdmin ? "商家版" : "Beta"}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 no-scrollbar space-y-8">
        
        {/* Upload Section */}
        <section>
          <PhotoUploader 
            images={images} 
            onUpload={handleUpload} 
            onRemove={handleRemove} 
          />
        </section>

        {/* Live Preview */}
        {images.length > 0 && (
          <section className="flex flex-col items-center">
             <div className="text-sm text-gray-400 mb-2 uppercase tracking-widest font-semibold">预览效果</div>
            <div className={`relative transition-opacity duration-300 ${isProcessingCanvas ? 'opacity-50' : 'opacity-100'}`}>
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Strip Preview" 
                  className="w-64 md:w-72 shadow-2xl rounded-sm transform hover:scale-[1.01] transition-transform duration-500"
                />
              ) : (
                <div className="w-64 h-[800px] bg-gray-200 animate-pulse rounded-sm" />
              )}
            </div>
            {images.length < 4 && (
                <div className="mt-4 text-center text-amber-600 bg-amber-50 p-3 rounded-lg text-sm w-full">
                  提示：再上传 {4 - images.length} 张照片即可完成！
                </div>
            )}
          </section>
        )}

        {/* Controls */}
        {images.length > 0 && (
          <section className="pb-4">
            <Controls 
              config={config}
              updateConfig={updateConfig}
              onGenerateAI={handleAIMagic}
              isGenerating={isGenerating}
              onDownload={handleDownload}
              canDownload={!!previewUrl}
              isAdmin={isAdmin}
              onUserSubmit={handleUserSubmit}
            />
          </section>
        )}

        {/* ADMIN ONLY: Order List */}
        {isAdmin && savedOrders.length > 0 && (
          <section className="pt-4 pb-12 border-t border-gray-200">
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                   <Lock size={16} className="text-green-500"/> 后台订单管理
                </h3>
                <button onClick={clearOrders} className="text-red-500 text-xs flex items-center gap-1">
                  <Trash2 size={12} /> 清空
                </button>
             </div>
             
             <div className="space-y-3">
                {savedOrders.map((order) => (
                  <div key={order.id} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
                    <img src={order.imageUrl} className="w-10 h-24 object-cover rounded bg-gray-100 border border-gray-100" />
                    <div className="flex-1">
                      <div className="font-bold text-gray-800">订单 #{order.id}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(order.timestamp).toLocaleString('zh-CN', {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                      </div>
                    </div>
                    <button 
                      onClick={() => downloadImage(order.imageUrl, `order-${order.id}.jpg`)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                      title="下载原图"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                ))}
             </div>
          </section>
        )}
      </main>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
           <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-xs transform transition-all">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <KeyRound size={20} className="text-brand-500" /> 商家登录
                </h3>
                <button onClick={() => { setShowAdminLogin(false); setLoginError(false); setPasswordInput(''); }} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              
              <p className="text-sm text-gray-500 mb-4">请输入管理密码以进入下载后台。</p>
              
              <input 
                type="password" 
                inputMode="numeric"
                pattern="[0-9]*"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="请输入6位密码"
                className={`w-full p-3 rounded-xl border ${loginError ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} outline-none focus:ring-2 focus:ring-brand-200 mb-4 font-mono text-center tracking-widest text-lg`}
              />
              
              {loginError && <div className="text-red-500 text-xs text-center mb-3">密码错误，请重试</div>}
              
              <button 
                onClick={handleAdminLogin}
                className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold shadow-md active:scale-95 transition-transform"
              >
                确认进入
              </button>
           </div>
        </div>
      )}

      {/* Order Success Toast */}
      {showOrderToast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col items-center max-w-xs w-full text-center">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
               <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">订单已提交</h3>
            <div className="text-3xl font-black text-brand-600 mb-2 font-mono">#{currentOrderId}</div>
            <p className="text-gray-500 text-sm">请联系店员，报出上方编号进行打印。</p>
            <button 
              onClick={() => setShowOrderToast(false)}
              className="mt-6 w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;