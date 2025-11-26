import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Criar cliente Supabase com Service Role (admin)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verificar se usuário logado é super admin
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    
    if (!user) {
      throw new Error('Não autenticado')
    }

    // Verificar se é super admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_super_admin')
      .eq('id', user.id)
      .single()

    if (!profile || !profile.is_super_admin) {
      throw new Error('Apenas super admins podem atualizar organizações')
    }

    // Pegar dados do request
    const { 
      organizationId,
      name,
      isActive
    } = await req.json()

    console.log('📋 Atualizando organização:', organizationId)

    // Atualizar organização
    const { data: orgData, error: orgError } = await supabaseAdmin
      .from('organizations')
      .update({
        name,
        is_active: isActive,
      })
      .eq('id', organizationId)
      .select()
      .single()

    if (orgError) {
      console.error('❌ Erro ao atualizar organização:', orgError)
      throw orgError
    }

    console.log('✅ Organização atualizada')

    return new Response(
      JSON.stringify({
        success: true,
        organization: orgData,
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
        error: error.message || 'Erro ao atualizar organização',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

