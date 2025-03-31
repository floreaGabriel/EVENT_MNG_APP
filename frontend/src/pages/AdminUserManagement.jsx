import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../services/api.service';

/**
 * Componenta pentru gestionarea utilizatorilor de către administrator
 * Permite listarea, filtrarea, editarea și ștergerea utilizatorilor
 */
const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    page: 1
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0
  });

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getUsers(filters);
      setUsers(response.data || []);
      setPagination({
        currentPage: response.pagination?.page || 1,
        totalPages: response.pagination?.pages || 1,
        totalUsers: response.pagination?.total || 0
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleRoleFilter = (e) => {
    setFilters(prev => ({ ...prev, role: e.target.value, page: 1 }));
  };

  const handleStatusFilter = (e) => {
    setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminApi.deleteUser(userId);
        // Reîncarcă lista de utilizatori după ștergere
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const handleChangeStatus = async (userId, newStatus) => {
    try {
      await adminApi.changeUserStatus(userId, newStatus);
      // Actualizează starea locală fără a reîncărca toți utilizatorii
      setUsers(users.map(user => {
        if (user._id === userId) {
          return { ...user, status: newStatus };
        }
        return user;
      }));
    } catch (error) {
      console.error('Error changing user status:', error);
      alert('Failed to update user status. Please try again.');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">
            View, edit, and manage user accounts on your platform.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search Users
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by name or email"
                value={filters.search}
                onChange={handleSearch}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div className="w-full md:w-1/4">
              <label htmlFor="roleFilter" className="block text-sm font-medium text-gray-700">
                Filter by Role
              </label>
              <select
                id="roleFilter"
                value={filters.role}
                onChange={handleRoleFilter}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="ORGANIZER">Organizer</option>
                <option value="PARTICIPANT">Participant</option>
              </select>
            </div>
            <div className="w-full md:w-1/4">
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700">
                Filter by Status
              </label>
              <select
                id="statusFilter"
                value={filters.status}
                onChange={handleStatusFilter}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="UNVERIFIED">Unverified</option>
              </select>
            </div>
          </div>
        </div>

        {/* Create new user button */}
        <div className="mb-6 flex justify-end">
          <Link
            to="/admin/users/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New User
          </Link>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md text-red-700">{error}</div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {users.length === 0 ? (
              <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
                No users found matching your criteria.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {users.map((user) => (
                  <li key={user._id} className="px-0">
                    <div className="flex items-center justify-between px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {user.profileImage ? (
                            <img
                              className="h-12 w-12 rounded-full object-cover"
                              src={user.profileImage}
                              alt={`${user.firstname} ${user.lastname}`}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-lg">
                              {user.firstname?.charAt(0).toUpperCase()}
                              {user.lastname?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstname} {user.lastname}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400">
                            Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="mr-8">
                          <div className="flex space-x-2">
                            {user.roles && user.roles.map(role => (
                              <span 
                                key={role} 
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 
                                  role === 'ORGANIZER' ? 'bg-green-100 text-green-800' : 
                                  'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                          <div className="mt-1">
                            <span 
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                                user.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' : 
                                user.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' : 
                                'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {user.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                              handleChangeStatus(user._id, newStatus);
                            }}
                            className="text-gray-400 hover:text-gray-500"
                            title={user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d={user.status === 'ACTIVE' 
                                  ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" 
                                  : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"} 
                              />
                            </svg>
                          </button>
                          
                          <Link
                            to={`/admin/users/${user._id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(pagination.currentPage - 1) * 10 + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(pagination.currentPage * 10, pagination.totalUsers)}
                      </span>{' '}
                      of <span className="font-medium">{pagination.totalUsers}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          pagination.currentPage === 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      {/* Generate page buttons */}
                      {[...Array(pagination.totalPages).keys()].map((_, index) => {
                        const pageNumber = index + 1;
                        // Only show current page, first/last page, and pages close to current
                        if (
                          pageNumber === 1 ||
                          pageNumber === pagination.totalPages ||
                          (pageNumber >= pagination.currentPage - 1 && pageNumber <= pagination.currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => handlePageChange(pageNumber)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                pageNumber === pagination.currentPage
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        }
                        
                        // Add ellipsis for skipped pages
                        if (
                          (pageNumber === 2 && pagination.currentPage > 3) ||
                          (pageNumber === pagination.totalPages - 1 && pagination.currentPage < pagination.totalPages - 2)
                        ) {
                          return (
                            <span
                              key={`ellipsis-${pageNumber}`}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                            >
                              ...
                            </span>
                          );
                        }
                        
                        return null;
                      })}
                      
                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          pagination.currentPage === pagination.totalPages
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserManagement; 