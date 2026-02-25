import api from '../api'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate()
  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/home')
      if (response.status !== 201) {
        navigate('/login')
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate('/login')
      }
      console.log(err)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])
  return (
    <div className='text-3xl text-blue-500'>Home</div>
  )
}

export default Home