import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import bcrypt from 'bcryptjs'

interface User {
  id: string
  email: string
  password?: string
  name: string
  role: string
  provider?: string
  providerId?: string
}

const users: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    password: '$2a$12$LVvQGfIi6Br8GFlsUshWS.umYgEaT7srddOmQnEOh.b09sXiXr/m6', // "password"
    name: 'Admin User',
    role: 'admin',
  },
  {
    id: '2',
    email: 'user@example.com',
    password: '$2a$12$LVvQGfIi6Br8GFlsUshWS.umYgEaT7srddOmQnEOh.b09sXiXr/m6', // "password"
    name: 'Regular User',
    role: 'user',
  },
]

passport.serializeUser((user: any, done) => {
  done(null, user.id)
})

passport.deserializeUser((id: string, done) => {
  const user = users.find(u => u.id === id)
  done(null, user || null)
})

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email: string, password: string, done) => {
    try {
      const user = users.find(u => u.email === email)
      
      if (!user) {
        return done(null, false, { message: 'Invalid email or password' })
      }

      if (!user.password) {
        return done(null, false, { message: 'Please use OAuth to sign in' })
      }

      const isPasswordValid = await bcrypt.compare(password, user.password)
      
      if (!isPasswordValid) {
        return done(null, false, { message: 'Invalid email or password' })
      }

      return done(null, user)
    } catch (error) {
      return done(error)
    }
  }
))

export default passport
