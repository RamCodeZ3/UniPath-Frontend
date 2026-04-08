-- ============================================================================
-- FIX: Arreglar RLS para tabla documents
-- ============================================================================

-- 1. DESHABILITAR RLS TEMPORALMENTE para borrar políticas
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;

-- 2. BORRAR TODAS LAS POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "delete_data" ON public.documents;
DROP POLICY IF EXISTS "insert_data" ON public.documents;
DROP POLICY IF EXISTS "update_data" ON public.documents;
DROP POLICY IF EXISTS "Users can manage own documents" ON public.documents;

-- 3. HABILITAR RLS DE NUEVO
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 4. CREAR NUEVA POLÍTICA QUE FUNCIONA: SELECT (Lectura)
-- Los usuarios pueden VER sus propios documentos
CREATE POLICY "users_can_select_own_documents" ON public.documents
  FOR SELECT
  USING (
    profile_id IN (
      SELECT profiles.id
      FROM profiles
      WHERE profiles.user_id = auth.uid()
    )
  );

-- 5. CREAR POLÍTICA: INSERT (Insertar)
-- Los usuarios pueden CREAR documentos para sus propios perfiles
CREATE POLICY "users_can_insert_own_documents" ON public.documents
  FOR INSERT
  WITH CHECK (
    profile_id IN (
      SELECT profiles.id
      FROM profiles
      WHERE profiles.user_id = auth.uid()
    )
  );

-- 6. CREAR POLÍTICA: UPDATE (Actualizar)
-- Los usuarios pueden EDITAR documentos en sus propios perfiles
CREATE POLICY "users_can_update_own_documents" ON public.documents
  FOR UPDATE
  USING (
    profile_id IN (
      SELECT profiles.id
      FROM profiles
      WHERE profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    profile_id IN (
      SELECT profiles.id
      FROM profiles
      WHERE profiles.user_id = auth.uid()
    )
  );

-- 7. CREAR POLÍTICA: DELETE (Borrar)
-- Los usuarios pueden ELIMINAR documentos de sus propios perfiles
CREATE POLICY "users_can_delete_own_documents" ON public.documents
  FOR DELETE
  USING (
    profile_id IN (
      SELECT profiles.id
      FROM profiles
      WHERE profiles.user_id = auth.uid()
    )
  );

-- Verificar que las políticas fueron creadas correctamente
SELECT tablename, policyname, command, qual, with_check
FROM pg_policies
WHERE tablename = 'documents'
ORDER BY policyname;
