import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import { adminAPI } from '../api/api';
import { LuSearch, LuUser, LuBookOpen, LuGraduationCap } from 'react-icons/lu';

const AdminDashboard = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data States
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [stats, setStats] = useState({ users: 0, projects: 0, faculties: 0 });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    } else if (!loading && user?.role !== 'admin') {
      navigate('/');
    }
  }, [loading, isAuthenticated, user, navigate]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoadingData(true);
    try {
      if (activeTab === 'overview' || activeTab === 'users') {
        const usersRes = await adminAPI.getAllUsers();
        setUsers(usersRes.data.data);
      }
      
      if (activeTab === 'overview' || activeTab === 'projects') {
        const projectsRes = await adminAPI.getAllProjects();
        setProjects(projectsRes.data.data);
      }
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      // Refresh user list
      const usersRes = await adminAPI.getAllUsers();
      setUsers(usersRes.data.data);
      alert('User role updated successfully');
    } catch (error) {
      console.error('Failed to update role:', error);
      alert('Failed to update user role');
    }
  };

  // Derived Data
  const uniqueFaculties = [...new Set(users.map(u => u.faculty).filter(Boolean))];
  const uniqueDepartments = [...new Set(users.map(u => u.department).filter(Boolean))];

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  const renderOverview = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-neutral-800">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
              <LuUser className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
          </div>
          <p className="text-sm text-neutral-500">Total Users</p>
          <p className="text-3xl font-bold text-neutral-900">{users.length}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
              <LuBookOpen className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm text-neutral-500">Total Projects</p>
          <p className="text-3xl font-bold text-neutral-900">{projects.length}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
              <LuGraduationCap className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm text-neutral-500">Faculties</p>
          <p className="text-3xl font-bold text-neutral-900">{uniqueFaculties.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Recent Users</h3>
          <div className="overflow-hidden">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-2 font-medium text-neutral-600">Name</th>
                  <th className="px-4 py-2 font-medium text-neutral-600">Role</th>
                  <th className="px-4 py-2 font-medium text-neutral-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {users.slice(0, 5).map(u => (
                  <tr key={u._id}>
                    <td className="px-4 py-3 font-medium text-neutral-900">{u.name}</td>
                    <td className="px-4 py-3 text-neutral-500 capitalize">{u.role}</td>
                    <td className="px-4 py-3 text-neutral-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Recent Projects</h3>
          <div className="overflow-hidden">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-2 font-medium text-neutral-600">Topic</th>
                  <th className="px-4 py-2 font-medium text-neutral-600">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {projects.slice(0, 5).map(p => (
                  <tr key={p._id}>
                    <td className="px-4 py-3 font-medium text-neutral-900 truncate max-w-xs" title={p.topic}>
                      {p.topic}
                    </td>
                    <td className="px-4 py-3 text-neutral-500">{p.user?.name || 'Unknown'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-neutral-800">User Management</h2>
        <div className="relative">
           {/* Search placeholder */}
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 font-medium text-neutral-600">Name</th>
                <th className="px-6 py-3 font-medium text-neutral-600">Email</th>
                <th className="px-6 py-3 font-medium text-neutral-600">Faculty/Dept</th>
                <th className="px-6 py-3 font-medium text-neutral-600">Role</th>
                <th className="px-6 py-3 font-medium text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 font-medium text-neutral-900">{u.name}</td>
                  <td className="px-6 py-4 text-neutral-500">{u.email}</td>
                  <td className="px-6 py-4 text-neutral-500">
                    <div className="flex flex-col">
                      <span>{u.faculty}</span>
                      <span className="text-xs text-neutral-400">{u.department}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                        u.role === 'lecturer' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={u.role}
                      onChange={(e) => updateUserRole(u._id, e.target.value)}
                      className="text-xs border border-neutral-300 rounded px-2 py-1 focus:ring-2 focus:ring-primary-500 outline-none"
                      disabled={u._id === user._id} // Cannot change own role
                    >
                      <option value="student">Student</option>
                      <option value="lecturer">Lecturer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-neutral-800">All Projects</h2>
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 font-medium text-neutral-600">Topic</th>
                <th className="px-6 py-3 font-medium text-neutral-600">Student</th>
                <th className="px-6 py-3 font-medium text-neutral-600">Department</th>
                <th className="px-6 py-3 font-medium text-neutral-600">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {projects.map(p => (
                <tr key={p._id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 font-medium text-neutral-900 max-w-md truncate" title={p.topic}>{p.topic}</td>
                  <td className="px-6 py-4 text-neutral-500">{p.user?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 text-neutral-500">{p.department}</td>
                  <td className="px-6 py-4 text-neutral-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderFaculties = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-neutral-800">Faculties & Departments</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Active Faculties ({uniqueFaculties.length})</h3>
          <ul className="space-y-2">
            {uniqueFaculties.map((f, i) => (
              <li key={i} className="flex items-center gap-2 p-2 hover:bg-neutral-50 rounded">
                <LuGraduationCap className="text-neutral-400" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Active Departments ({uniqueDepartments.length})</h3>
          <ul className="space-y-2">
            {uniqueDepartments.map((d, i) => (
              <li key={i} className="flex items-center gap-2 p-2 hover:bg-neutral-50 rounded">
                <LuBookOpen className="text-neutral-400" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      <AdminSidebar 
        collapsed={isSidebarCollapsed} 
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {isLoadingData ? (
             <div className="text-center py-10 text-neutral-500">Loading data...</div>
          ) : (
            <>
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'users' && renderUsers()}
              {activeTab === 'projects' && renderProjects()}
              {activeTab === 'faculties' && renderFaculties()}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

