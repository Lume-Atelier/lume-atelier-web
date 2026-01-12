# Hero Background Images

Esta pasta contém as imagens de background que serão exibidas na hero section da homepage.

## Como Adicionar Imagens

1. **Nomenclatura**: As imagens devem seguir o padrão `hero-X.extensão`, onde X é um número sequencial começando em 1.
   - Exemplos: `hero-1.jpg`, `hero-2.jpg`, `hero-3.png`, `hero-4.webp`

2. **Formatos Suportados**:
   - `.jpg` / `.jpeg`
   - `.png`
   - `.webp`

3. **Resolução Recomendada**:
   - Largura mínima: 1920px
   - Altura mínima: 1080px
   - Proporção: 16:9 ou similar
   - Qualidade: Alta resolução para manter qualidade em telas grandes

4. **Otimização**:
   - Mantenha o tamanho do arquivo razoável (< 500KB se possível)
   - Use WebP para melhor compressão e qualidade
   - Evite imagens excessivamente grandes (> 2MB)

## Quantidade de Imagens

- **Mínimo**: 1 imagem (funcionará como imagem estática)
- **Máximo**: Ilimitado (o sistema suporta até 100 imagens)
- **Recomendado**: 5-10 imagens para variedade sem sobrecarregar

## Configuração de Rotação

O intervalo de troca entre imagens pode ser configurado em:
`src/config/hero.config.ts`

```typescript
ROTATION_INTERVAL: 3600000, // 1 hora em milissegundos
```

Valores comuns:
- 5 minutos: 300000
- 1 hora: 3600000
- 1 dia: 86400000

## Exemplo de Estrutura

```
hero-backgrounds/
├── hero-1.jpg    ← Cozinha renderizada
├── hero-2.webp   ← Sala de estar
├── hero-3.jpg    ← Quarto
├── hero-4.png    ← Banheiro
└── hero-5.jpg    ← Escritório
```

## Notas Importantes

- As imagens são carregadas automaticamente server-side (sem requisições HTTP no cliente)
- Após adicionar novas imagens, recarregue a página para vê-las (cache é gerenciado pelo Next.js)
- O overlay escuro é aplicado automaticamente sobre as imagens para garantir legibilidade do texto
- Se nenhuma imagem for encontrada, a hero section usará apenas o overlay sobre o background padrão
- **Otimização**: O sistema lê diretamente do filesystem, evitando centenas de requisições HTTP
