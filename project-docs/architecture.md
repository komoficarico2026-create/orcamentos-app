# Arquitetura do Sistema

## Visão Geral

O projeto é um SaaS de gestão de orçamentos para prestadores de serviço como:

- eletricistas
- encanadores
- pintores
- mecânicos
- serviços gerais

O sistema permite:

- cadastro de clientes
- criação de orçamentos
- controle financeiro
- gestão de serviços

---

# Stack Tecnológica

## Frontend

Next.js 15  
App Router  
TypeScript  
TailwindCSS

## Backend

Supabase

- Authentication
- PostgreSQL
- Row Level Security

## Deploy

Vercel

---

# Arquitetura Multi-Tenant

Cada usuário possui seus próprios dados.

A separação ocorre via:
