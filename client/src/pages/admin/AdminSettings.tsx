import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { adminService } from '@/services/adminService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import type { SystemSetting, SensitiveWord } from '@/types';

const AdminSettings: React.FC = () => {
  // 系统设置状态
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [editSettingsModal, setEditSettingsModal] = useState(false);
  const [updatedSettings, setUpdatedSettings] = useState<SystemSetting[]>([]);
  
  // 敏感词管理状态
  const [sensitiveWords, setSensitiveWords] = useState<SensitiveWord[]>([]);
  const [wordsLoading, setWordsLoading] = useState(true);
  const [wordModal, setWordModal] = useState(false);
  const [editingWord, setEditingWord] = useState<SensitiveWord | null>(null);
  const [wordForm, setWordForm] = useState({
    word: '',
    level: 'WARNING' as 'WARNING' | 'BLOCK'
  });
  const [activeTab, setActiveTab] = useState<'settings' | 'words'>('settings');
  const [refreshKey, setRefreshKey] = useState(0);

  // 加载系统设置
  const loadSettings = async () => {
    try {
      setSettingsLoading(true);
      const response = await adminService.getSystemSettings();
      
      if (response.success) {
        setSettings(response.data.data);
        setUpdatedSettings(response.data.data);
      }
    } catch (error) {
      console.error('加载系统设置失败:', error);
    } finally {
      setSettingsLoading(false);
    }
  };

  // 加载敏感词
  const loadSensitiveWords = async () => {
    try {
      setWordsLoading(true);
      const response = await adminService.getSensitiveWords();
      
      if (response.success) {
        setSensitiveWords(response.data.data);
      }
    } catch (error) {
      console.error('加载敏感词失败:', error);
    } finally {
      setWordsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'settings') {
      loadSettings();
    } else {
      loadSensitiveWords();
    }
  }, [activeTab, refreshKey]);

  // 更新系统设置
  const updateSettings = async () => {
    try {
      const response = await adminService.updateSystemSettings(updatedSettings);
      
      if (response.success) {
        setEditSettingsModal(false);
        setRefreshKey(prev => prev + 1);
      }
    } catch (error) {
      console.error('更新系统设置失败:', error);
    }
  };

  // 重置设置表单
  const resetSettingsForm = () => {
    setUpdatedSettings(settings);
  };

  // 处理设置变更
  const handleSettingChange = (index: number, value: string) => {
    const newSettings = [...updatedSettings];
    newSettings[index] = { ...newSettings[index], settingValue: value };
    setUpdatedSettings(newSettings);
  };

  // 打开敏感词编辑模态框
  const openWordModal = (word?: SensitiveWord) => {
    if (word) {
      setEditingWord(word);
      setWordForm({
        word: word.word,
        level: word.level as 'WARNING' | 'BLOCK'
      });
    } else {
      setEditingWord(null);
      setWordForm({
        word: '',
        level: 'WARNING'
      });
    }
    setWordModal(true);
  };

  // 保存敏感词
  const saveWord = async () => {
    try {
      let response;
      
      if (editingWord) {
        response = await adminService.updateSensitiveWord(editingWord.id, wordForm);
      } else {
        response = await adminService.createSensitiveWord(wordForm);
      }
      
      if (response.success) {
        setWordModal(false);
        setRefreshKey(prev => prev + 1);
      }
    } catch (error) {
      console.error('保存敏感词失败:', error);
    }
  };

  // 删除敏感词
  const deleteWord = async (wordId: string) => {
    if (!confirm('确定要删除这个敏感词吗？')) return;
    
    try {
      const response = await adminService.deleteSensitiveWord(wordId);
      
      if (response.success) {
        setRefreshKey(prev => prev + 1);
      }
    } catch (error) {
      console.error('删除敏感词失败:', error);
    }
  };

  // 获取敏感词级别标签
  const getLevelBadge = (level: string) => {
    const levelMap = {
      WARNING: { text: '警告', className: 'bg-yellow-100 text-yellow-800' },
      BLOCK: { text: '屏蔽', className: 'bg-red-100 text-red-800' }
    };
    
    const config = levelMap[level as keyof typeof levelMap] || levelMap.WARNING;
    return <span className={`px-2 py-1 text-xs rounded-full ${config.className}`}>{config.text}</span>;
  };

  return (
    <AdminLayout title="系统设置">
      <div className="mb-6">
        <Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab as 'settings' | 'words')}>
          <TabsList>
            <TabsTrigger value="settings">系统设置</TabsTrigger>
            <TabsTrigger value="words">敏感词管理</TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setEditSettingsModal(true)}>
                编辑设置
              </Button>
            </div>

            <Card>
              {settingsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          设置名称
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          当前值
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          说明
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {settings.map((setting, index) => (
                        <tr key={setting.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {setting.settingKey}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {setting.settingValue}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {setting.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* 编辑设置模态框 */}
            <Modal
              isOpen={editSettingsModal}
              onClose={() => setEditSettingsModal(false)}
              title="编辑系统设置"
              size="lg"
            >
              <div className="space-y-4">
                {updatedSettings.map((setting, index) => (
                  <div key={setting.id} className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      {setting.settingKey}
                    </label>
                    <Input
                      value={setting.settingValue}
                      onChange={(e) => handleSettingChange(index, e.target.value)}
                      placeholder={setting.description}
                    />
                    <p className="text-xs text-gray-500">{setting.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={resetSettingsForm}
                >
                  重置
                </Button>
                <Button variant="outline" onClick={() => setEditSettingsModal(false)}>
                  取消
                </Button>
                <Button onClick={updateSettings}>
                  保存更改
                </Button>
              </div>
            </Modal>
          </TabsContent>

          <TabsContent value="words">
            <div className="flex justify-end mb-4">
              <Button onClick={() => openWordModal()}>
                添加敏感词
              </Button>
            </div>

            <Card>
              {wordsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          敏感词
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          处理级别
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          创建时间
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sensitiveWords.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                            暂无敏感词数据
                          </td>
                        </tr>
                      ) : (
                        sensitiveWords.map((word) => (
                          <tr key={word.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {word.word}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getLevelBadge(word.level)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(word.createdAt).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => openWordModal(word)}
                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                              >
                                编辑
                              </button>
                              <button
                                onClick={() => deleteWord(word.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                删除
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* 添加/编辑敏感词模态框 */}
            <Modal
              isOpen={wordModal}
              onClose={() => setWordModal(false)}
              title={editingWord ? '编辑敏感词' : '添加敏感词'}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    敏感词
                  </label>
                  <Input
                    value={wordForm.word}
                    onChange={(e) => setWordForm(prev => ({ ...prev, word: e.target.value }))}
                    placeholder="输入敏感词"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    处理级别
                  </label>
                  <select
                    value={wordForm.level}
                    onChange={(e) => setWordForm(prev => ({ ...prev, level: e.target.value as 'WARNING' | 'BLOCK' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="WARNING">警告</option>
                    <option value="BLOCK">屏蔽</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    警告：提醒用户注意；屏蔽：直接禁止发布
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setWordModal(false)}>
                  取消
                </Button>
                <Button onClick={saveWord}>
                  {editingWord ? '更新' : '添加'}
                </Button>
              </div>
            </Modal>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;