
import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-4">Employees</h2>
            <div className="text-3xl font-bold text-blue-600">24</div>
            <p className="text-gray-500 mt-2">Total employees</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-4">Departments</h2>
            <div className="text-3xl font-bold text-green-600">5</div>
            <p className="text-gray-500 mt-2">Active departments</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-4">Roles</h2>
            <div className="text-3xl font-bold text-purple-600">12</div>
            <p className="text-gray-500 mt-2">Job roles</p>
          </div>
        </div>
        
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="border-b pb-4">
              <p className="font-medium">New employee added</p>
              <p className="text-sm text-gray-500">John Doe - Software Developer</p>
              <p className="text-xs text-gray-400 mt-1">Today, 10:30 AM</p>
            </div>
            <div className="border-b pb-4">
              <p className="font-medium">Department updated</p>
              <p className="text-sm text-gray-500">Engineering - Added new manager</p>
              <p className="text-xs text-gray-400 mt-1">Yesterday, 4:15 PM</p>
            </div>
            <div>
              <p className="font-medium">Role created</p>
              <p className="text-sm text-gray-500">Product Manager - Marketing Department</p>
              <p className="text-xs text-gray-400 mt-1">Jul 12, 2023, 11:20 AM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
