import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { AdminLayout } from './AdminLayout';
import { adminService } from '@/services/adminService';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { EmotionBox } from '@/types';

const AdminBoxes: React.FC = () => {
  const [boxes, setBoxes] = useState<EmotionBox[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    isFeatured: ''
  });
  const [selectedBox, setSelectedBox] = useState<EmotionBox | null>(null);
  const [viewModal, setViewModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [actionType, setActionType] = useState<'archive' | 'delete' | 'featured' | 'unfeatured'>('archive');
  const [tempSearch, setTempSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // 加载盲盒列表
  const loadBoxes = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAdminBoxes({
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status || undefined,
        search: filters.search || undefined,
        isFeatured: filters.isFeatured === '' ? undefined : filters.isFeatured === 'true'
      });

      if (response.success && response.data) {
        // 处理images字段，将JSON字符串转换为数组
        const processedBoxes = (response.data.boxes || []).map((box: any) => ({
          ...box,
          images: typeof box.images === 'string' 
            ? JSON.parse(box.images || '[]') 
            : box.images || [],
          viewCount: box._count?.views || 0
        }));
        setBoxes(processedBoxes);
        setPagination(response.data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        });
      }
    } catch (error) {
      console.error('加载盲盒列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoxes();
  }, [pagination.page, filters.status, filters.search, filters.isFeatured, refreshKey]);

  // 查看盲盒详情
  const viewBox = async (box: EmotionBox) => {
    try {
      // 直接使用当前box数据，避免重复请求
      setSelectedBox(box);
      setViewModal(true);
    } catch (error) {
      console.error('获取盲盒详情失败:', error);
    }
  };

  // 执行操作（下架/删除/精选）
  const executeAction = async () => {
    if (!selectedBox) return;

    try {
      let response;
      
      switch (actionType) {
        case 'archive':
          response = await adminService.archiveBox(selectedBox.id);
          break;
        case 'delete':
          response = await adminService.deleteBox(selectedBox.id);
          break;
        case 'featured':
          response = await adminService.setFeaturedBox(selectedBox.id, true);
          break;
        case 'unfeatured':
          response = await adminService.setFeaturedBox(selectedBox.id, false);
          break;
      }

      if (response.success) {
        setConfirmModal(false);
        setSelectedBox(null);
        setRefreshKey(prev => prev + 1);
      }
    } catch (error) {
      console.error('执行操作失败:', error);
    }
  };

  // 打开确认模态框
  const openConfirmModal = (box: EmotionBox, action: typeof actionType) => {
    setSelectedBox(box);
    setActionType(action);
    setConfirmModal(true);
  };

  // 搜索处理
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setFilters(prev => ({ ...prev, search: tempSearch }));
  };

  // 分页处理
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // 获取状态标签
  const getStatusBadge = (status: string) => {
    const statusMap = {
      ACTIVE: { text: '活跃', className: 'bg-green-100 text-green-800' },
      ARCHIVED: { text: '已归档', className: 'bg-gray-100 text-gray-800' },
      DELETED: { text: '已删除', className: 'bg-red-100 text-red-800' }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || statusMap.ACTIVE;
    return <span className={`px-2 py-1 text-xs rounded-full ${config.className}`}>{config.text}</span>;
  };

  if (loading) {
    return (
      <AdminLayout title="盲盒管理">
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900">盲盒管理</h1>
          <p className="mt-1 text-sm text-gray-500">
            管理平台所有盲盒内容
          </p>
        </div>
      </div>
      <Card className="mb-6">
        <div className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">所有状态</option>
                <option value="ACTIVE">活跃</option>
                <option value="ARCHIVED">已归档</option>
                <option value="DELETED">已删除</option>
              </select>
              
              <select
                value={filters.isFeatured}
                onChange={(e) => setFilters(prev => ({ ...prev, isFeatured: e.target.value, page: 1 }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">精选状态</option>
                <option value="true">精选</option>
                <option value="false">非精选</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索标题或内容..."
                  value={tempSearch}
                  onChange={(e) => setTempSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <Button onClick={handleSearch}>搜索</Button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  盲盒信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  统计
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
              {boxes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    暂无盲盒数据
                  </td>
                </tr>
              ) : (
                boxes.map((box) => (
                  <tr key={box.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {box.title || '无标题'}
                        </div>
                        <div className="text-sm text-gray-500 truncate mt-1">
                          {box.content.substring(0, 50)}{box.content.length > 50 ? '...' : ''}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {box.isAnonymous ? box.anonymousName : box.user?.username}
                      </div>
                      <div className="text-sm text-gray-500">
                        {box.isAnonymous ? '匿名' : '实名'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(box.status)}
                      {box.isFeatured && (
                        <span className="ml-2 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                          精选
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>查看: {box._count?.views || 0}</div>
                      <div>回复: {box._count?.replies || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDistanceToNow(new Date(box.createdAt), { 
                        addSuffix: true, 
                        locale: zhCN 
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => viewBox(box)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        查看
                      </button>
                      
                      {box.status === 'ACTIVE' && (
                        <>
                          {box.isFeatured ? (
                            <button
                              onClick={() => openConfirmModal(box, 'unfeatured')}
                              className="text-yellow-600 hover:text-yellow-900 mr-3"
                            >
                              取消精选
                            </button>
                          ) : (
                            <button
                              onClick={() => openConfirmModal(box, 'featured')}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              设为精选
                            </button>
                          )}
                          
                          <button
                            onClick={() => openConfirmModal(box, 'archive')}
                            className="text-yellow-600 hover:text-yellow-900 mr-3"
                          >
                            下架
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => openConfirmModal(box, 'delete')}
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
        
        {/* 分页 */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                variant="outline"
                size="sm"
              >
                上一页
              </Button>
              <Button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                variant="outline"
                size="sm"
              >
                下一页
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  显示第 <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> 至{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  条，共 <span className="font-medium">{pagination.total}</span> 条记录
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    上一页
                  </button>
                  
                  {/* 页码 */}
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pagination.page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    下一页
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* 查看盲盒详情模态框 */}
      <Modal
        isOpen={viewModal}
        onClose={() => setViewModal(false)}
        title="盲盒详情"
        size="lg"
      >
        {selectedBox && (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedBox.title || '无标题'}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <span>创建者: {selectedBox.isAnonymous ? selectedBox.anonymousName : selectedBox.user?.username}</span>
                <span>状态: {getStatusBadge(selectedBox.status).props.children}</span>
                {selectedBox.isFeatured && (
                  <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                    精选
                  </span>
                )}
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-800 whitespace-pre-wrap">{selectedBox.content}</p>
              </div>
              
              {selectedBox.images && Array.isArray(selectedBox.images) && selectedBox.images.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">图片:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedBox.images.map((img: string, index: number) => (
                      <img
                        key={index}
                        src={img}
                        alt={`图片${index + 1}`}
                        className="h-20 w-20 object-cover rounded-md"
                      />
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-xl font-semibold text-blue-600">{selectedBox._count?.views || 0}</div>
                  <div className="text-sm text-gray-600">查看</div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <div className="text-xl font-semibold text-green-600">{selectedBox._count?.replies || 0}</div>
                  <div className="text-sm text-gray-600">回复</div>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <div className="text-xl font-semibold text-purple-600">{selectedBox.allowReply ? '允许' : '禁止'}</div>
                  <div className="text-sm text-gray-600">回复</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setViewModal(false)}>
                关闭
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 确认操作模态框 */}
      <Modal
        isOpen={confirmModal}
        onClose={() => setConfirmModal(false)}
        title="确认操作"
      >
        <div className="p-4">
          {selectedBox && (
            <div>
              <p className="mb-4">
                {actionType === 'archive' && '确定要下架这个盲盒吗？'}
                {actionType === 'delete' && '确定要删除这个盲盒吗？此操作不可恢复。'}
                {actionType === 'featured' && '确定要将这个盲盒设为精选吗？'}
                {actionType === 'unfeatured' && '确定要取消这个盲盒的精选状态吗？'}
              </p>
              
              <div className="bg-gray-50 p-3 rounded-md mb-4">
                <p className="text-sm font-medium text-gray-900">
                  {selectedBox.title || '无标题'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedBox.content.substring(0, 100)}
                  {selectedBox.content.length > 100 ? '...' : ''}
                </p>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setConfirmModal(false)}>
                  取消
                </Button>
                <Button
                  onClick={executeAction}
                  variant={
                    actionType === 'delete' ? 'destructive' : 
                    actionType === 'archive' ? 'outline' : 'default'
                  }
                >
                  {actionType === 'archive' && '确认下架'}
                  {actionType === 'delete' && '确认删除'}
                  {actionType === 'featured' && '设为精选'}
                  {actionType === 'unfeatured' && '取消精选'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default AdminBoxes;