import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

// Função para obter headers CORS
const getCorsHeaders = (origin: string | null) => {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
  }
  return headers
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    })
  }

  try {
    console.log('🚀 Iniciando create-organization Edge Function...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    if (!supabaseUrl) {
      console.error('❌ SUPABASE_URL não configurado no ambiente da Edge Function')
      throw new Error('Configuração do Supabase ausente (SUPABASE_URL).')
    }

    // IMPORTANTE:
    // Para criar usuários via Admin API e contornar RLS com segurança, precisamos do Service Role.
    // Esse secret PRECISA estar configurado no projeto Supabase (Edge Function Secrets).
    if (!serviceRoleKey) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY não configurado nos Secrets da Edge Function')
      throw new Error(
        'Configuração do Supabase ausente (SUPABASE_SERVICE_ROLE_KEY). ' +
          'Configure este secret no Supabase e redeploy a função.'
      )
    }

    // Criar cliente Supabase com Service Role (admin)
    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verificar se usuário logado é super admin
    const authHeader = req.headers.get('Authorization')
    console.log('🔑 Authorization header presente:', !!authHeader);
    
    if (!authHeader) {
      console.error('❌ Nenhum header de autorização encontrado');
      return new Response(
        JSON.stringify({ error: 'Não autenticado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }
    
    const token = authHeader.replace('Bearer ', '')
    console.log('🔑 Token extraído (primeiros 20 chars):', token.substring(0, 20) + '...');
    
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    console.log('👤 Resultado getUser - user:', user?.id);
    console.log('👤 Resultado getUser - error:', userError);
    
    if (userError) {
      console.error('❌ Erro ao verificar usuário:', userError);
      return new Response(
        JSON.stringify({ error: 'Não autenticado: ' + userError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }
    
    if (!user) {
      console.error('❌ Usuário não encontrado no token');
      return new Response(
        JSON.stringify({ error: 'Não autenticado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    console.log('✅ Usuário autenticado:', user.id);

    // Verificar se é super admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_super_admin')
      .eq('id', user.id)
      .single()

    console.log('👤 Profile encontrado:', profile);
    console.log('👤 Profile error:', profileError);
    console.log('👤 Is super admin:', profile?.is_super_admin);

    if (!profile || !profile.is_super_admin) {
      console.error('❌ Usuário não é super admin');
      return new Response(
        JSON.stringify({ error: 'Apenas super admins podem criar organizações' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }
    
    console.log('✅ Verificação de super admin OK');

    // Pegar dados do request
    const { 
      organizationName, 
      adminEmail, 
      adminPassword, 
      adminFullName,
      isActive = true,
      subscriptionPlan = 'plano_a'
    } = await req.json()

    console.log('📋 Criando organização:', organizationName)

    // 1. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    })

    if (authError) {
      console.error('❌ Erro ao criar usuário:', authError)
      throw authError
    }

    if (!authData.user) {
      throw new Error('Erro ao criar usuário')
    }

    console.log('✅ Usuário criado:', authData.user.id)

    // 2. Gerar slug
    const slug = organizationName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() + '-' + Date.now()

    console.log('📝 Slug gerado:', slug)

    // 3. Criar organização usando função SQL que contorna RLS
    const { data: orgDataArray, error: orgError } = await supabaseAdmin
      .rpc('create_organization', {
        p_name: organizationName,
        p_slug: slug,
        p_is_active: isActive,
        p_subscription_plan: subscriptionPlan,
        p_settings: {}
      })

    if (orgError) {
      console.error('❌ Erro ao criar organização:', orgError)
      // Limpar: deletar usuário criado
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      throw orgError
    }

    if (!orgDataArray || orgDataArray.length === 0) {
      console.error('❌ Organização não foi criada')
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      throw new Error('Erro ao criar organização')
    }

    const orgData = orgDataArray[0]

    console.log('✅ Organização criada:', orgData.id)

    // 4. Criar perfil do admin
    const { error: profileInsertError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        organization_id: orgData.id,
        full_name: adminFullName,
        role: 'admin',
        is_super_admin: false,
        is_active: true,
      })

    if (profileInsertError) {
      console.error('❌ Erro ao criar perfil:', profileInsertError)
      // Limpar: deletar organização e usuário
      await supabaseAdmin.from('organizations').delete().eq('id', orgData.id)
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      throw profileInsertError
    }

    console.log('✅ Perfil criado')

    // 5. Criar settings padrão
    const { error: settingsError } = await supabaseAdmin
      .from('settings')
      .insert({
        organization_id: orgData.id,
        clinic_name: organizationName,
        doctor_name: adminFullName,
        subscription_plan: 'premium',
      })

    if (settingsError) {
      console.error('❌ Erro ao criar settings:', settingsError)
      // Limpar: deletar tudo
      await supabaseAdmin.from('profiles').delete().eq('id', authData.user.id)
      await supabaseAdmin.from('organizations').delete().eq('id', orgData.id)
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      throw settingsError
    }

    console.log('✅ Settings criadas')
    console.log('🎉 Organização criada com sucesso!')

    return new Response(
      JSON.stringify({
        success: true,
        organization: orgData,
        admin: {
          id: authData.user.id,
          email: adminEmail,
          full_name: adminFullName,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Erro geral:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Erro ao criar organização',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
