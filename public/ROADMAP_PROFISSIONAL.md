# Roadmap Profissional

## Fase 1 (curto prazo, alto impacto)
- `Desfazer` em ações destrutivas (excluir item, limpar comprados, excluir categoria).
- Melhorias de responsividade mobile com foco em fluxo principal.
- Tratamento consistente de estado vazio e carregamento.
- Correção de sincronização de autenticação em páginas de dados (ex: estatísticas).

## Fase 2 (médio prazo, robustez de produto)
- Múltiplas listas de compra (semanal, mensal, eventos).
- Filtros persistentes por usuário e preferências de visualização.
- Histórico de preços por item com tendência.
- Ações em lote (marcar, excluir, mover categoria).
- Lixeira com restauração (soft delete).

## Fase 3 (avançado, nível produção)
- Camada de serviços/repositórios para separar UI da lógica de dados.
- Regras Firestore com validação de schema e testes de segurança.
- Testes automatizados (unitário + E2E).
- Telemetria de erro (Sentry) e métricas de uso.
- Offline-first com fila de sincronização e resolução de conflito.
