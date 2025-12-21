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
import { Visibility, VisibilityOff, PersonAdd } from '@mui/icons-material';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
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
        background: 'linear-gradient(135deg, #EC4899 0%, #6366F1 50%, #764BA2 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.2) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(91, 127, 255, 0.2) 0%, transparent 50%)',
        }
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={800}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #EC4899 0%, #6366F1 100%)',
                  boxShadow: '0 8px 32px rgba(255, 107, 157, 0.4)',
                  mb: 2,
                }}
              >
                <PersonAdd sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Typography
                variant="h4"
                sx={{
                  color: 'white',
                  fontWeight: 700,
                  textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                }}
              >
                Join Us Today
              </Typography>
            </Box>

            <Slide direction="up" in timeout={600}>
              <Paper
                elevation={24}
                sx={{
                  p: 4,
                  backdropFilter: 'blur(20px)',
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(255, 107, 157, 0.2)',
                  boxShadow: '0 20px 60px rgba(255, 107, 157, 0.3)',
                }}
              >
                {error && (
                  <Fade in>
                    <Alert
                      severity="error"
                      sx={{
                        mb: 3,
                        borderRadius: 2,
                        backgroundColor: 'rgba(249, 80, 87, 0.1)',
                        border: '1px solid rgba(249, 80, 87, 0.3)',
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
                    label="Tên đăng nhập"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
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
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      },
                    }}
                  />
                  <TextField
                    margin="normal"
                    fullWidth
                    label="Họ và tên"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
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
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
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
                      background: 'linear-gradient(135deg, #EC4899 0%, #6366F1 100%)',
                      color: 'white',
                      fontWeight: 600,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #FF8BB3 0%, #7B9AFF 100%)',
                        boxShadow: '0 8px 24px rgba(255, 107, 157, 0.4)',
                      },
                    }}
                  >
                    {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                  </Button>
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="body2" sx={{ color: '#0F172A', mb: 1 }}>
                      Đã có tài khoản?
                    </Typography>
                    <Link to="/login" style={{ textDecoration: 'none' }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        sx={{
                          borderColor: '#EC4899',
                          color: '#EC4899',
                          borderWidth: 2,
                          fontWeight: 600,
                          backgroundColor: 'white',
                          '&:hover': {
                            borderColor: '#D94A7A',
                            backgroundColor: '#FFF0F5',
                            borderWidth: 2,
                            transform: 'scale(1.02)',
                          },
                        }}
                      >
                        Đăng nhập
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

export default Register;
