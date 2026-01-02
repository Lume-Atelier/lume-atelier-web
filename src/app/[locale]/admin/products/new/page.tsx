'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminService } from '@/lib/api/services';
import { ProductCategory, ProductStatus } from '@/types/product';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    priceInBRL: '',
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

  const [productFile, setProductFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProductFile(e.target.files[0]);
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setUploadProgress(0);

    try {
      // 1. Upload do arquivo do produto
      let fileData = null;
      if (productFile) {
        fileData = await AdminService.uploadProductFile(productFile, setUploadProgress);
      }

      // 2. Upload das imagens
      let imagesData = null;
      if (imageFiles.length > 0) {
        const uploadResponse = await AdminService.uploadProductImages(imageFiles);
        imagesData = uploadResponse.images; // Array de objetos com imageOid, fileName, fileSize
      }

      // 3. Criar o produto
      const productData = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription,
        priceInBRL: parseFloat(formData.priceInBRL),
        category: formData.category,
        subcategory: formData.subcategory || null,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        software: formData.software.split(',').map(s => s.trim()).filter(s => s),
        fileFormats: formData.fileFormats.split(',').map(f => f.trim()).filter(f => f),
        fileSize: fileData?.fileSize || 0,
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
        fileOid: fileData?.fileId || null,
        fileName: fileData?.fileName || productFile?.name || null,
        // Cria URL para a primeira imagem usando o endpoint de download
        thumbnailUrl: imagesData && imagesData.length > 0
          ? `http://localhost:8080/api-lume-atelier/download/image/${imagesData[0].imageOid}`
          : null,
      };

      await AdminService.createProduct(productData);

      // Redireciona para a lista de produtos
      router.push('/admin/products');
    } catch (err: any) {
      console.error('Erro ao criar produto:', err);
      setError(err.response?.data?.message || 'Erro ao criar produto');
    } finally {
      setLoading(false);
      setUploadProgress(0);
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
                    <label className="block mb-2 font-semibold">Preço (BRL) *</label>
                    <input
                      type="number"
                      name="priceInBRL"
                      value={formData.priceInBRL}
                      onChange={handleChange}
                      required
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 bg-background border border-foreground/20 rounded focus:outline-none focus:border-primary"
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

            {/* Arquivos */}
            <div className="border border-foreground/20 rounded p-6">
              <h2 className="text-2xl font-bold mb-4">Arquivos</h2>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 font-semibold">Arquivo do Produto (.zip) *</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".zip"
                    required
                    className="w-full px-4 py-2 bg-background border border-foreground/20 rounded focus:outline-none focus:border-primary"
                  />
                  {productFile && (
                    <p className="mt-2 text-sm text-foreground/60">
                      Arquivo selecionado: {productFile.name} ({(productFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 font-semibold">Imagens do Produto *</label>
                  <input
                    type="file"
                    onChange={handleImagesChange}
                    accept="image/*"
                    multiple
                    required
                    className="w-full px-4 py-2 bg-background border border-foreground/20 rounded focus:outline-none focus:border-primary"
                  />
                  {imageFiles.length > 0 && (
                    <p className="mt-2 text-sm text-foreground/60">
                      {imageFiles.length} imagem(ns) selecionada(s)
                    </p>
                  )}
                </div>

                {uploadProgress > 0 && (
                  <div className="w-full bg-foreground/20 rounded-full h-4">
                    <div
                      className="bg-primary h-4 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
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
                disabled={loading}
                loading={loading}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                {loading ? `Criando... ${uploadProgress}%` : 'Criar Produto'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
