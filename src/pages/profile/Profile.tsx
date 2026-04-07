import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';

export default function Profile() {
  const { profile, user } = useSelector((state: RootState) => state.auth);
  const userName = profile?.name || user?.user_metadata?.name || user?.user_metadata?.full_name || 'Usuario';

  return (
    <div className="bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-500 mt-1">Gestiona tu información personal</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <div className="flex flex-col items-center md:flex-row md:items-start gap-8">
            {/* Avatar Placeholder */}
            <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {userName.substring(0, 1).toUpperCase()}
            </div>

            <div className="flex-1 space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{userName}</h2>
                <p className="text-gray-500">{user?.email}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-50">
                {/* Aquí irá la información detallada más adelante */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 border-dashed flex items-center justify-center text-gray-400 italic">
                  Información adicional próximamente...
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
