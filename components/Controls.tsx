import React from 'react';
import { PhotoFrameConfig } from '../types';
import { Wand2, Type, Calendar, Palette, Download, Printer } from 'lucide-react';

interface ControlsProps {
  config: PhotoFrameConfig;
  updateConfig: (key: keyof PhotoFrameConfig, value: any) => void;
  onGenerateAI: () => void;
  isGenerating: boolean;
  onDownload: () => void;
  canDownload: boolean;
  isAdmin: boolean;
  onUserSubmit: () => void;
}

// Extended Color Palette
const COLORS = [
  '#000000', // Black
  '#FFFFFF', // White
  '#fce7f3', // Pink 100
  '#ec4899', // Pink 500
  '#dbeafe', // Blue 100
  '#1e40af', // Blue 800
  '#e0e7ff', // Indigo 100
  '#f3f4f6', // Gray 100
  '#374151', // Gray 700
  '#fef3c7', // Amber 100
  '#d97706', // Amber 600
  '#d1fae5', // Emerald 100
  '#059669', // Emerald 600
  '#fae8ff', // Fuchsia 100
  '#795548', // Brown
  '#607d8b', // Blue Grey
];

const FONTS = [
  { name: '经典宋体', value: 'Playfair Display' },
  { name: '站酷小薇', value: 'ZCOOL XiaoWei' },
  { name: '马善政毛笔', value: 'Ma Shan Zheng' },
  { name: '龙苍草书', value: 'Long Cang' },
  { name: '思源黑体', value: 'Inter' },
  { name: '衬线雅宋', value: 'Noto Serif SC' },
  { name: '系统默认', value: 'sans-serif' },
];

export const Controls: React.FC<ControlsProps> = ({ 
  config, 
  updateConfig, 
  onGenerateAI, 
  isGenerating,
  onDownload,
  canDownload,
  isAdmin,
  onUserSubmit
}) => {
  return (
    <div className="space-y-6 bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
      
      {/* AI Action */}
      <button 
        onClick={onGenerateAI}
        disabled={isGenerating}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold shadow-lg active:scale-[0.98] transition-all disabled:opacity-70"
      >
        <Wand2 size={20} className={isGenerating ? "animate-spin" : ""} />
        {isGenerating ? "正在施展魔法..." : "AI 一键美化 (自动配文配色)"}
      </button>

      {/* Frame Color - Grid Layout to show more */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Palette size={14} /> 边框颜色
        </label>
        <div className="grid grid-cols-6 gap-3">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => updateConfig('borderColor', c)}
              className={`w-10 h-10 rounded-full border-2 shadow-sm transition-transform ${config.borderColor === c ? 'scale-110 border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}
              style={{ backgroundColor: c }}
              aria-label={`选择颜色 ${c}`}
            />
          ))}
        </div>
      </div>

      {/* Caption & Font */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Type size={14} /> 文字标题 & 字体
        </label>
        <div className="space-y-3">
          <input 
            type="text"
            value={config.caption}
            onChange={(e) => updateConfig('caption', e.target.value)}
            placeholder="输入可爱的文字..."
            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-200 text-gray-800"
            maxLength={30}
          />
          
          {/* Font Selector - Grid Layout */}
          <div className="flex flex-wrap gap-2">
            {FONTS.map((font) => (
              <button
                key={font.value}
                onClick={() => updateConfig('fontFamily', font.value)}
                className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                  config.fontFamily === font.value 
                    ? 'bg-brand-50 border-brand-200 text-brand-700 font-medium' 
                    : 'bg-white border-gray-200 text-gray-600'
                }`}
                style={{ fontFamily: font.value }}
              >
                {font.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Toggles */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => updateConfig('showDate', !config.showDate)}
          className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${config.showDate ? 'bg-brand-50 text-brand-600 ring-1 ring-brand-200' : 'bg-gray-50 text-gray-600'}`}
        >
          <Calendar size={16} />
          {config.showDate ? '日期: 开' : '日期: 关'}
        </button>

        <div className="flex-1">
           <select 
             value={config.filter}
             onChange={(e) => updateConfig('filter', e.target.value)}
             className="w-full py-3 px-4 rounded-lg bg-gray-50 text-gray-600 text-sm font-medium appearance-none outline-none focus:ring-1 focus:ring-brand-200"
           >
             <option value="none">原图</option>
             <option value="bw">黑白</option>
             <option value="sepia">暖色</option>
             <option value="vintage">复古</option>
           </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2">
         {isAdmin ? (
           <div className="space-y-2">
             <button
                onClick={onDownload}
                disabled={!canDownload}
                className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-lg shadow-xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <Download size={20} />
                下载当前制作 (测试)
             </button>
             <p className="text-center text-xs text-gray-400">请在下方“后台订单管理”中查看客户提交的订单</p>
           </div>
         ) : (
           <button
              onClick={onUserSubmit}
              disabled={!canDownload}
              className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold text-lg shadow-xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
           >
              <Printer size={22} />
              提交打印订单
           </button>
         )}
      </div>

    </div>
  );
};