# Padrões de Código e Estrutura

## Organização de Pastas

- `public/` contém todos os arquivos acessíveis pelo navegador.
- `public/js/` scripts JavaScript organizados por contexto.
- `public/js/pages/` scripts específicos de cada página.
- `public/css/` estilos globais e de componentes.
- `public/css/pages/` estilos específicos de cada página.
- `public/pages/` páginas HTML da aplicação.
- `public/assets/` imagens, ícones e outros assets.
- `docs/` documentação e arquivos de referência.

## Padrões de Código

- Usar nomes de variáveis e funções descritivos (em português).
- Funções utilitárias centralizadas em `js/utils.js`.
- Cada página deve carregar seu script em `js/pages/*` e seu CSS em `css/pages/*`.
- Evitar código duplicado e preferir funções reutilizáveis.
- Sempre tratar erros e exibir feedback ao usuário.
- Usar `const` e `let` ao invés de `var`.
- Preferir arrow functions para callbacks simples.

## Acessibilidade

- Utilizar atributos ARIA em elementos interativos.
- Garantir contraste adequado de cores.
- Permitir navegação por teclado em todos os fluxos.
- Fornecer feedback visual e textual para ações importantes.

## Testes

- Recomenda-se criar testes unitários para funções críticas.
- Testes de integração para fluxos principais (login, cadastro, CRUD de itens/categorias).
- Utilizar ferramentas como Jest para testes JS.

## Boas Práticas

- Documentar funções complexas com comentários.
- Manter o README atualizado com instruções de uso e estrutura.
- Revisar e remover código morto ou não utilizado.

---

Para dúvidas ou sugestões, consulte a pasta `docs/` ou abra uma issue.
