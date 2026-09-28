# APTUS — Front-end GitHub Pages v1.0

Esta é a versão **100% front-end** do APTUS, preparada para rodar diretamente no GitHub Pages, sem Flask, Python ou PostgreSQL durante a demonstração.

## O que funciona nesta versão

- Login separado de cliente/usuário e nutricionista
- Cadastro demonstrativo de usuário
- 3 abas principais do cliente: Início, Descobrir e Nutricionista
- Feed vertical inspirado em Reels
- Publicações, curtidas, comentários e compartilhamento demonstrativo
- Receitas com detalhes
- Lista de nutricionistas
- Mensagens simuladas em tempo real local
- Painel do nutricionista
- Perfil editável
- Persistência no `localStorage` do navegador
- Responsividade para celular e desktop

## Contas de demonstração

Cliente:
- e-mail: `lucas@aptus.com`
- senha: `Aptus@123`

Nutricionista:
- e-mail: `marina@aptus.com`
- senha: `Aptus@123`

## Publicação no GitHub Pages

Coloque estes três arquivos na pasta `frontend-pages/` que o workflow já publica:

- `index.html`
- `styles.css`
- `app.js`

Esta versão é deliberadamente estática. Dados são armazenados no navegador e **não equivalem a autenticação/banco de dados de produção**. Para a versão completa, o front-end pode ser conectado à API Flask/PostgreSQL existente no projeto APTUS.
