'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminService } from '@/lib/api/services';
import { ProductCategory, ProductStatus } from '@/types/product';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { useProductFiles } from '@/hooks/useProductFiles';
import { useR2Upload } from '@/hooks/useR2Upload';
import { ProductFileManager } from '@/components/admin/ProductFileManager';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    priceInBRL: '',
    freeProduct: false,
    category: ProductCategory.PROPS,
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
    files,
    selectedThumbnailId,
    errors: fileErrors,
    addFiles,
    removeFile,
    updateCategory,
    setThumbnail,
    validateFiles,
    getImages,
  } = useProductFiles();

  const {
    uploadFiles,
    uploading,
    progress: uploadProgressMap,
    overallProgress,
  } = useR2Upload();

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

    // 1. Validar arquivos
    const validationErrors = validateFiles();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setLoading(true);
    let createdProduct: any = null; // Para poder deletar em caso de erro

    try {
      // 2. Criar produto vazio (sem arquivos)
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
        fileSize: 0, // Será atualizado depois
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
        thumbnailUrl: null, // Será atualizado depois
      };

      createdProduct = await AdminService.createProduct(productData);
      const productId = createdProduct.id;

      // 3. Upload de arquivos ao R2
      const uploadedFiles = await uploadFiles(
        productId,
        files.map(f => f.file)
      );

      // 4. Determinar thumbnail URL
      const thumbnailFile = uploadedFiles.find(
        uf => files.find(f => f.id === selectedThumbnailId)?.file.name === uf.fileName
      );

      if (!thumbnailFile) {
        throw new Error('Erro ao determinar thumbnail');
      }

      // 5. Atualizar produto com thumbnailUrl e fileSize total
      const totalFileSize = uploadedFiles.reduce((sum, f) => sum + f.fileSize, 0);

      // TODO: Obter R2_PUBLIC_URL do env ou do backend
      const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://files.lumeatelier.com';

      await AdminService.updateProduct(productId, {
        thumbnailUrl: `${r2PublicUrl}/${thumbnailFile}`, // Usar r2Key para construir URL pública
        fileSize: totalFileSize,
      });

      // 6. Redirecionar
      router.push('/admin/products');
    } catch (err: any) {
      console.error('Erro ao criar produto:', err);

      // Se criou o produto mas TODOS os arquivos falharam, deletar o produto órfão
      if (err.message?.includes('Falha no upload de todos os arquivos') && createdProduct?.id) {
        try {
          console.log('Deletando produto órfão devido a falha total no upload...');
          await AdminService.deleteProduct(createdProduct.id);
          setError('Falha no upload de todos os arquivos. Produto não foi criado. Verifique sua conexão e tente novamente.');
        } catch (deleteErr) {
          console.error('Erro ao deletar produto órfão:', deleteErr);
          setError('Erro no upload de arquivos e não foi possível limpar o produto criado. Contate o administrador.');
        }
      } else {
        setError(err.response?.data?.message || err.message || 'Erro ao criar produto');
      }
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-4xl font-bold">Novo Produto</h1>
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
                      className="w-full px-4 py-2 bg-background border border-foreground/20 rounded focus:outline-none focus:border-primary [&>option]:bg-white [&>option]:text-black"
                    >
                      {Object.values(ProductCategory).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
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

              <ProductFileManager
                files={files}
                onFilesAdded={addFiles}
                onRemoveFile={removeFile}
                onCategoryChange={updateCategory}
                selectedThumbnailId={selectedThumbnailId}
                onThumbnailSelect={setThumbnail}
                uploadProgress={uploadProgressMap ? new Map(uploadProgressMap.map((item) => [item.fileName, { progress: item.progress, status: item.status, error: item.error }])) : undefined}
                disabled={uploading || loading}
                errors={fileErrors}
              />

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
                disabled={loading || uploading}
                loading={loading || uploading}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                {uploading ? `Fazendo upload... ${overallProgress}%` : loading ? 'Criando produto...' : 'Criar Produto'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
