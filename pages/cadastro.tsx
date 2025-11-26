import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ProductFormData {
  name: string;
  unitPrice: string;
  kgPrice: string;
  category: string;
  description: string;
  images: File[];
}

interface PaymentMethod {
  id: string;
  name: string;
  fee: number;
}

export default function CadastroPage() {
  const [activeTab, setActiveTab] = useState<'produtos' | 'taxas'>('produtos');
  
  // Estados para produtos (US1)
  const [productFormData, setProductFormData] = useState<ProductFormData>({
    name: '',
    unitPrice: '',
    kgPrice: '',
    category: '',
    description: '',
    images: []
  });
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Estados para taxas de pagamento (US2)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);

  // Função utilitária para tratar erros unknown
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return 'Erro desconhecido';
  };

  // Carregar métodos de pagamento existentes conforme especificação
  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const response = await fetch('/api/payment');
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data);
      } else {
        // Métodos padrão conforme especificação: crédito 4,79%, débito 1,99%, Pix 0%
        setPaymentMethods([
          { id: '1', name: 'Dinheiro', fee: 0 },
          { id: '2', name: 'Pix', fee: 0 },
          { id: '3', name: 'Cartão de Débito', fee: 1.99 },
          { id: '4', name: 'Cartão de Crédito', fee: 4.79 }
        ]);
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Erro ao carregar métodos de pagamento:', errorMessage);
      // Fallback para métodos padrão conforme especificação
      setPaymentMethods([
        { id: '1', name: 'Dinheiro', fee: 0 },
        { id: '2', name: 'Pix', fee: 0 },
        { id: '3', name: 'Cartão de Débito', fee: 1.99 },
        { id: '4', name: 'Cartão de Crédito', fee: 4.79 }
      ]);
    } finally {
      setIsLoadingPayments(false);
    }
  };

  // US1 - Cadastrar produto (corrigido sem jsonError)
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingProduct(true);
    
    try {
      // Determinar qual preço usar (prioridade para unitPrice)
      const finalPrice = productFormData.unitPrice || productFormData.kgPrice;
      
      if (!finalPrice) {
        alert('Informe pelo menos um preço (unidade ou quilo)');
        return;
      }
  
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: productFormData.name,
          unitPrice: productFormData.unitPrice ? parseFloat(productFormData.unitPrice) : null,
          kgPrice: productFormData.kgPrice ? parseFloat(productFormData.kgPrice) : null,
          category: productFormData.category,
          description: productFormData.description,
        }),
      });
  
      if (response.ok) {
        setProductFormData({
          name: '',
          unitPrice: '',
          kgPrice: '',
          category: '',
          description: '',
          images: []
        });
        setUploadedImages([]);
        alert('Produto cadastrado com sucesso!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Erro ao cadastrar produto');
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Erro ao cadastrar produto:', error);
      alert('Erro ao cadastrar produto: ' + errorMessage);
    } finally {
      setIsSubmittingProduct(false);
    }
  };
  const handleProductCancel = () => {
    setProductFormData({
      name: '',
      unitPrice: '',
      kgPrice: '',
      category: '',
      description: '',
      images: []
    });
    setUploadedImages([]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).slice(0, 5).map(file => URL.createObjectURL(file));
      setUploadedImages([...uploadedImages, ...newImages].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const updatePaymentFee = (id: string, newFee: number) => {
    setPaymentMethods(prev => 
      prev.map(method => 
        method.id === id ? { ...method, fee: newFee } : method
      )
    );
  };

  // US2 - Cadastrar/editar taxas por forma de pagamento (corrigido sem jsonError)
  const saveTaxes = async () => {
    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentMethods),
      });

      if (response.ok) {
        alert('Taxas salvas com sucesso!');
        loadPaymentMethods(); // Recarregar para confirmar
        console.log('Taxas de pagamento salvas com sucesso');
      } else {
        // Tratamento de erro sem variável não utilizada
        let errorMessage = `Erro ${response.status}: `;
        
        try {
          const errorData = await response.json();
          if (errorData && typeof errorData === 'object' && 'message' in errorData) {
            errorMessage += errorData.message;
          } else {
            errorMessage += response.statusText || 'Erro ao salvar taxas';
          }
        } catch {
          // Removido jsonError - sem variável não utilizada
          errorMessage += response.statusText || 'Erro ao processar resposta';
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Erro ao salvar taxas:', error);
      alert('Erro ao salvar taxas: ' + errorMessage);
    }
  };

  return (
    <div style={{ 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
      margin: 0, 
      padding: 0, 
      background: '#f8f9fa',
      minHeight: '100vh'
    }}>
      {/* Header seguindo padrão Fast caixa */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e9ecef',
        padding: '12px 32px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🛒</span>
            <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#212529', margin: 0 }}>Fast caixa</h1>
          </div>
          
          <nav style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
            <Link href="/" style={{ 
              textDecoration: 'none', 
              color: '#6c757d', 
              fontWeight: 400, 
              fontSize: '14px'
            }}>
              Página inicial
            </Link>
            <Link href="/vender" style={{ 
              textDecoration: 'none', 
              color: '#6c757d', 
              fontWeight: 400, 
              fontSize: '14px'
            }}>
              Vender
            </Link>
            <Link href="/produtos" style={{ 
              textDecoration: 'none', 
              color: '#6c757d', 
              fontWeight: 400, 
              fontSize: '14px'
            }}>
              Produtos
            </Link>
            <Link href="/cadastro" style={{ 
              textDecoration: 'none', 
              color: '#007bff', 
              fontWeight: 500, 
              fontSize: '14px'
            }}>
              Cadastro
            </Link>
            <Link href="/estatisticas" style={{ 
              textDecoration: 'none', 
              color: '#6c757d', 
              fontWeight: 400, 
              fontSize: '14px'
            }}>
              Estatísticas
            </Link>
            <Link href="/configuracoes" style={{ 
              textDecoration: 'none', 
              color: '#6c757d', 
              fontWeight: 400, 
              fontSize: '14px'
            }}>
              Configurações
            </Link>
            <Link href="/ajuda" style={{ 
              textDecoration: 'none', 
              color: '#6c757d', 
              fontWeight: 400, 
              fontSize: '14px'
            }}>
              Ajuda
            </Link>
          </nav>
        </div>
      </header>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 32px' }}>
        {/* Tabs para US1 e US2 */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '20px', borderBottom: '2px solid #e9ecef' }}>
            <button
              onClick={() => setActiveTab('produtos')}
              style={{
                padding: '12px 24px',
                background: 'none',
                border: 'none',
                fontSize: '16px',
                fontWeight: 600,
                color: activeTab === 'produtos' ? '#007bff' : '#6c757d',
                borderBottom: activeTab === 'produtos' ? '3px solid #007bff' : '3px solid transparent',
                cursor: 'pointer'
              }}
            >
              Cadastrar Produtos
            </button>
            <button
              onClick={() => setActiveTab('taxas')}
              style={{
                padding: '12px 24px',
                background: 'none',
                border: 'none',
                fontSize: '16px',
                fontWeight: 600,
                color: activeTab === 'taxas' ? '#007bff' : '#6c757d',
                borderBottom: activeTab === 'taxas' ? '3px solid #007bff' : '3px solid transparent',
                cursor: 'pointer'
              }}
            >
              Configurar Taxas
            </button>
          </div>
        </div>

        {/* Conteúdo das Tabs */}
        {activeTab === 'produtos' ? (
          // US1 - Cadastrar produto
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
            overflow: 'hidden'
          }}>
            <form onSubmit={handleProductSubmit}>
              <div style={{ padding: '40px' }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 600,
                  color: '#212529',
                  marginBottom: '32px'
                }}>
                  Registrar novo produto
                </h2>

                <div style={{
                  border: '2px solid #e9ecef',
                  borderRadius: '12px',
                  padding: '32px',
                  marginBottom: '32px',
                  background: '#f8f9fa'
                }}>
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: '24px'
                  }}>
                    {/* Nome do produto */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#495057',
                        marginBottom: '8px'
                      }}>
                        Nome do produto *
                      </label>
                      <input
                        type="text"
                        value={productFormData.name}
                        onChange={(e) => setProductFormData({...productFormData, name: e.target.value})}
                        placeholder="Ex: Café orgânico - 500g"
                        required
                        style={{
                          width: '45%',
                          padding: '12px 16px',
                          border: '1px solid #ced4da',
                          borderRadius: '8px',
                          fontSize: '14px',
                          backgroundColor: 'white'
                        }}
                      />
                    </div>

                    {/* Preços conforme especificação */}
                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: '1fr auto 1fr',
                      gap: '20px',
                      alignItems: 'end'
                    }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#495057',
                          marginBottom: '8px'
                        }}>
                          Preço da unidade
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={productFormData.unitPrice}
                          onChange={(e) => setProductFormData({...productFormData, unitPrice: e.target.value})}
                          placeholder="10.00"
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid #ced4da',
                            borderRadius: '8px',
                            fontSize: '14px',
                            backgroundColor: 'white'
                          }}
                        />
                      </div>

                      <div style={{ 
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#6c757d',
                        textAlign: 'center' as const
                      }}>
                        OU
                      </div>

                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#495057',
                          marginBottom: '8px'
                        }}>
                          Preço do quilo
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={productFormData.kgPrice}
                          onChange={(e) => setProductFormData({...productFormData, kgPrice: e.target.value})}
                          placeholder="20.00"
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid #ced4da',
                            borderRadius: '8px',
                            fontSize: '14px',
                            backgroundColor: 'white'
                          }}
                        />
                      </div>
                    </div>

                    {/* Categoria e Descrição */}
                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '20px'
                    }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#495057',
                          marginBottom: '8px'
                        }}>
                          Categoria *
                        </label>
                        <select
                          value={productFormData.category}
                          onChange={(e) => setProductFormData({...productFormData, category: e.target.value})}
                          required
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid #ced4da',
                            borderRadius: '8px',
                            fontSize: '14px',
                            backgroundColor: 'white',
                            color: productFormData.category ? '#212529' : '#6c757d'
                          }}
                        >
                          <option value="">Selecione a categoria</option>
                          <option value="Hortaliças">Hortaliças</option>
                          <option value="Frutas e legumes">Frutas e legumes</option>
                          <option value="Laticínios">Laticínios</option>
                          <option value="Produtos naturais">Produtos naturais</option>
                          <option value="Bebidas">Bebidas</option>
                          <option value="Lanches">Lanches</option>
                        </select>
                      </div>
                      
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#495057',
                          marginBottom: '8px'
                        }}>
                          Descrição do produto
                        </label>
                        <textarea
                          value={productFormData.description}
                          onChange={(e) => setProductFormData({...productFormData, description: e.target.value})}
                          placeholder="Descrição detalhada do produto..."
                          rows={3}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid #ced4da',
                            borderRadius: '8px',
                            fontSize: '14px',
                            resize: 'vertical' as const,
                            backgroundColor: 'white'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seção de Imagens */}
                <div style={{
                  border: '2px solid #e9ecef',
                  borderRadius: '12px',
                  padding: '32px',
                  background: '#f8f9fa'
                }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#212529',
                    marginBottom: '24px'
                  }}>
                    Imagens do produto
                  </h3>

                  <div style={{
                    border: '2px dashed #adb5bd',
                    borderRadius: '12px',
                    padding: '60px 40px',
                    textAlign: 'center' as const,
                    marginBottom: '24px',
                    backgroundColor: 'white'
                  }}>
                    <div style={{
                      fontSize: '48px',
                      color: '#adb5bd',
                      marginBottom: '16px'
                    }}>
                      ☁️
                    </div>
                    <p style={{
                      fontSize: '14px',
                      color: '#6c757d',
                      marginBottom: '20px'
                    }}>
                      Clique para fazer upload (Máx 5 imagens, JPG/PNG, Máx 2MB)
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      id="imageUpload"
                    />
                    <label
                      htmlFor="imageUpload"
                      style={{
                        display: 'inline-block',
                        background: '#007bff',
                        color: 'white',
                        padding: '12px 32px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 500,
                        fontSize: '14px'
                      }}
                    >
                      Fazer upload
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    {uploadedImages.map((image, index) => (
                      <div key={index} style={{
                        position: 'relative',
                        width: '150px',
                        height: '120px',
                        border: '1px solid #dee2e6',
                        borderRadius: '8px',
                        overflow: 'hidden'
                      }}>
                        <Image 
                          src={image} 
                          alt={`Upload ${index + 1}`}
                          width={150}
                          height={120}
                          style={{
                            objectFit: 'cover' as const
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            width: '24px',
                            height: '24px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    
                    {Array.from({ length: Math.max(0, 2 - uploadedImages.length) }).map((_, index) => (
                      <div key={`placeholder-${index}`} style={{
                        width: '150px',
                        height: '120px',
                        backgroundColor: '#adb5bd',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '32px',
                        color: 'white'
                      }}>
                        🗑️
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '16px',
                padding: '32px 40px',
                borderTop: '1px solid #e9ecef'
              }}>
                <button
                  type="submit"
                  disabled={isSubmittingProduct}
                  style={{
                    flex: 1,
                    background: isSubmittingProduct ? '#6c757d' : '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '16px 32px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: isSubmittingProduct ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSubmittingProduct ? 'Cadastrando...' : 'Finalizar cadastro'}
                </button>
                
                <button
                  type="button"
                  onClick={handleProductCancel}
                  disabled={isSubmittingProduct}
                  style={{
                    flex: 1,
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '16px 32px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: isSubmittingProduct ? 'not-allowed' : 'pointer',
                    opacity: isSubmittingProduct ? 0.7 : 1
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        ) : (
          // US2 - Cadastrar/editar taxas por forma de pagamento
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '40px' }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 600,
                color: '#212529',
                marginBottom: '32px'
              }}>
                Configurar taxas por forma de pagamento
              </h2>

              <div style={{
                border: '2px solid #e9ecef',
                borderRadius: '12px',
                padding: '32px',
                background: '#f8f9fa'
              }}>
                <p style={{
                  fontSize: '14px',
                  color: '#6c757d',
                  marginBottom: '24px'
                }}>
                  Configure as taxas aplicadas no fluxo: <strong>escolher itens → escolher método de pagamento → calcular taxa/total</strong> conforme especificação.
                </p>

                {isLoadingPayments ? (
                  <div style={{
                    textAlign: 'center' as const,
                    padding: '40px',
                    color: '#6c757d'
                  }}>
                    Carregando métodos de pagamento...
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {paymentMethods.map((method) => (
                      <div key={method.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '20px',
                        background: 'white',
                        borderRadius: '8px',
                        border: '1px solid #dee2e6'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <span style={{ fontSize: '20px' }}>
                            {method.name === 'Dinheiro' ? '💵' : 
                             method.name === 'Pix' ? '📱' : 
                             method.name.includes('Débito') ? '💳' : '💎'}
                          </span>
                          <span style={{
                            fontSize: '16px',
                            fontWeight: 500,
                            color: '#212529'
                          }}>
                            {method.name}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <input
                            type="number"
                            value={method.fee}
                            onChange={(e) => updatePaymentFee(method.id, parseFloat(e.target.value) || 0)}
                            step="0.01"
                            min="0"
                            max="100"
                            style={{
                              width: '80px',
                              padding: '8px 12px',
                              border: '1px solid #ced4da',
                              borderRadius: '4px',
                              fontSize: '14px',
                              textAlign: 'center' as const
                            }}
                          />
                          <span style={{
                            fontSize: '14px',
                            color: '#6c757d'
                          }}>
                            %
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Informações conforme especificação do projeto */}
                <div style={{
                  marginTop: '24px',
                  padding: '16px',
                  background: '#e7f3ff',
                  borderRadius: '8px',
                  border: '1px solid #b3d9ff'
                }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#0056b3',
                    marginBottom: '8px'
                  }}>
                    ℹ️ Taxas padrão conforme especificação:
                  </h4>
                  <ul style={{
                    fontSize: '12px',
                    color: '#0056b3',
                    margin: 0,
                    paddingLeft: '20px'
                  }}>
                    <li><strong>Crédito:</strong> 4,79% - conforme especificação MVP</li>
                    <li><strong>Débito:</strong> 1,99% - conforme especificação MVP</li>
                    <li><strong>Pix:</strong> 0% - conforme especificação MVP</li>
                    <li><strong>Dinheiro:</strong> 0% - sem taxa</li>
                  </ul>
                  <p style={{
                    fontSize: '11px',
                    color: '#0056b3',
                    marginTop: '8px',
                    marginBottom: 0
                  }}>
                    * Usadas no fluxo de venda para cálculo automático do total líquido final.
                  </p>
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '16px',
              padding: '32px 40px',
              borderTop: '1px solid #e9ecef'
            }}>
              <button
                onClick={saveTaxes}
                disabled={isLoadingPayments}
                style={{
                  flex: 1,
                  background: isLoadingPayments ? '#6c757d' : '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: isLoadingPayments ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoadingPayments ? 'Carregando...' : 'Salvar configurações'}
              </button>
              
              <button
                onClick={loadPaymentMethods}
                disabled={isLoadingPayments}
                style={{
                  flex: 1,
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: isLoadingPayments ? 'not-allowed' : 'pointer'
                }}
              >
                Restaurar padrões
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{
        textAlign: 'center' as const,
        padding: '20px',
        color: '#6c757d',
        fontSize: '12px',
        borderTop: '1px solid #e9ecef',
        marginTop: '40px'
      }}>
        © 2023 Fast caixa. All rights reserved.
      </footer>
    </div>
  );
}