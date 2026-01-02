import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

// TODO: Buscar do backend quando estiver pronto
async function getCategories() {
  // Placeholder - substituir por chamada real à API
  return [
    { slug: 'CHARACTERS', name: 'Characters', description: 'Personagens 3D rigged e animados', icon: '🧑', count: 0 },
    { slug: 'ENVIRONMENTS', name: 'Environments', description: 'Ambientes e cenários completos', icon: '🏞️', count: 0 },
    { slug: 'PROPS', name: 'Props', description: 'Objetos e adereços para suas cenas', icon: '📦', count: 0 },
    { slug: 'VEHICLES', name: 'Vehicles', description: 'Veículos de todos os tipos', icon: '🚗', count: 0 },
    { slug: 'ARCHITECTURE', name: 'Architecture', description: 'Arquitetura e construções', icon: '🏛️', count: 0 },
    { slug: 'NATURE', name: 'Nature', description: 'Elementos naturais (árvores, plantas, rochas)', icon: '🌳', count: 0 },
    { slug: 'FURNITURE', name: 'Furniture', description: 'Móveis e decoração', icon: '🪑', count: 0 },
    { slug: 'TEXTURES', name: 'Textures', description: 'Texturas PBR de alta qualidade', icon: '🎨', count: 0 },
    { slug: 'MATERIALS', name: 'Materials', description: 'Materiais procedurais', icon: '💎', count: 0 },
    { slug: 'OTHER', name: 'Other', description: 'Outros assets 3D', icon: '✨', count: 0 },
  ];
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-card border-b border-border py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gold-gradient mb-4">
            Categorias
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore nossa coleção de assets 3D organizados por categoria
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug.toLowerCase()}`}
                className="group"
              >
                <div className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-all hover:shadow-lg h-full">
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">{category.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition">
                        {category.name}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-3">
                        {category.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {category.count} produtos
                        </span>
                        <span className="text-primary text-sm font-medium group-hover:translate-x-1 transition-transform">
                          Ver mais →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Não encontrou o que procura?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Use nossa busca avançada para encontrar exatamente o asset que você precisa
          </p>
          <Link href="/products">
            <Button variant="outline" size="xl">
              Buscar Produtos
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
