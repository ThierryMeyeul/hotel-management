import api from "../api/axios"


export const login = async (username: string, password: string) => {
  const response = await api.post('/accounts/login/', {
    username,
    password
  })
  return response.data
}


export const register = async (username: string, password: string, email: string, first_name: string, last_name: string, phone_number: string) => {
  const response = await api.post('/accounts/register/', {
    username,
    password,
    email,
    first_name,
    last_name,
    phone_number
  })
  return response.data
}


export const activateAccount = async (uidb64: string, token: string) => {
  const response = await api.get(`/accounts/activate/${uidb64}/${token}/`)
  return response.data
}


export const logout = async () => {
  const response = await api.post('/accounts/logout/')
  return response.data
}


export const saveToken = (token: string) => {
  localStorage.setItem('token', JSON.stringify(token));
}

export const getToken = (): string | null => {
  const token = localStorage.getItem('token');
  return token ? JSON.parse(token) : null;
} 

export const saveUserInfo = (userInfo: any) => {
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
}

export const getUserInfo = (): any | null => {
  const data = localStorage.getItem('userInfo');
  return data ? JSON.parse(data) : null;
}