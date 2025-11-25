import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  price: number;
  category?: string;
  description?: string;
}

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          category: formData.category || null,
          description: formData.description || null
        })
      });

      if (response.ok) {
        const newProduct = await response.json();
        setProducts([newProduct, ...products]);
        setFormData({ name: '', price: '', category: '', description: '' });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
    }
  };

  const deleteProduct = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setProducts(products.filter(p => p.id !== id));
        }
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Hortaliças': '#28a745',
      'Frutas e legumes': '#fd7e14', 
      'Laticínios': '#17a2b8',
      'Produtos naturais': '#6f42c1',
      'Bebidas': '#007bff',
      'Lanches': '#dc3545'
    };
    return colors[category] || '#6c757d';
  };

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', margin: 0, padding: 0, background: '#f8f9fa' }}>
      {/* Header EXATO como Fast caixa */}
      <header style={{
        background: 'white',
        borderBottom: '2px solid #e9ecef',
        padding: '20px 40px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '28px' }}>🛒</span>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#212529', margin: 0 }}>Feirinha</h1>
          </div>
          
          <nav style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
            <Link href="/" style={{ 
              textDecoration: 'none', 
              color: '#495057', 
              fontWeight: 500, 
              fontSize: '16px', 
              padding: '12px 0',
              borderBottom: '3px solid transparent'
            }}>
              Página inicial
            </Link>
            <Link href="/vender" style={{ 
              textDecoration: 'none', 
              color: '#495057', 
              fontWeight: 500, 
              fontSize: '16px', 
              padding: '12px 0',
              borderBottom: '3px solid transparent'
            }}>
              Vender
            </Link>
            <Link href="/produtos" style={{ 
              textDecoration: 'none', 
              color: '#007bff', 
              fontWeight: 500, 
              fontSize: '16px', 
              padding: '12px 0',
              borderBottom: '3px solid #007bff'
            }}>
              Produtos
            </Link>
            <Link href="/estatisticas" style={{ 
              textDecoration: 'none', 
              color: '#495057', 
              fontWeight: 500, 
              fontSize: '16px', 
              padding: '12px 0',
              borderBottom: '3px solid transparent'
            }}>
              Estatísticas
            </Link>
            <Link href="/configuracoes" style={{ 
              textDecoration: 'none', 
              color: '#495057', 
              fontWeight: 500, 
              fontSize: '16px', 
              padding: '12px 0',
              borderBottom: '3px solid transparent'
            }}>
              Configurações
            </Link>
            <Link href="/ajuda" style={{ 
              textDecoration: 'none', 
              color: '#495057', 
              fontWeight: 500, 
              fontSize: '16px', 
              padding: '12px 0',
              borderBottom: '3px solid transparent'
            }}>
              Ajuda
            </Link>
          </nav>

          <div style={{
            width: '45px',
            height: '45px',
            background: '#007bff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: '16px'
          }}>
            U
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px' }}>
        {/* Seção principal EXATA como Fast caixa */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e9ecef',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          overflow: 'hidden'
        }}>
          {/* Header da seção */}
          <div style={{
            padding: '25px 30px',
            borderBottom: '2px solid #f8f9fa',
            background: '#fdfdfd',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#212529',
              margin: 0
            }}>
              Catálogo de produtos
            </h2>
            
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              style={{
                background: '#007bff',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,123,255,0.3)'
              }}
            >
              {showAddForm ? 'Cancelar' : '+ Adicionar Produto'}
            </button>
          </div>

          {/* Formulário de adicionar produto (se ativo) */}
          {showAddForm && (
            <div style={{
              padding: '30px',
              background: '#f8f9fa',
              borderBottom: '2px solid #e9ecef'
            }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '20px', alignItems: 'end', flexWrap: 'wrap' }}>
                <div style={{ minWidth: '200px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#495057', marginBottom: '5px' }}>
                    Nome do produto *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ced4da',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                    placeholder="Ex: Alface crespa orgânica"
                  />
                </div>
                
                <div style={{ minWidth: '150px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#495057', marginBottom: '5px' }}>
                    Categoria
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ced4da',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Selecionar...</option>
                    <option value="Hortaliças">Hortaliças</option>
                    <option value="Frutas e legumes">Frutas e legumes</option>
                    <option value="Laticínios">Laticínios</option>
                    <option value="Produtos naturais">Produtos naturais</option>
                    <option value="Bebidas">Bebidas</option>
                    <option value="Lanches">Lanches</option>
                  </select>
                </div>
                
                <div style={{ minWidth: '120px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#495057', marginBottom: '5px' }}>
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ced4da',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                    placeholder="0,00"
                  />
                </div>
                
                <div style={{ minWidth: '250px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#495057', marginBottom: '5px' }}>
                    Descrição
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ced4da',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                    placeholder="Descrição do produto..."
                  />
                </div>
                
                <button
                  type="submit"
                  style={{
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Adicionar
                </button>
              </form>
            </div>
          )}

          {/* Tabela de produtos EXATA como Fast caixa */}
          {isLoading ? (
            <div style={{ textAlign: 'center' as const, padding: '80px 40px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                border: '5px solid #f3f3f3',
                borderTop: '5px solid #007bff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 20px'
              }}></div>
              <p>Carregando produtos...</p>
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center' as const, padding: '80px 40px' }}>
              <div style={{ fontSize: '80px', marginBottom: '20px', opacity: 0.6 }}>📦</div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#212529', marginBottom: '12px' }}>
                Nenhum produto cadastrado
              </h3>
              <p style={{ color: '#6c757d', fontSize: '16px', marginBottom: '30px', lineHeight: 1.6 }}>
                Adicione seu primeiro produto para começar a vender
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                style={{
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '12px 25px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '15px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,123,255,0.3)'
                }}
              >
                Adicionar Primeiro Produto
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' as const }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: '15px' }}>
                <thead>
                  <tr>
                    <th style={{
                      background: '#f8f9fa',
                      padding: '18px 25px',
                      textAlign: 'left' as const,
                      fontWeight: 700,
                      color: '#495057',
                      fontSize: '16px',
                      borderBottom: '2px solid #e9ecef'
                    }}>
                      Nome do produto
                    </th>
                    <th style={{
                      background: '#f8f9fa',
                      padding: '18px 25px',
                      textAlign: 'left' as const,
                      fontWeight: 700,
                      color: '#495057',
                      fontSize: '16px',
                      borderBottom: '2px solid #e9ecef'
                    }}>
                      Categoria
                    </th>
                    <th style={{
                      background: '#f8f9fa',
                      padding: '18px 25px',
                      textAlign: 'left' as const,
                      fontWeight: 700,
                      color: '#495057',
                      fontSize: '16px',
                      borderBottom: '2px solid #e9ecef'
                    }}>
                      Preço
                    </th>
                    <th style={{
                      background: '#f8f9fa',
                      padding: '18px 25px',
                      textAlign: 'left' as const,
                      fontWeight: 700,
                      color: '#495057',
                      fontSize: '16px',
                      borderBottom: '2px solid #e9ecef'
                    }}>
                      Descrição
                    </th>
                    <th style={{
                      background: '#f8f9fa',
                      padding: '18px 25px',
                      textAlign: 'center' as const,
                      fontWeight: 700,
                      color: '#495057',
                      fontSize: '16px',
                      borderBottom: '2px solid #e9ecef'
                    }}>
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td style={{
                        padding: '20px 25px',
                        borderBottom: '1px solid #f8f9fa',
                        color: '#212529',
                        fontWeight: 600,
                        fontSize: '16px'
                      }}>
                        {product.name}
                      </td>
                      <td style={{
                        padding: '20px 25px',
                        borderBottom: '1px solid #f8f9fa'
                      }}>
                        {product.category ? (
                          <span style={{
                            display: 'inline-block',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: 500,
                            background: getCategoryColor(product.category),
                            color: 'white'
                          }}>
                            {product.category}
                          </span>
                        ) : (
                          <span style={{ color: '#6c757d', fontSize: '14px' }}>Sem categoria</span>
                        )}
                      </td>
                      <td style={{
                        padding: '20px 25px',
                        borderBottom: '1px solid #f8f9fa',
                        color: '#28a745',
                        fontWeight: 700,
                        fontSize: '16px'
                      }}>
                        {formatCurrency(product.price)}
                      </td>
                      <td style={{
                        padding: '20px 25px',
                        borderBottom: '1px solid #f8f9fa',
                        color: '#495057',
                        fontSize: '14px',
                        maxWidth: '300px'
                      }}>
                        {product.description || 'Sem descrição'}
                      </td>
                      <td style={{
                        padding: '20px 25px',
                        borderBottom: '1px solid #f8f9fa',
                        textAlign: 'center' as const
                      }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            style={{
                              background: '#6c757d',
                              color: 'white',
                              border: 'none',
                              padding: '8px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            style={{
                              background: '#6c757d',
                              color: 'white',
                              border: 'none',
                              padding: '8px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                            title="Duplicar"
                          >
                            📋
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            style={{
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              padding: '8px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                            title="Excluir"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Ações */}
        <div style={{ marginTop: '30px', textAlign: 'center' as const }}>
          <Link href="/" style={{
            display: 'inline-block',
            padding: '12px 25px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '15px',
            background: 'white',
            color: '#007bff',
            border: '2px solid #007bff',
            marginRight: '15px'
          }}>
            ← Voltar ao Dashboard
          </Link>
          
          <Link href="/vender" style={{
            display: 'inline-block',
            padding: '12px 25px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '15px',
            background: '#007bff',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0,123,255,0.3)'
          }}>
            💰 Fazer Nova Venda
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}