import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DeleteAccountModal = ({ isOpen, onClose }) => {
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const navigate = useNavigate();

  const handleDeleteAccountConfirm = async () => {
    setDeleteError('');
    const token = localStorage.getItem('token');
    if (token && deletePassword) {
      try {
        const config = {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json',
          },
          data: { password: deletePassword },
        };
        const body = JSON.stringify({ password: deletePassword });
        await axios.delete('http://localhost:5000/api/student/profile', config);
        localStorage.removeItem('token');
        navigate('/login');
      } catch (err) {
        console.error(err.response ? err.response.data : err);
        setDeleteError(
          err.response?.data?.msg || 'Failed to delete account. Please try again.'
        );
      }
    } else {
      setDeleteError('Please enter your password to confirm.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Delete Account
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete your account? This action is irreversible.
                    You will need to enter your password to confirm.
                  </p>
                </div>
                <div className="mt-4">
                  <label
                    htmlFor="deletePassword"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Password:
                  </label>
                  <input
                    type="password"
                    id="deletePassword"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                  />
                </div>
                {deleteError && (
                  <p className="text-red-500 text-xs italic">{deleteError}</p>
                )}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={handleDeleteAccountConfirm}
            >
              Delete
            </button>
            <button
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;