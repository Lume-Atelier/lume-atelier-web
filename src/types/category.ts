/**
 * Tipos relacionados a categorias de produtos
 * A única fonte de verdade é o backend (/categories endpoint)
 */

/**
 * Categoria de produto retornada pela API
 * Corresponde a CategoryResponse no backend
 */
export interface Category {
  value: string; // Valor do enum (ex: CAMA_BANHO, MESAS)
  label: string; // Nome exibido (ex: "Cama e Banho", "Mesas")
}
