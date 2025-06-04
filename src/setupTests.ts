import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// 模拟 window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// 模拟 ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
})) as any;

// 模拟 userApi
const mockLogin = jest.fn();
const mockRegister = jest.fn();
const mockLogout = jest.fn();
const mockChangePassword = jest.fn();
const mockGetProfile = jest.fn();
const mockUpdateProfile = jest.fn();

// 导出 mock 函数以便在测试中使用
export const mockUserApi = {
    login: mockLogin,
    register: mockRegister,
    logout: mockLogout,
    changePassword: mockChangePassword,
    getProfile: mockGetProfile,
    updateProfile: mockUpdateProfile,
};

jest.mock('./api/user', () => ({
    userApi: mockUserApi
})); 