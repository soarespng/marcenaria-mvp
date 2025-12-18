-- Desabilitar confirmação de email para desenvolvimento
-- ATENÇÃO: Este script deve ser executado APENAS em ambiente de desenvolvimento
-- 
-- Para executar este script no Supabase Dashboard:
-- 1. Vá em Authentication > Settings
-- 2. Desabilite "Enable email confirmations"
-- 3. Ou execute o comando abaixo no SQL Editor

-- Este comando atualiza usuários existentes para confirmar o email automaticamente
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- Para criar novos usuários de teste diretamente no banco (sem precisar de confirmação de email):
-- USE O FORMULÁRIO DE CADASTRO DA APLICAÇÃO - o Supabase cuida da criptografia automaticamente
-- Ou crie via SQL Editor no Supabase Dashboard (apenas para testes):

-- Exemplo de como criar um usuário de teste manualmente:
-- 1. Vá no SQL Editor do Supabase Dashboard
-- 2. Execute este comando (substitua os valores):

/*
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'teste@marcenaria.com',
  crypt('senha123', gen_salt('bf')), -- Senha será 'senha123'
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"nome":"Usuário Teste"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Depois, crie o perfil na tabela usuarios:
INSERT INTO public.usuarios (id, nome, email, created_at)
SELECT id, 'Usuário Teste', 'teste@marcenaria.com', NOW()
FROM auth.users
WHERE email = 'teste@marcenaria.com';
*/
