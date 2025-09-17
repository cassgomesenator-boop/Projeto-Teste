import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from './database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Input } from './components/ui/input';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  MoreVertical,
  Building2,
  Tag,
  Ruler
} from 'lucide-react';

const MateriaisList = () => {
  const { user } = useAuth();
  const [materiais, setMateriais] = useState([]);
  const [filteredMateriais, setFilteredMateriais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadMateriais();
  }, []);

  useEffect(() => {
    filterMateriais();
  }, [materiais, searchTerm, selectedCategory]);

  const loadMateriais = async () => {
    try {
      setLoading(true);
      const materiaisData = await db.materiais.orderBy('nome').toArray();
      setMateriais(materiaisData);
      
      // Extrair categorias únicas
      const uniqueCategories = [...new Set(materiaisData.map(m => m.categoria))].filter(Boolean);
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Erro ao carregar materiais:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMateriais = () => {
    let filtered = materiais;

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(material => 
        material.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.fornecedorPadrao.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(material => material.categoria === selectedCategory);
    }

    setFilteredMateriais(filtered);
  };

  const getCategoryColor = (categoria) => {
    const colors = {
      'Cimento': 'bg-gray-100 text-gray-800',
      'Ferro': 'bg-orange-100 text-orange-800',
      'Elétrico': 'bg-yellow-100 text-yellow-800',
      'Alvenaria': 'bg-red-100 text-red-800',
      'Hidráulico': 'bg-blue-100 text-blue-800',
      'Acabamento': 'bg-green-100 text-green-800',
      'Madeira': 'bg-amber-100 text-amber-800'
    };
    return colors[categoria] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Materiais</h1>
            <p className="text-gray-600">Catálogo de materiais de construção</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Materiais</h1>
          <p className="text-gray-600">Catálogo de materiais de construção</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Material
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nome, descrição, categoria ou fornecedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todas as Categorias</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Materiais</p>
                <p className="text-2xl font-bold text-gray-900">{materiais.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categorias</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
              <Tag className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resultados</p>
                <p className="text-2xl font-bold text-gray-900">{filteredMateriais.length}</p>
              </div>
              <Search className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fornecedores</p>
                <p className="text-2xl font-bold text-gray-900">
                  {[...new Set(materiais.map(m => m.fornecedorPadrao))].length}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Materiais */}
      {filteredMateriais.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMateriais.map((material) => (
            <Card key={material.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{material.nome}</CardTitle>
                      <CardDescription className="text-sm">
                        {material.descricao}
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Categoria */}
                <div className="flex items-center justify-between">
                  <Badge className={getCategoryColor(material.categoria)}>
                    <Tag className="mr-1 h-3 w-3" />
                    {material.categoria}
                  </Badge>
                </div>

                {/* Unidade de Medida */}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Ruler className="h-4 w-4" />
                  <span>Unidade: {material.unidadePadrao}</span>
                </div>

                {/* Fornecedor Padrão */}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Building2 className="h-4 w-4" />
                  <span className="truncate">Fornecedor: {material.fornecedorPadrao}</span>
                </div>

                {/* Data de Criação */}
                <div className="text-xs text-gray-500">
                  Cadastrado em: {new Date(material.criadoEm).toLocaleDateString('pt-BR')}
                </div>

                {/* Ações */}
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="mr-2 h-4 w-4" />
                    Ver
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedCategory !== 'all' ? 'Nenhum material encontrado' : 'Nenhum material cadastrado'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Tente ajustar os filtros de busca.' 
                : 'Comece criando seu primeiro material.'
              }
            </p>
            {(!searchTerm && selectedCategory === 'all') && (
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Material
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Busca Rápida */}
      {searchTerm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Busca Rápida</CardTitle>
            <CardDescription className="text-blue-700">
              Mostrando {filteredMateriais.length} resultado(s) para "{searchTerm}"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {filteredMateriais.slice(0, 5).map((material) => (
                <Badge key={material.id} variant="outline" className="text-blue-700 border-blue-300">
                  {material.nome}
                </Badge>
              ))}
              {filteredMateriais.length > 5 && (
                <Badge variant="outline" className="text-blue-700 border-blue-300">
                  +{filteredMateriais.length - 5} mais
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MateriaisList;

