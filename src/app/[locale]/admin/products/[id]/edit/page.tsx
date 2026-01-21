'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AdminService, CategoryService } from '@/lib/api/services';
import { ProductStatus } from '@/types/product';
import { FileCategory } from '@/types/productFile';
import type { Category } from '@/types/category';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { useProductFiles } from '@/hooks/useProductFiles';
import { useR2Upload } from '@/hooks/useR2Upload';
import { ProductFileManager } from '@/components/admin/ProductFileManager';
import type { Product } from '@/types';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    priceInBRL: '',
    freeProduct: false,
    category: '',
    subcategory: '',
    tags: '',
    software: '',
    fileFormats: '',
    polyCount: '',
    textureResolution: '',
    rigged: false,
    animated: false,
    pbr: false,
    uvMapped: false,
    dimensionsWidth: '',
    dimensionsHeight: '',
    dimensionsDepth: '',
    featured: false,
    status: ProductStatus.DRAFT,
  });

  // Hooks para gerenciamento de arquivos R2
  const {
    allFiles,
    newFiles,
    existingFiles,
    filesToDelete,
    loading: filesLoading,
    loadError: filesLoadError,
    selectedThumbnailId,
    errors: fileErrors,
    addFiles,
    removeFile,
    updateCategory,
    reorderFiles,
    setThumbnail,
    validateFiles,
    getImages,
    refetch: refetchFiles,
  } = useProductFiles({ productId });

  const {
    uploadFiles,
    uploading,
    progress: uploadProgressMap,
    overallProgress,
  } = useR2Upload();

  // Buscar categorias do backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await CategoryService.getCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        setError('Erro ao carregar categorias.');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data: Product = await AdminService.getProductById(productId);
      setProduct(data);

      setFormData({
        title: data.title,
        description: data.description || '',
        shortDescription: data.shortDescription || '',
        priceInBRL: data.priceInBRL.toString(),
        freeProduct: data.freeProduct || false,
        category: String(data.category),
        subcategory: data.subcategory || '',
        tags: data.tags?.join(', ') || '',
        software: data.software?.join(', ') || '',
        fileFormats: data.fileFormats?.join(', ') || '',
        polyCount: data.polyCount?.toString() || '',
        textureResolution: data.textureResolution || '',
        rigged: data.rigged || false,
        animated: data.animated || false,
        pbr: data.pbr || false,
        uvMapped: data.uvMapped || false,
        dimensionsWidth: data.dimensionsInMeters?.width?.toString() || '',
        dimensionsHeight: data.dimensionsInMeters?.height?.toString() || '',
        dimensionsDepth: data.dimensionsInMeters?.depth?.toString() || '',
        featured: data.featured || false,
        status: data.status as ProductStatus,
      });
    } catch (err) {
      console.error('Erro ao carregar produto:', err);
      setError('Erro ao carregar produto');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar arquivos (existentes + novos)
    const validationErrors = validateFiles();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setSaving(true);

    try {
      // 1. Deletar arquivos marcados para remoção
      if (filesToDelete.length > 0) {
        await Promise.all(
          filesToDelete.map(fileId =>
            AdminService.deleteProductFile(productId, fileId)
          )
        );
      }

      // 2. Determinar thumbnail URL
      let newThumbnailUrl = product?.thumbnailUrl;

      // 3. Se houver novos arquivos, fazer upload ao R2
      let uploadedFiles: Awaited<ReturnType<typeof uploadFiles>> = [];

      if (newFiles.length > 0) {
        // Upload de arquivos ao R2 (apenas novos)
        uploadedFiles = await uploadFiles(
          productId,
          newFiles.filter(f => f.file).map(f => f.file!)
        );

        // Reordenar imagens conforme a ordem definida pelo usuário
        const imageFiles = allFiles.filter(f => f.category === FileCategory.IMAGE);
        if (imageFiles.length > 0) {
          // Mapear IDs na ordem correta (existentes + novos)
          const orderedImageIds = imageFiles
            .map(localFile => {
              if (localFile.source === 'server') {
                return localFile.serverId || localFile.id;
              } else {
                // Para arquivos novos, encontrar o ID retornado pelo upload
                const uploaded = uploadedFiles.find(uf => uf.fileName === localFile.fileName);
                return uploaded?.id;
              }
            })
            .filter((id): id is string => id !== undefined);

          if (orderedImageIds.length > 0) {
            await AdminService.reorderFiles(productId, orderedImageIds);
          }
        }
      }

      // 4. Determinar thumbnail URL baseado na seleção
      if (selectedThumbnailId) {
        // Verificar se é de arquivo existente ou novo
        const selectedFile = allFiles.find(f => f.id === selectedThumbnailId);

        if (selectedFile) {
          if (selectedFile.source === 'server') {
            // Usar URL pública do arquivo existente
            newThumbnailUrl = selectedFile.publicUrl;
          } else {
            // Buscar URL do arquivo recém-uploadado
            const uploadedThumbnail = uploadedFiles.find(
              uf => uf.fileName === selectedFile.fileName
            );
            if (uploadedThumbnail?.publicUrl) {
              newThumbnailUrl = uploadedThumbnail.publicUrl;
            }
          }
        }
      }

      // 5. Calcular tamanho total dos arquivos
      // Arquivos existentes que não foram removidos + novos uploadados
      const existingFilesSize = existingFiles
        .filter(f => !filesToDelete.includes(f.serverId || f.id))
        .reduce((sum, f) => sum + f.fileSize, 0);

      const newFilesSize = uploadedFiles.reduce((sum, f) => sum + f.fileSize, 0);
      const totalFileSize = existingFilesSize + newFilesSize;

      // 6. Atualizar dados do produto
      const productData = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription,
        priceInBRL: formData.freeProduct ? 0 : parseFloat(formData.priceInBRL),
        freeProduct: formData.freeProduct,
        category: formData.category,
        subcategory: formData.subcategory || null,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        software: formData.software.split(',').map(s => s.trim()).filter(s => s),
        fileFormats: formData.fileFormats.split(',').map(f => f.trim()).filter(f => f),
        polyCount: formData.polyCount ? parseInt(formData.polyCount) : null,
        textureResolution: formData.textureResolution || null,
        rigged: formData.rigged,
        animated: formData.animated,
        pbr: formData.pbr,
        uvMapped: formData.uvMapped,
        dimensionWidth: formData.dimensionsWidth ? parseFloat(formData.dimensionsWidth) : null,
        dimensionHeight: formData.dimensionsHeight ? parseFloat(formData.dimensionsHeight) : null,
        dimensionDepth: formData.dimensionsDepth ? parseFloat(formData.dimensionsDepth) : null,
        featured: formData.featured,
        status: formData.status,
        thumbnailUrl: newThumbnailUrl,
        fileSize: totalFileSize,
      };

      await AdminService.updateProduct(productId, productData);
      setError(''); // Garantir que não há erro antes de redirecionar
      router.push('/admin/products');
    } catch (err: unknown) {
      console.error('Erro ao atualizar produto:', err);
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      setError(errorObj.response?.data?.message || errorObj.message || 'Erro ao atualizar produto');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireAdmin={true}>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-foreground/20 border-t-primary"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!product) {
    return (
      <ProtectedRoute requireAdmin={true}>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
          <Button onClick={() => router.push('/admin/products')} variant="outline" size="lg">
            Voltar para Produtos
          </Button>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              onClick={() => router.back()}
              className="px-4 py-2 border border-foreground/20 rounded hover:border-primary"
              variant="outline"
            >
              ← Voltar
            </Button>
            <h1 className="text-4xl font-bold">Editar Produto</h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500 text-red-500 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div className="border border-foreground/20 rounded p-6">
              <h2 className="text-2xl font-bold mb-4">Informações Básicas</h2>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 font-semibold">Título *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-background border border-foreground/20 rounded focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold">Descrição Curta *</label>
                  <input
                    type="text"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleChange}
                    required
                    maxLength={200}
                    className="w-full px-4 py-2 bg-background border border-foreground/20 rounded focus:outline-none focus:border-primary"
                  />
                  <span className="text-sm text-foreground/60">{formData.shortDescription.length}/200</span>
                </div>

                <div>
                  <label className="block mb-2 font-semibold">Descrição Completa *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-2 bg-background border border-foreground/20 rounded focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-semibold">
                      Preço (BRL) {!formData.freeProduct && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="number"
                      name="priceInBRL"
                      value={formData.priceInBRL}
                      onChange={handleChange}
                      required={!formData.freeProduct}
                      step="0.01"
                      min="0"
                      disabled={formData.freeProduct}
                      className="w-full px-4 py-2 bg-background border border-foreground/20 rounded focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-semibold">Categoria *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      disabled={loadingCategories}
                      className="w-full px-4 py-2 bg-background border border-foreground/20 rounded focus:outline-none focus:border-primary [&>option]:bg-white [&>option]:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingCategories ? (
                        <option>Carregando categorias...</option>
                      ) : (
                        categories.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="freeProduct"
                      checked={formData.freeProduct}
                      onChange={handleChange}
                      className="w-5 h-5"
                    />
                    <span className="font-semibold">Produto Gratuito</span>
                  </label>
                  {formData.freeProduct && (
                    <div className="mt-2 ml-7 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Produto gratuito:</strong> Disponível sem custo, mas <strong>requer login</strong> para download.
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                        Usuários precisarão estar autenticados para adicionar à biblioteca e fazer download.
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block mb-2 font-semibold">Subcategoria</label>
                  <input
                    type="text"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-background border border-foreground/20 rounded focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold">Tags (separadas por vírgula)</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="ex: realista, low-poly, medieval"
                    className="w-full px-4 py-2 bg-background border border-foreground/20 rounded focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Especificações Técnicas */}
            <div className="border border-foreground/20 rounded p-6">
              <h2 className="text-2xl font-bold mb-4">Especificações Técnicas</h2>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 font-semibold">Software Compatível (separado por vírgula) *</label>
                  <input
                    type="text"
                    name="software"
                    value={formData.software}
                    onChange={handleChange}
                    required
                    placeholder="ex: Blender, Maya, 3ds Max"
                    className="w-full px-4 py-2 bg-background border border-foreground/20 rounded focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold">Formatos de Arquivo (separados por vírgula) *</label>
                  <input
                    type="text"
                    name="fileFormats"
                    value={formData.fileFormats}
                    onChange={handleChange}
                    required
                    placeholder="ex: FBX, OBJ, BLEND"
                    className="w-full px-4 py-2 bg-background border border-foreground/20 rounded focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-semibold">Contagem de Polígonos</label>
                    <input
                      type="number"
                      name="polyCount"
                      value={formData.polyCount}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-2 bg-background border border-foreground/20 rounded focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-semibold">Resolução da Textura</label>
                    <input
                      type="text"
                      name="textureResolution"
                      value={formData.textureResolution}
                      onChange={handleChange}
                      placeholder="ex: 4K, 2048x2048"
                      className="w-full px-4 py-2 bg-background border border-foreground/20 rounded focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="rigged"
                      checked={formData.rigged}
                      onChange={handleChange}
                      className="w-5 h-5"
                    />
                    <span>Rigged (com esqueleto)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="animated"
                      checked={formData.animated}
                      onChange={handleChange}
                      className="w-5 h-5"
                    />
                    <span>Animado</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="pbr"
                      checked={formData.pbr}
                      onChange={handleChange}
                      className="w-5 h-5"
                    />
                    <span>PBR (Physically Based Rendering)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="uvMapped"
                      checked={formData.uvMapped}
                      onChange={handleChange}
                      className="w-5 h-5"
                    />
                    <span>UV Mapped</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Dimensões */}
            <div className="border border-foreground/20 rounded p-6">
              <h2 className="text-2xl font-bold mb-4">Dimensões (em metros)</h2>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2 font-semibold">Largura</label>
                  <input
                    type="number"
                    name="dimensionsWidth"
                    value={formData.dimensionsWidth}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full px-4 py-2 bg-background border border-foreground/20 rounded focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold">Altura</label>
                  <input
                    type="number"
                    name="dimensionsHeight"
                    value={formData.dimensionsHeight}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full px-4 py-2 bg-background border border-foreground/20 rounded focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold">Profundidade</label>
                  <input
                    type="number"
                    name="dimensionsDepth"
                    value={formData.dimensionsDepth}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full px-4 py-2 bg-background border border-foreground/20 rounded focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Arquivos do Produto */}
            <div className="border border-foreground/20 rounded p-6">
              <h2 className="text-2xl font-bold mb-4">Arquivos do Produto</h2>

              <p className="text-sm text-foreground/60 mb-4">
                Gerencie os arquivos do produto. Arquivos existentes são marcados com um indicador azul.
                Você pode adicionar novos arquivos ou remover os existentes.
              </p>

              <ProductFileManager
                files={allFiles}
                onFilesAdded={addFiles}
                onRemoveFile={removeFile}
                onCategoryChange={updateCategory}
                onReorder={reorderFiles}
                selectedThumbnailId={selectedThumbnailId}
                onThumbnailSelect={setThumbnail}
                uploadProgress={uploadProgressMap ? new Map(uploadProgressMap.map((item) => [item.fileName, { progress: item.progress, status: item.status, error: item.error }])) : undefined}
                disabled={uploading || saving}
                errors={fileErrors}
                existingFilesLoading={filesLoading}
                existingFilesError={filesLoadError}
                onRetryLoadExisting={refetchFiles}
              />

              {/* Info sobre arquivos marcados para remoção */}
              {filesToDelete.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>{filesToDelete.length} arquivo(s)</strong> marcado(s) para remoção.
                    Serão deletados ao salvar.
                  </p>
                </div>
              )}

              {uploading && (
                <div className="mt-4">
                  <p className="text-sm text-foreground/70 mb-2">
                    Upload em progresso: {overallProgress}%
                  </p>
                  <div className="w-full bg-foreground/20 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="border border-foreground/20 rounded p-6">
              <h2 className="text-2xl font-bold mb-4">Configurações</h2>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 font-semibold">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-background border border-foreground/20 rounded focus:outline-none focus:border-primary [&>option]:bg-white [&>option]:text-black"
                  >
                    {Object.values(ProductStatus).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span>Produto em destaque</span>
                </label>
              </div>
            </div>

            {/* Informações Somente Leitura */}
            <div className="border border-foreground/20 rounded p-6 bg-foreground/5">
              <h2 className="text-2xl font-bold mb-4">Informações do Sistema</h2>
              <div className="space-y-2 text-foreground/80">
                <p><strong>SKU:</strong> {product.sku}</p>
                <p><strong>ID:</strong> {product.id}</p>
                {product.createdAt && (
                  <p><strong>Criado em:</strong> {new Date(product.createdAt).toLocaleString('pt-BR')}</p>
                )}
                {product.updatedAt && (
                  <p><strong>Atualizado em:</strong> {new Date(product.updatedAt).toLocaleString('pt-BR')}</p>
                )}
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-4">
              <Button
                type="button"
                onClick={() => router.back()}
                variant="outline"
                size="lg"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving || uploading || filesLoading}
                loading={saving || uploading}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                {uploading ? `Fazendo upload... ${overallProgress}%` : saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
