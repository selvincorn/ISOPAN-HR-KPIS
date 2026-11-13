import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      navigate('/')
    } catch (err) {
      if (err instanceof Error) {
        setError(
          err.message === 'Invalid login credentials'
            ? 'Credenciales inválidas. Verifique su correo y contraseña.'
            : `Error al iniciar sesión: ${err.message}`
        )
      } else {
        setError('Ocurrió un error inesperado.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel – branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1e3a5f] via-[#1e3a5f] to-[#0f1f33] relative overflow-hidden items-center justify-center">
        {/* Decorative circles */}
        <div className="absolute top-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-white/5" />
        <div className="absolute bottom-[-15%] left-[-10%] h-[600px] w-[600px] rounded-full bg-white/5" />
        <div className="absolute top-[40%] left-[20%] h-[200px] w-[200px] rounded-full bg-white/5" />

        <div className="relative z-10 px-12 text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center justify-center h-24 w-24 rounded-2xl bg-white p-3 shadow-xl">
              <img src="/isopan-logo.png" alt="ISOPAN" className="h-full w-full object-contain" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">ISOPAN HR KPI</h1>
          <p className="text-lg text-blue-200 mb-2">Sistema de Control de Indicadores</p>
          <p className="text-sm text-blue-300/70 max-w-sm mx-auto">
            Monitoreo integral de indicadores clave de desempeño del departamento de Recursos Humanos
          </p>
          <div className="mt-12 flex items-center justify-center gap-8 text-blue-200/60 text-xs uppercase tracking-widest">
            <span>Planilla</span>
            <span className="h-1 w-1 rounded-full bg-blue-200/40" />
            <span>KPIs</span>
            <span className="h-1 w-1 rounded-full bg-blue-200/40" />
            <span>Reportes</span>
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl shadow-sm border border-gray-100">
              <div className="h-10 w-10 flex items-center justify-center">
                <img src="/isopan-logo.png" alt="ISOPAN" className="h-full w-full object-contain" />
              </div>
              <span className="text-xl font-bold text-[#1e3a5f]">ISOPAN HR KPI</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h2>
              <p className="mt-1 text-sm text-gray-500">
                Ingrese sus credenciales para acceder al sistema
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Correo Electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@empresa.com"
                required
                autoComplete="email"
              />

              <div className="relative">
                <Input
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#1e3a5f] focus:ring-[#1e3a5f]"
                  />
                  <span className="text-sm text-gray-600">Recordarme</span>
                </label>
              </div>

              <Button
                type="submit"
                isLoading={loading}
                className="w-full"
                size="lg"
              >
                Iniciar Sesión
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} ISOPAN — Sistema de Control de KPIs
          </p>
        </div>
      </div>
    </div>
  )
}
