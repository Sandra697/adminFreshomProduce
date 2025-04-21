"use client"
import { useState, useEffect } from 'react';

// Define the User type based on your Prisma schema
interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: 'ADMIN' | 'CUSTOMER';
  createdAt: string;
  updatedAt: string;
}

// Define pagination type
interface PaginationState {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

// Define API response type
interface UsersResponse {
  users: User[];
  pagination: PaginationState;
}

export default function MembersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    total: 0,
    pages: 0,
    page: 1,
    limit: 10
  });

  // States for view modal
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // States for delete confirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Call the API endpoint with pagination parameters
        const response = await fetch(`/api/users?page=${pagination.page}&limit=${pagination.limit}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch members');
        }
        
        const data: UsersResponse = await response.json();
        
        setUsers(data.users);
        setPagination(data.pagination);
      } catch (err) {
        setError('Failed to load members');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [pagination.page, pagination.limit]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(e.target.value, 10);
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  // Handle view user details
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  // Handle opening delete confirmation
  const handleOpenDeleteModal = (user: User) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  // Handle actual deletion
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setDeleteLoading(true);
      setDeleteError(null);
      
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      
      // Remove the deleted user from the state
      setUsers(users.filter(user => user.id !== userToDelete.id));
      
      // Close the delete modal
      setDeleteModalOpen(false);
      setUserToDelete(null);
      
      // Adjust pagination if necessary (e.g., if the last item on the last page is deleted)
      if (users.length === 1 && pagination.page > 1) {
        setPagination(prev => ({ ...prev, page: prev.page - 1 }));
      } else {
        // Just refetch the current page
        const updatedResponse = await fetch(`/api/users?page=${pagination.page}&limit=${pagination.limit}`);
        const updatedData: UsersResponse = await updatedResponse.json();
        setUsers(updatedData.users);
        setPagination(updatedData.pagination);
      }
    } catch (err) {
      setDeleteError('Failed to delete user. Please try again.');
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setSelectedUser(null);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setUserToDelete(null);
    setDeleteError(null);
  };

  if (loading) return <div className="flex justify-center p-8">Loading members...</div>;
  if (error) return <div className="text-red-500 p-4 text-center">{error}</div>;

  return (
    <div className="container mx-auto sm:p-6 p-4 sm:pt-8">
      <h1 className="text-[0.9rem] font-bold mb-6">Members List</h1>
      
      {/* Filter/Search Controls */}
      <div className="mb-4 flex justify-between items-center">
        <div>
          <label htmlFor="limit" className="mr-2">Show:</label>
          <select 
            id="limit" 
            value={pagination.limit} 
            onChange={handleLimitChange}
            className="border rounded p-1 text-[0.75rem] bg-white"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        
        <div>
          <input 
            type="text" 
            placeholder="Search members..." 
            className="shadow-md text-[0.75rem] rounded p-2 w-64 placeholder:text-[0.75rem] bg-white"
          />
        </div>
      </div>
      
      {/* Members Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 text-[0.75rem]">
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.phone || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-[0.75rem] font-medium">
                    <button 
                      onClick={() => handleViewUser(user)}
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => handleOpenDeleteModal(user)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-[0.75rem] text-gray-500">
                  No members found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-[0.75rem] text-gray-700">
          Showing <span className="font-medium">{pagination.total > 0 ? ((pagination.page - 1) * pagination.limit) + 1 : 0}</span> to{' '}
          <span className="font-medium">
            {Math.min(pagination.page * pagination.limit, pagination.total)}
          </span>{' '}
          of <span className="font-medium">{pagination.total}</span> members
        </div>
        
        <div className="flex justify-end space-x-1">
          <button
            onClick={() => handlePageChange(1)}
            disabled={pagination.page === 1}
            className={`relative inline-flex items-center px-4 py-2 border text-[0.75rem] font-medium rounded-md ${
              pagination.page === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            First
          </button>
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className={`relative inline-flex items-center px-4 py-2 border text-[0.75rem] font-medium rounded-md ${
              pagination.page === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          
          {/* Page numbers */}
          <div className="hidden md:flex">
            {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
              // Logic for showing appropriate page numbers
              let pageNum;
              if (pagination.pages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.pages - 2) {
                pageNum = pagination.pages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }
              
              if (pageNum <= pagination.pages) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 border text-[0.75rem] font-medium rounded-md ${
                      pagination.page === pageNum
                        ? 'bg-[#B17F59] text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
              return null;
            })}
          </div>
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className={`relative inline-flex items-center px-4 py-2 border text-[0.75rem] font-medium rounded-md ${
              pagination.page === pagination.pages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Next
          </button>
          <button
            onClick={() => handlePageChange(pagination.pages)}
            disabled={pagination.page === pagination.pages}
            className={`relative inline-flex items-center px-4 py-2 border text-[0.75rem] font-medium rounded-md ${
              pagination.page === pagination.pages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Last
          </button>
        </div>
      </div>

      {/* View User Modal */}
      {viewModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[0.9rem] font-semibold text-[#B17F59]">User Details</h2>
              <button 
                onClick={closeViewModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[0.75rem] font-medium text-gray-600">Name</label>
                <div className="mt-1 text-[0.75rem] text-gray-900">{selectedUser.name}</div>
              </div>
              <div>
                <label className="block text-[0.75rem] font-medium text-gray-600">Email</label>
                <div className="mt-1 text-[0.75rem] text-gray-900">{selectedUser.email}</div>
              </div>
              <div>
                <label className="block text-[0.75rem] font-medium text-gray-600">Phone</label>
                <div className="mt-1 text-[0.75rem] text-gray-900">{selectedUser.phone || 'N/A'}</div>
              </div>
              <div>
                <label className="block text-[0.75rem] font-medium text-gray-600">Address</label>
                <div className="mt-1 text-[0.75rem] text-gray-900">{selectedUser.address || 'N/A'}</div>
              </div>
              <div>
                <label className="block text-[0.75rem] font-medium text-gray-600">Role</label>
                <div className="mt-1">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    selectedUser.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {selectedUser.role}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-[0.75rem] font-medium text-gray-600">Joined</label>
                <div className="mt-1 text-[0.75rem] text-gray-900">
                  {new Date(selectedUser.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div>
                <label className="block text-[0.75rem] font-medium text-gray-600">Last Updated</label>
                <div className="mt-1 text-[0.75rem] text-gray-900">
                  {new Date(selectedUser.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={closeViewModal}
                className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-[0.75rem] font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#FAF1E6] rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[0.9rem] font-semibold text-gray-800">Confirm Delete</h2>
              <button 
                onClick={closeDeleteModal}
                className="text-gray-500 hover:text-gray-700"
                disabled={deleteLoading}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </button>
            </div>
            <div className="mb-6">
              <p className="text-[0.75rem] text-gray-700">
                Are you sure you want to delete the user <span className="font-semibold">{userToDelete.name}</span>? This action cannot be undone.
              </p>
              {deleteError && (
                <div className="mt-4 text-[0.75rem] text-red-600">
                  {deleteError}
                </div>
              )}
            </div>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={closeDeleteModal}
                disabled={deleteLoading}
                className="inline-flex justify-center rounded-md mr-3 shadow-md border-gray-300  px-4 py-2 bg-white text-[0.75rem] font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deleteLoading}
                className="inline-flex justify-center shadow-md rounded-md border border-transparent ml-3 px-4 py-2 bg-red-600 text-[0.75rem] font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {deleteLoading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}