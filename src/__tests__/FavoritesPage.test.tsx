import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import FavoritesPage from '../pages/FavoritesPage';
import { userApi } from '../api/user';
import { favoriteApi, Favorite } from '../api/favorite';
import userEvent from "@testing-library/user-event";
import { PlayerProvider } from '../contexts/PlayerContext';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
    const actual = jest.requireActual('react-router-dom') as any;
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

// Mock PlayerContext
const mockPlaySong = jest.fn();
jest.mock('./contexts/PlayerContext', () => ({
    usePlayer: () => ({
        playerState: {
            currentSongId: null,
            isPlaying: false
        },
        playSong: mockPlaySong
    }),
    PlayerProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe('收藏页面测试', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockFavorites: Favorite[] = [
        {
            id: 1,
            song_id: 1,
            song_name: '测试歌曲1',
            artist_name: '测试歌手1',
            album_name: '测试专辑1',
            pic_url: 'http://example.com/pic1.jpg',
            created_at: new Date().toISOString()
        },
        {
            id: 2,
            song_id: 2,
            song_name: '测试歌曲2',
            artist_name: '测试歌手2',
            album_name: '测试专辑2',
            pic_url: 'http://example.com/pic2.jpg',
            created_at: new Date().toISOString()
        }
    ];

    const renderFavoritesPage = () => {
        return render(
            <BrowserRouter>
                <PlayerProvider>
                    <FavoritesPage />
                </PlayerProvider>
            </BrowserRouter>
        );
    };

    test('渲染收藏页面基本元素', async () => {
        // Mock API responses
        jest.spyOn(userApi, 'getProfile').mockResolvedValue({
            code: 200,
            data: { nickname: '测试用户', email: 'test@example.com' }
        });
        jest.spyOn(favoriteApi, 'getFavorites').mockResolvedValue({
            code: 200,
            data: mockFavorites,
            message: '获取成功'
        });

        renderFavoritesPage();

        // 验证页面标题
        await waitFor(() => {
            expect(screen.getByText('我的收藏')).toBeInTheDocument();
        });

        // 验证收藏列表
        await waitFor(() => {
            expect(screen.getByText('测试歌曲1')).toBeInTheDocument();
            expect(screen.getByText('测试歌手1')).toBeInTheDocument();
            expect(screen.getByText('测试专辑1')).toBeInTheDocument();
        });
    });

    test('空收藏列表显示', async () => {
        // Mock API responses
        jest.spyOn(userApi, 'getProfile').mockResolvedValue({
            code: 200,
            data: { nickname: '测试用户', email: 'test@example.com' }
        });
        jest.spyOn(favoriteApi, 'getFavorites').mockResolvedValue({
            code: 200,
            data: [],
            message: '获取成功'
        });

        renderFavoritesPage();

        await waitFor(() => {
            expect(screen.getByText('还没有收藏任何歌曲')).toBeInTheDocument();
        });
    });

    test('取消收藏功能', async () => {
        // Mock API responses
        jest.spyOn(userApi, 'getProfile').mockResolvedValue({
            code: 200,
            data: { nickname: '测试用户', email: 'test@example.com' }
        });
        jest.spyOn(favoriteApi, 'getFavorites').mockResolvedValue({
            code: 200,
            data: mockFavorites,
            message: '获取成功'
        });
        const toggleFavoriteSpy = jest.spyOn(favoriteApi, 'toggleFavorite').mockResolvedValue({
            message: '取消收藏成功',
            is_favorite: false
        });

        renderFavoritesPage();

        // 等待收藏列表加载
        await waitFor(() => {
            expect(screen.getByText('测试歌曲1')).toBeInTheDocument();
        });

        // 点击删除按钮
        const deleteButtons = screen.getAllByTestId('DeleteIcon');
        await userEvent.click(deleteButtons[0]);

        // 验证API调用
        await waitFor(() => {
            expect(toggleFavoriteSpy).toHaveBeenCalled();
        });
    });

}); 