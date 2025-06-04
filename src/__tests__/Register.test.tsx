import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import Register from '../pages/Register';
import { userApi } from '../api/user';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
    const actual = jest.requireActual('react-router-dom') as any;
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

describe('注册页面测试', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderRegister = () => {
        return render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );
    };

    test('渲染注册表单', () => {
        renderRegister();
        expect(screen.getByText('WHY Music')).toBeInTheDocument();
        expect(screen.getByText('创建您的账号')).toBeInTheDocument();
        expect(screen.getByLabelText(/昵称/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/邮箱/i)).toBeInTheDocument();
        const passwordInputs = screen.getAllByLabelText(/密码/i);
        expect(passwordInputs[0]).toBeInTheDocument();
        expect(passwordInputs[1]).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /注册/i })).toBeInTheDocument();
    });


    // 验证输入框的错误状态
    await waitFor(() => {
        const nicknameInput = screen.getByLabelText(/昵称/i);
        const emailInput = screen.getByLabelText(/邮箱/i);
        const passwordInputs = screen.getAllByLabelText(/密码/i);

        // 检查所有输入框是否显示为错误状态
        expect(nicknameInput.closest('.MuiInputBase-root')).toHaveClass('Mui-error');
        expect(emailInput.closest('.MuiInputBase-root')).toHaveClass('Mui-error');
        expect(passwordInputs[0].closest('.MuiInputBase-root')).toHaveClass('Mui-error');
        expect(passwordInputs[1].closest('.MuiInputBase-root')).toHaveClass('Mui-error');
    });
});

    test('密码不匹配验证', async () => {
        renderRegister();
        
        // 填写表单数据
        fireEvent.change(screen.getByLabelText(/昵称/i), {
            target: { value: '测试用户' }
        });
        fireEvent.change(screen.getByLabelText(/邮箱/i), {
            target: { value: 'test@example.com' }
        });
        const passwordInputs = screen.getAllByLabelText(/密码/i);
        fireEvent.change(passwordInputs[0], {
            target: { value: 'password123' }
        });
        fireEvent.change(passwordInputs[1], {
            target: { value: 'password456' }
        });

        // 提交表单
        fireEvent.click(screen.getByRole('button', { name: /注册/i }));

        // 验证前端密码不匹配错误
        await waitFor(() => {
            expect(screen.getByText('注册请求失败: 两次输入的密码不一致')).toBeInTheDocument();
        });
    });

    test('注册成功流程', async () => {
        const registerSpy = jest.spyOn(userApi, 'register').mockResolvedValue({
            code: 200, message: '注册成功'});

        renderRegister();

        await userEvent.type(screen.getByLabelText(/昵称/i), '测试用户')
        await userEvent.type(screen.getByLabelText(/邮箱/i), 'test@example.com')

        const passwordInputs = screen.getAllByLabelText(/密码/i)
        await userEvent.type(passwordInputs[0], 'Password123!')
        await userEvent.type(passwordInputs[1], 'Password123!')

        await userEvent.click(screen.getByRole('button', { name: /注册/i }));

        await waitFor(() => {
            expect(registerSpy).toHaveBeenCalled();
        });
    });

    test('密码强度检测', () => {
        renderRegister();
        const passwordInputs = screen.getAllByLabelText(/密码/i);
        fireEvent.change(passwordInputs[0], {
            target: { value: '123' }
        });
        expect(screen.getByText(/密码强度: 弱/i)).toBeInTheDocument();
        fireEvent.change(passwordInputs[0], {
            target: { value: 'Password123' }
        });
        expect(screen.getByText(/密码强度: 中等/i)).toBeInTheDocument();
        fireEvent.change(passwordInputs[0], {
            target: { value: 'Password123!@#' }
        });
        expect(screen.getByText(/密码强度: 强/i)).toBeInTheDocument();
    });

    test('密码可见性切换', async () => {
        renderRegister();
        const passwordInputs = screen.getAllByLabelText(/密码/i);
        const toggleButtons = screen.getAllByTestId('VisibilityIcon').map(icon => icon.closest('button'));
        expect(passwordInputs[0]).toHaveAttribute('type', 'password');
        expect(passwordInputs[1]).toHaveAttribute('type', 'password');
        fireEvent.click(toggleButtons[0]!);
        await waitFor(() => {
            expect(passwordInputs[0]).toHaveAttribute('type', 'text');
        });
        fireEvent.click(toggleButtons[1]!);
        await waitFor(() => {
            expect(passwordInputs[1]).toHaveAttribute('type', 'password');
        });
    });

}); 
