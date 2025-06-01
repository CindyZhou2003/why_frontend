import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import Register from '../pages/Register';
import { mockUserApi } from '../setupTests';

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

    test('表单验证 - 空字段', async () => {
    renderRegister();
    
    // 点击注册按钮
    fireEvent.click(screen.getByRole('button', { name: /注册/i }));

    // 等待并验证错误提示
    await waitFor(() => {
        // 使用正则表达式使匹配更灵活
        const errorAlert = screen.getByRole('alert');
        expect(errorAlert).toHaveTextContent(/请填写所有必填字段/i);
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
        // Mock setTimeout
        jest.useFakeTimers();
        
        // Mock 后端成功响应
        mockUserApi.register.mockResolvedValueOnce({
            code: 200,
            message: '注册成功'
        });

        renderRegister();

        // 填写有效的表单数据
        fireEvent.change(screen.getByLabelText(/昵称/i), {
            target: { value: '测试用户' }
        });
        fireEvent.change(screen.getByLabelText(/邮箱/i), {
            target: { value: 'test@example.com' }
        });
        const passwordInputs = screen.getAllByLabelText(/密码/i);
        fireEvent.change(passwordInputs[0], {
            target: { value: 'Password123!' }
        });
        fireEvent.change(passwordInputs[1], {
            target: { value: 'Password123!' }
        });

        // 提交表单
        fireEvent.click(screen.getByRole('button', { name: /注册/i }));

        // 验证 API 调用参数
        await waitFor(() => {
            expect(mockUserApi.register).toHaveBeenCalledWith({
                nickname: '测试用户',
                email: 'test@example.com',
                password: 'Password123!',
                confirmPassword: 'Password123!'
            });
        });

        // 验证成功提示
        await waitFor(() => {
            expect(screen.getByText('注册成功！正在跳转到登录页面...')).toBeInTheDocument();
        });

        // 执行所有定时器
        jest.runAllTimers();

        // 验证导航
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });

        // 恢复真实定时器
        jest.useRealTimers();
    });

    test('注册失败 - 后端验证错误', async () => {
        // Mock 后端验证错误响应
        mockUserApi.register.mockRejectedValueOnce({
            response: {
                data: {
                    code: 40004,
                    message: '数据验证失败',
                    errors: {
                        email: ['该邮箱已被注册']
                    }
                }
            }
        });

        renderRegister();
        
        // 填写表单
        fireEvent.change(screen.getByLabelText(/昵称/i), {
            target: { value: '测试用户' }
        });
        fireEvent.change(screen.getByLabelText(/邮箱/i), {
            target: { value: 'existing@example.com' }
        });
        const passwordInputs = screen.getAllByLabelText(/密码/i);
        fireEvent.change(passwordInputs[0], {
            target: { value: 'Password123!' }
        });
        fireEvent.change(passwordInputs[1], {
            target: { value: 'Password123!' }
        });

        // 提交表单
        fireEvent.click(screen.getByRole('button', { name: /注册/i }));

        // 验证错误提示
        await waitFor(() => {
            expect(screen.getByText(/注册请求失败: 数据验证失败: 该邮箱已被注册/i)).toBeInTheDocument();
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

    test('密码可见性切换', () => {
    renderRegister();
    const passwordInputs = screen.getAllByLabelText(/密码/i);

    // 获取所有按钮，假设前面只有一个“注册”按钮，后面两个是密码可见性按钮
    const allButtons = screen.getAllByRole('button');
    // 通常第一个是“注册”，后面两个是切换按钮
    const toggleButtons = allButtons.slice(-2);

    fireEvent.click(toggleButtons[0]);
    expect(passwordInputs[0]).toHaveAttribute('type', 'text');

    fireEvent.click(toggleButtons[1]);
    expect(passwordInputs[1]).toHaveAttribute('type', 'text');
});

    test('表单验证', async () => {
        renderRegister();
        const submitButton = screen.getByRole('button', { name: /注册/i });
        fireEvent.click(submitButton);

        // 查找错误提示
        const errorAlert = await screen.findByTestId('register-error-alert');
        expect(errorAlert).toHaveTextContent(/注册请求失败: 请填写所有必填字段/);

        // 断言输入框的错误状态
        const nicknameInput = screen.getByLabelText(/昵称/i);
        const emailInput = screen.getByLabelText(/邮箱/i);
        const passwordInputs = screen.getAllByLabelText(/密码/i);

        expect(nicknameInput.closest('.MuiInputBase-root')).toHaveClass('Mui-error');
        expect(emailInput.closest('.MuiInputBase-root')).toHaveClass('Mui-error');
        expect(passwordInputs[0].closest('.MuiInputBase-root')).toHaveClass('Mui-error');
        expect(passwordInputs[1].closest('.MuiInputBase-root')).toHaveClass('Mui-error');
    });
}); 
