import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Box, Typography } from '@mui/material';
import { Home, MusicNote, Favorite, History, Settings } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    const navigate = useNavigate();
    const menuItems = [
        { text: '首页', icon: <Home />, path: '/' },
        { text: '发现音乐', icon: <MusicNote />, path: '/discover' },
        { text: '我的收藏', icon: <Favorite />, path: '/favorites' },
        { text: '播放历史', icon: <History />, path: '/history' },
        { text: '设置', icon: <Settings />, path: '/settings' },
    ];

    return (
        <Drawer
            variant="temporary"
            open={open}
            onClose={onClose}
            sx={{
                '& .MuiDrawer-paper': {
                    width: 240,
                    boxSizing: 'border-box',
                    bgcolor: '#f8f9fa',
                },
            }}
        >
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    WHY Music
                </Typography>
            </Box>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <ListItem
                        key={item.text}
                        onClick={() => {
                            navigate(item.path);
                            onClose();
                        }}
                        sx={{
                            '&:hover': {
                                bgcolor: 'rgba(0, 0, 0, 0.04)',
                            },
                        }}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
            </List>
        </Drawer>
    );
};

export default Sidebar; 