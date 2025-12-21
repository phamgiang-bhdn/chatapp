import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
  Fade,
  Slide
} from '@mui/material';
import { Visibility, VisibilityOff, ChatBubble } from '@mui/icons-material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.2) 0%, transparent 60%)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
          top: '-250px',
          right: '-250px',
          animation: 'float 20s ease-in-out infinite',
        },
        '@keyframes float': {
          '0%, 100%': {
            transform: 'translate(0, 0) scale(1)',
          },
          '50%': {
            transform: 'translate(-50px, 50px) scale(1.1)',
          },
        },
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={800}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 90,
                  height: 90,
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
                  boxShadow: '0 20px 60px rgba(99, 102, 241, 0.5)',
                  mb: 3,
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05) rotate(5deg)',
                  },
                }}
              >
                <ChatBubble sx={{ fontSize: 48, color: 'white' }} />
              </Box>
              <Typography
                variant="h3"
                sx={{
                  color: 'white',
                  fontWeight: 800,
                  textShadow: '0 4px 20px rgba(0,0,0,0.25)',
                  letterSpacing: '-0.02em',
                  mb: 1,
                }}
              >
                Welcome Back
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 500,
                  textShadow: '0 2px 10px rgba(0,0,0,0.15)',
                }}
              >
                Sign in to continue to your account
              </Typography>
            </Box>

            <Slide direction="up" in timeout={600}>
              <Paper
                elevation={24}
                sx={{
                  p: 5,
                  borderRadius: 4,
                  backdropFilter: 'blur(40px)',
                  background: 'rgba(255, 255, 255, 0.98)',
                  border: '1px solid rgba(99, 102, 241, 0.15)',
                  boxShadow: '0 25px 80px rgba(99, 102, 241, 0.35)',
                }}
              >
                {error && (
                  <Fade in>
                    <Alert
                      severity="error"
                      sx={{
                        mb: 3,
                        borderRadius: 3,
                        fontWeight: 600,
                        backgroundColor: 'rgba(239, 68, 68, 0.08)',
                        border: '2px solid rgba(239, 68, 68, 0.2)',
                        '& .MuiAlert-icon': {
                          fontSize: '1.5rem',
                        },
                      }}
                    >
                      {error}
                    </Alert>
                  </Fade>
                )}

                <form onSubmit={handleSubmit}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      },
                    }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Mật khẩu"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      mt: 3,
                      mb: 2,
                      py: 1.5,
                      background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
                      color: 'white',
                      fontWeight: 600,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #7B9AFF 0%, #FF8BB3 100%)',
                        boxShadow: '0 8px 24px rgba(91, 127, 255, 0.4)',
                      },
                    }}
                  >
                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  </Button>
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="body2" sx={{ color: '#0F172A', mb: 1 }}>
                      Chưa có tài khoản?
                    </Typography>
                    <Link to="/register" style={{ textDecoration: 'none' }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        sx={{
                          borderColor: '#6366F1',
                          color: '#6366F1',
                          borderWidth: 2,
                          fontWeight: 600,
                          backgroundColor: 'white',
                          '&:hover': {
                            borderColor: '#3D5FCF',
                            backgroundColor: '#F0F4FF',
                            borderWidth: 2,
                            transform: 'scale(1.02)',
                          },
                        }}
                      >
                        Đăng ký ngay
                      </Button>
                    </Link>
                  </Box>
                </form>
              </Paper>
            </Slide>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default Login;
