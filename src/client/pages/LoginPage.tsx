import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from '@emotion/styled';
import api from '../services/api';

interface FormData {
  username: string;
  password: string;
}

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2c3e50;
  padding: 20px;
`;

const FormContainer = styled.div`
  background-color: #fff;
  padding: 32px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h1`
  color: #2c3e50;
  text-align: center;
  margin-bottom: 24px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  color: #34495e;
  font-weight: bold;
`;

const Input = styled.input`
  padding: 12px;
  border: 2px solid #bdc3c7;
  border-radius: 4px;
  font-size: 1em;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const Button = styled.button`
  padding: 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #2980b9;
  }

  &:disabled {
    background-color: #bdc3c7;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  text-align: center;
  margin-bottom: 16px;
`;

const RegisterLink = styled(Link)`
  display: block;
  text-align: center;
  margin-top: 16px;
  color: #3498db;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

interface LoginPageProps {
  onLogin: (token: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { token } = await api.auth.login(formData.username, formData.password);
      api.setAuthToken(token);
      onLogin(token);
      navigate('/lobby');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.username.trim() !== '' && formData.password.trim() !== '';

  return (
    <PageContainer>
      <FormContainer>
        <Title>Login to Sequence</Title>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="username">Username</Label>
            <Input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </FormGroup>
          <Button type="submit" disabled={!isFormValid || isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </Form>
        <RegisterLink to="/register">
          Don't have an account? Register here
        </RegisterLink>
      </FormContainer>
    </PageContainer>
  );
};

export default LoginPage; 