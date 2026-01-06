import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { AdminLayout } from './AdminLayout';
import { adminService } from '@/services/adminService';
import { replyService } from '@/services/replyService';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { Reply, EmotionBox, User } from '@/types';

const AdminReplies: React.FC = () => {
  const [replies, setReplies] = useState<Reply[]>([]);
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
    minLikes: '',
    boxId: '',
    userId: ''
  });
  const [selectedReply, setSelectedReply] = useState<Reply | null>(null);
  const [viewModal, setViewModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [tempSearch, setTempSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // 加载回复列表
  const loadReplies = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAdminReplies({
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status || undefined,
        search: filters.search || undefined,
        minLikes: filters.minLikes ? parseInt(filters.minLikes) : undefined,
        boxId: filters.boxId || undefined,
        userId: filters.userId || undefined
      });

      if (response.success) {
        setReplies(response.data.replies || []);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('加载回复列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReplies();
  }, [pagination.page, filters.status, filters.search, filters.minLikes, filters.boxId, filters.userId, refreshKey]);

  // 查看回复详情
  const viewReply = async (reply: Reply) => {
    try {
      // 直接使用当前reply数据，避免重复请求
      setSelectedReply(reply);
      setViewModal(true);
    } catch (error) {
      console.error('获取回复详情失败:', error);
      setSelectedReply(reply);
      setViewModal(true);
    }
  };

  // 删除回复
  const deleteReply = async () => {
    if (!selectedReply) return;

    try {
      const response = await adminService.deleteReply(selectedReply.id);
      if (response.success) {
        setConfirmModal(false);
        setSelectedReply(null);
        setRefreshKey(prev => prev + 1);
      }
    } catch (error) {
      console.error('删除回复失败:', error);
    }
  };

  // 打开确认模态框
  const openConfirmModal = (reply: Reply) => {
    setSelectedReply(reply);
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
      DELETED: { text: '已删除', className: 'bg-red-100 text-red-800' }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || statusMap.ACTIVE;
    return <span className={`px-2 py-1 text-xs rounded-full ${config.className}`}>{config.text}</span>;
  };

  if (loading) {
    return (
      <AdminLayout title="回复管理">
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="回复管理">
      <Card className="mb-6">
        <div className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex flex-wrap gap-2">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">所有状态</option>
                <option value="ACTIVE">活跃</option>
                <option value="DELETED">已删除</option>
              </select>
              
              <Input
                type="number"
                placeholder="最少点赞数"
                value={filters.minLikes}
                onChange={(e) => setFilters(prev => ({ ...prev, minLikes: e.target.value, page: 1 }))}
                className="w-32"
              />
              
              <Input
                type="text"
                placeholder="盲盒ID"
                value={filters.boxId}
                onChange={(e) => setFilters(prev => ({ ...prev, boxId: e.target.value, page: 1 }))}
                className="w-32"
              />
              
              <Input
                type="text"
                placeholder="用户ID"
                value={filters.userId}
                onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value, page: 1 }))}
                className="w-32"
              />
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索回复内容..."
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
                  回复内容
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  回复者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  关联盲盒
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
              {replies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    暂无回复数据
                  </td>
                </tr>
              ) : (
                replies.map((reply) => (
                  <tr key={reply.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm text-gray-900 truncate">
                          {reply.content.substring(0, 50)}{reply.content.length > 50 ? '...' : ''}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {reply.user?.username || reply.user?.anonymousName || '未知用户'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {reply.user?.isAnonymous ? '匿名' : '实名'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {reply.box?.title || '无标题'}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {reply.boxId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(reply.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>点赞: {reply._count?.likes || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDistanceToNow(new Date(reply.createdAt), { 
                        addSuffix: true, 
                        locale: zhCN 
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => viewReply(reply)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        查看
                      </button>
                      
                      {reply.status === 'ACTIVE' && (
                        <button
                          onClick={() => openConfirmModal(reply)}
                          className="text-red-600 hover:text-red-900"
                        >
                          删除
                        </button>
                      )}
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

      {/* 查看回复详情模态框 */}
      <Modal
        isOpen={viewModal}
        onClose={() => setViewModal(false)}
        title="回复详情"
        size="lg"
      >
        {selectedReply && (
          <div>
            <div className="mb-4">
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <span>回复者: {selectedReply.user?.username || selectedReply.user?.anonymousName || '未知用户'}</span>
                <span>状态: {getStatusBadge(selectedReply.status).props.children}</span>
                <span>点赞数: {selectedReply._count?.likes || 0}</span>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-800 whitespace-pre-wrap">{selectedReply.content}</p>
              </div>
              
              {selectedReply.box && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">关联盲盒:</h4>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-medium text-gray-900">
                      {selectedReply.box.title || '无标题'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedReply.box.content.substring(0, 100)}
                      {selectedReply.box.content.length > 100 ? '...' : ''}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-xl font-semibold text-blue-600">{selectedReply._count?.likes || 0}</div>
                  <div className="text-sm text-gray-600">点赞</div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <div className="text-xl font-semibold text-green-600">
                    {formatDistanceToNow(new Date(selectedReply.createdAt), { 
                      addSuffix: false, 
                      locale: zhCN 
                    })}
                  </div>
                  <div className="text-sm text-gray-600">发布时间</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setViewModal(false)}>
                关闭
              </Button>
              {selectedReply.status === 'ACTIVE' && (
                <Button
                  variant="danger"
                  onClick={() => {
                    setViewModal(false);
                    openConfirmModal(selectedReply);
                  }}
                >
                  删除回复
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* 确认删除模态框 */}
      <Modal
        isOpen={confirmModal}
        onClose={() => setConfirmModal(false)}
        title="确认删除"
      >
        <div className="p-4">
          {selectedReply && (
            <div>
              <p className="mb-4">
                确定要删除这条回复吗？此操作不可恢复。
              </p>
              
              <div className="bg-gray-50 p-3 rounded-md mb-4">
                <p className="text-sm text-gray-900">
                  {selectedReply.content.substring(0, 100)}
                  {selectedReply.content.length > 100 ? '...' : ''}
                </p>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setConfirmModal(false)}>
                  取消
                </Button>
                <Button variant="danger" onClick={deleteReply}>
                  确认删除
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default AdminReplies;