import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import Login from '../pages/Login';
import { userApi } from '../api/user';
import userEvent from "@testing-library/user-event";


// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
    const actual = jest.requireActual('react-router-dom') as any;
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});


describe('登录页面测试', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderLogin = () => {
        return render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );
    };

    test('渲染登录表单', () => {
        renderLogin();
        expect(screen.getByText('欢迎来到')).toBeInTheDocument();
        expect(screen.getByText('WHY Music')).toBeInTheDocument();
        expect(screen.getByLabelText(/邮箱/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/密码/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /登录/i })).toBeInTheDocument();
    });


    test('登录成功流程', async () => {
        // 设置mock返回值
        const loginSpy = jest.spyOn(userApi, 'login').mockResolvedValue({
            token:"user_token", user_id:"test", code: 200, message: '登录成功'});

        renderLogin();

        // 填写表单
        const loginButton = screen.getByRole('button', { name: /登录/i });

        await userEvent.type(screen.getByLabelText(/邮箱/i),'test@example.com');
        await userEvent.type(screen.getByLabelText(/密码/i), 'Password123!');
        // 提交表单
        await userEvent.click(loginButton);

        // 验证API调用
        await waitFor(() => {
            expect(loginSpy).toHaveBeenCalled();
        });

        // 验证成功消息
        await waitFor(() => {
            expect(screen.getByText(/登录成功/i)).toBeInTheDocument();
        });

    });

    test('登录失败流程', async () => {
        // 设置mock返回值
        const loginError = jest.spyOn(userApi, 'login').mockRejectedValue({
            code: 40003, message: '邮箱或密码错误'

        });

        renderLogin();

        // 填写表单
        const emailInput = screen.getByLabelText(/邮箱/i);
        const passwordInput = screen.getByLabelText(/密码/i);
        const loginButton = screen.getByRole('button', { name: /登录/i });

        await userEvent.type(emailInput, 'test@example.com')
        await userEvent.type(passwordInput, 'wrongpassword');

        await userEvent.click(loginButton);

        // 验证错误消息
        await waitFor(() => {
            expect(loginError).toHaveBeenCalled();
        });
    });

    test('密码可见性切换', async () => {
        renderLogin();

        const passwordInput = screen.getByLabelText(/密码/i);
        const toggleButton = screen.getAllByTestId('VisibilityIcon')[0].closest('button');

        expect(passwordInput).toHaveAttribute('type', 'password');
        fireEvent.click(toggleButton!);
        await waitFor(() => {
            expect(passwordInput).toHaveAttribute('type', 'text');
        });
        fireEvent.click(toggleButton!);
        await waitFor(() => {
            expect(passwordInput).toHaveAttribute('type', 'password');
        });
    });
});
