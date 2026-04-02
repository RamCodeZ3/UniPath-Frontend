import { useState } from 'react';
import { z } from 'zod';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = () => {
    setErrorMessage('');
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0] === 'email') fieldErrors.email = issue.message;
        if (issue.path[0] === 'password') fieldErrors.password = issue.message;
      });
      setErrors(fieldErrors);
    }
  };

  const handleEmailBlur = () => {
    if (email) {
      const result = loginSchema.shape.email.safeParse(email);
      if (!result.success) {
        setErrors((prev) => ({ ...prev, email: result.error.issues[0].message }));
      } else {
        setErrors((prev) => ({ ...prev, email: undefined }));
      }
    }
  };

  const handleGoogleSignIn = () => {
    setErrorMessage('Google sign-in not implemented');
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-20 w-48 h-48 bg-indigo-400/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-32 left-1/4 w-24 h-24 bg-purple-400/20 rounded-full blur-lg"></div>
          <svg className="absolute -bottom-10 -left-10 w-40 h-40 text-blue-400/20" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="currentColor"/>
          </svg>
          <svg className="absolute top-1/4 -right-5 w-20 h-20 text-indigo-300/20" viewBox="0 0 100 100">
            <rect x="10" y="10" width="80" height="80" rx="10" fill="currentColor"/>
          </svg>
          <svg className="absolute bottom-1/4 right-1/4 w-16 h-16 text-purple-400/20" viewBox="0 0 100 100">
            <polygon points="50,10 90,90 10,90" fill="currentColor"/>
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center">
            <img src="/favicon/web-app-manifest-512x512.png" alt="UniPath" className="w-12 h-12 rounded-lg bg-white p-1" />
            <h1 className="text-4xl font-bold text-white ml-3">UniPath</h1>
          </div>
          <p className="text-blue-100 mt-2">Tu camino académico empieza aquí</p>
        </div>
        
        <div className="space-y-6 relative z-10">
          <h2 className="text-3xl font-semibold text-white leading-tight">
            Planifica tu camino<br />académico con confianza
          </h2>
          <p className="text-blue-100 text-lg max-w-md">
            Sigue tus cursos, visualiza tu progreso y alcanza tus metas educativas con nuestra herramienta de planificación integral.
          </p>
          
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-white">10K+</div>
              <div className="text-blue-200 text-sm">Estudiantes</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-white">50+</div>
              <div className="text-blue-200 text-sm">Universidades</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-white">95%</div>
              <div className="text-blue-200 text-sm">Satisfacción</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-blue-100 relative z-10">
          <div className="flex -space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-400 border-2 border-white flex items-center justify-center text-white font-medium">J</div>
            <div className="w-10 h-10 rounded-full bg-indigo-400 border-2 border-white flex items-center justify-center text-white font-medium">M</div>
            <div className="w-10 h-10 rounded-full bg-purple-400 border-2 border-white flex items-center justify-center text-white font-medium">S</div>
          </div>
          <p className="text-sm">Únete a más de 10,000 estudiantes planeando su futuro</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute -top-10 -right-10 w-40 h-40 text-blue-100/50" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="currentColor"/>
          </svg>
          <svg className="absolute top-1/4 -left-5 w-20 h-20 text-indigo-100/30" viewBox="0 0 100 100">
            <rect x="10" y="10" width="80" height="80" rx="10" fill="currentColor"/>
          </svg>
          <svg className="absolute bottom-20 -right-5 w-16 h-16 text-purple-100/30" viewBox="0 0 100 100">
            <polygon points="50,10 90,90 10,90" fill="currentColor"/>
          </svg>
          <div className="absolute bottom-10 left-10 w-32 h-32 bg-blue-200/10 rounded-full blur-xl"></div>
          <div className="absolute top-1/3 right-10 w-24 h-24 bg-indigo-200/10 rounded-full blur-lg"></div>
        </div>

        <div className="w-full max-w-xs relative z-10">
          <div className="flex justify-center mb-4">
            <img src="/favicon/web-app-manifest-512x512.png" alt="UniPath" className="w-40 h-40" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Qué bueno verte de vuelta!</h2>
          <p className="text-gray-500 mb-8">Ingresa tus datos pa' entrar a tu cuenta</p>

          {errorMessage && (
            <Message severity="error" text={errorMessage} className="mb-6 w-full" />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <div className="relative">
                <i className="pi pi-envelope absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" style={{ fontSize: '14px' }} />
                <InputText
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={handleEmailBlur}
                  placeholder="tucorreo@ejemplo.com"
                  className={`w-full pl-10 py-3 ${errors.email ? 'p-invalid' : ''}`}
                />
              </div>
              {errors.email && (
                <small className="text-red-500 text-xs flex items-center gap-1">
                  <i className="pi pi-exclamation-circle text-xs" />
                  {errors.email}
                </small>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="relative">
                <i className="pi pi-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" style={{ fontSize: '14px' }} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Escribe tu contraseña"
                  className={`p-inputtext p-component w-full pl-10 pr-8 py-3 ${errors.password ? 'p-invalid' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  <i className={`pi ${showPassword ? 'pi-eye-slash' : 'pi-eye'}`} style={{ fontSize: '14px' }} />
                </button>
              </div>
              {errors.password && (
                <small className="text-red-500 text-xs flex items-center gap-1">
                  <i className="pi pi-exclamation-circle text-xs" />
                  {errors.password}
                </small>
              )}
              <div className="text-right">
                <a href="#" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            <Button
              type="submit"
              label="Entrar"
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 border-none text-white font-semibold py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            />

            <div className="text-center text-sm text-gray-500">
              ¿No tienes cuenta?{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
                Regístrate gratis
              </a>
            </div>
          </form>

          <div className="relative my-4 overflow-hidden">
            <svg viewBox="0 0 500 30" className="w-full h-8 text-gray-200" preserveAspectRatio="none">
              <path
                d="M0,15 Q25,0 50,15 T100,15 T150,15 T200,15 T250,15 T300,15 T350,15 T400,15 T450,15 T500,15 L500,30 L0,30 Z"
                fill="currentColor"
              />
              <path
                d="M0,20 Q25,5 50,20 T100,20 T150,20 T200,20 T250,20 T300,20 T350,20 T400,20 T450,20 T500,20 L500,30 L0,30 Z"
                fill="currentColor"
                opacity="0.5"
              />
            </svg>
            <div className="absolute inset-0 flex justify-center">
              <span className="bg-gray-50 px-4 text-sm text-gray-500">o continúa con</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continuar con Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
